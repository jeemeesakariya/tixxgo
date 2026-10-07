'use strict';

const express = require('express');
const Joi = require('joi');
const { validate } = require('../middleware/validate');
const { initiateBooking, confirmBooking } = require('../services/bookingService');
const { getCancellationPreview, cancelBooking } = require('../services/cancellationService');
const BookingModel = require('../models/booking.model');
const TravellerModel = require('../models/traveller.model');
const StatusLogModel = require('../models/bookingStatusLog.model');

const router = express.Router();

const initiateSchema = Joi.object({
  tixxgoResultId: Joi.string().uuid().required(),
  traveller: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    dateOfBirth: Joi.date().iso().required(),
    passportNumber: Joi.string().optional().allow('', null),
    nationality: Joi.string().optional().allow('', null),
  }).required(),
  idempotencyKey: Joi.string().required(),
});

const confirmSchema = Joi.object({
  acceptPriceChange: Joi.boolean().default(false),
});

router.post('/initiate', validate(initiateSchema), async (req, res, next) => {
  try {
    const { tixxgoResultId, traveller, idempotencyKey } = req.body;
    const result = await initiateBooking(tixxgoResultId, traveller, idempotencyKey);
    res.status(result.requiresAcceptance ? 202 : 201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.post('/:bookingId/confirm', validate(confirmSchema), async (req, res, next) => {
  try {
    const result = await confirmBooking(
      parseInt(req.params.bookingId, 10),
      req.body.acceptPriceChange
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.get('/:bookingId', async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.bookingId, 10);
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found', code: 'NOT_FOUND' });
    }
    const travellers = await TravellerModel.findByBookingId(bookingId);
    const statusLogs = await StatusLogModel.findByBookingId(bookingId);
    res.json({ success: true, booking, travellers, statusLogs });
  } catch (err) {
    next(err);
  }
});

router.post('/:bookingId/cancel/preview', async (req, res, next) => {
  try {
    const preview = await getCancellationPreview(parseInt(req.params.bookingId, 10));
    res.json({ success: true, ...preview });
  } catch (err) {
    next(err);
  }
});

router.post('/:bookingId/cancel', async (req, res, next) => {
  try {
    const result = await cancelBooking(parseInt(req.params.bookingId, 10));
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
