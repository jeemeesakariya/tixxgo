'use strict';

const express = require('express');
const Joi = require('joi');
const { validate } = require('../middleware/validate');
const { searchFlights } = require('../services/flightSearchService');
const { revalidateFare } = require('../services/revalidationService');

const router = express.Router();

const searchSchema = Joi.object({
  origin: Joi.string().length(3).uppercase().required(),
  destination: Joi.string().length(3).uppercase().required(),
  departureDate: Joi.date().iso().required(),
  adults: Joi.number().integer().min(1).required(),
  cabinClass: Joi.string().required(),
  supplier: Joi.string().default('TBO'),
});

const revalidateSchema = Joi.object({
  tixxgoResultId: Joi.string().uuid().required(),
});

router.post('/search', validate(searchSchema), async (req, res, next) => {
  try {
    const results = await searchFlights(req.body);
    res.json({ success: true, count: results.length, flights: results });
  } catch (err) {
    next(err);
  }
});

router.post('/revalidate', validate(revalidateSchema), async (req, res, next) => {
  try {
    const result = await revalidateFare(req.body.tixxgoResultId);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
