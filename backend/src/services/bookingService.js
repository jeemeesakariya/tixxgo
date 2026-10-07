'use strict';

const BookingModel = require('../models/booking.model');
const TravellerModel = require('../models/traveller.model');
const StatusLogModel = require('../models/bookingStatusLog.model');
const { revalidateFare } = require('./revalidationService');
const { processPayment } = require('./paymentService');
const { getAdapter } = require('../suppliers/supplierGateway');
const { getCachedEntry } = require('./flightSearchService');
const { generateBookingRef } = require('../utils/bookingReference');
const { validateStateTransition } = require('../utils/stateValidator');
const logger = require('../utils/logger');

async function transitionPayment(booking, newStatus, reason) {
  validateStateTransition(booking.payment_status, newStatus, 'payment');
  await BookingModel.updatePaymentStatus(booking.id, newStatus);
  await StatusLogModel.logTransition(booking.id, booking.payment_status, newStatus, 'payment', reason);
  booking.payment_status = newStatus;
}

async function transitionBooking(booking, newStatus, reason) {
  validateStateTransition(booking.booking_status, newStatus, 'booking');
  await BookingModel.updateBookingStatus(booking.id, newStatus);
  await StatusLogModel.logTransition(booking.id, booking.booking_status, newStatus, 'booking', reason);
  booking.booking_status = newStatus;
}

async function initiateBooking(tixxgoResultId, traveller, idempotencyKey) {
  const existing = await BookingModel.findByIdempotencyKey(idempotencyKey);
  if (existing) {
    const travellers = await TravellerModel.findByBookingId(existing.id);
    return { booking: existing, travellers, idempotent: true };
  }

  const revalidation = await revalidateFare(tixxgoResultId);


  const entry = getCachedEntry(tixxgoResultId);
  const { supplierResultId, supplier, supplierRaw } = entry;
  const pricing = revalidation.pricing;
  const flight = revalidation.flightDetails;

  const tixxgoRef = generateBookingRef();
  const bookingId = await BookingModel.createBooking({
    tixxgoRef,
    tixxgoResultId,
    flightNumber: flight.flightNumber,
    airline: flight.airline,
    origin: flight.origin,
    destination: flight.destination,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    baggage: flight.baggage,
    refundable: flight.refundable,
    supplier,
    supplierResultId,
    supplierCost: pricing.supplierCost,
    baseFare: pricing.baseFare,
    taxes: pricing.taxes,
    serviceFee: pricing.serviceFee,
    discount: pricing.discount,
    customerTotal: pricing.customerTotal,
    idempotencyKey,
  });

  await TravellerModel.createTraveller(bookingId, traveller);
  await StatusLogModel.logTransition(bookingId, null, 'INITIATED', 'booking', 'Booking initiated');
  await StatusLogModel.logTransition(bookingId, null, 'PAYMENT_PENDING', 'payment', 'Payment pending');

  const booking = await BookingModel.findById(bookingId);
  const travellers = await TravellerModel.findByBookingId(bookingId);

  return { booking, travellers };
}

async function confirmBooking(bookingId, acceptPriceChange = false) {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) {
    throw new Error(`Booking not found: ${bookingId}`);
  }

  if (booking.booking_status !== 'INITIATED') {
    throw new Error(`Cannot confirm booking in status: ${booking.booking_status}`);
  }

  const revalidation = await revalidateFare(booking.tixxgo_result_id);
  if (revalidation.status === 'PRICE_CHANGED' && !acceptPriceChange) {
    return { requiresAcceptance: true, revalidation };
  }

  let paymentResult;
  try {
    paymentResult = await processPayment(booking.id, booking.customer_total);
  } catch (err) {
    logger.error('Payment gateway error', { bookingId, error: err.message });
    throw err;
  }

  if (!paymentResult.success) {
    await transitionPayment(booking, 'PAYMENT_FAILED', paymentResult.error);
    await transitionBooking(booking, 'BOOKING_FAILED', paymentResult.error);
    return { booking: await BookingModel.findById(bookingId), paymentResult };
  }

  await transitionPayment(booking, 'PAYMENT_SUCCESS', `txnId: ${paymentResult.transactionId}`);
  await transitionBooking(booking, 'SUPPLIER_BOOKING', 'Payment succeeded, calling supplier');

  const entry = getCachedEntry(booking.tixxgo_result_id);
  const adapter = getAdapter(entry.supplier);

  let supplierResult;
  try {
    supplierResult = await adapter.bookFlight({
      supplierResultId: entry.supplierResultId,
      travellers: await TravellerModel.findByBookingId(bookingId),
    });
  } catch (err) {
    logger.error('Supplier booking error', { bookingId, error: err.message });
    const isTimeout = err.message.toLowerCase().includes('timeout');
    if (isTimeout) {
      await transitionBooking(booking, 'UNKNOWN', 'Supplier booking timeout');
    } else {
      await transitionBooking(booking, 'BOOKING_FAILED', err.message);
      await transitionPayment(booking, 'REFUND_PENDING', 'Supplier failed, refund initiated');
    }
    return { booking: await BookingModel.findById(bookingId), error: err.message };
  }

  if (!supplierResult.success) {
    await transitionBooking(booking, 'BOOKING_FAILED', 'Supplier returned failure');
    await transitionPayment(booking, 'REFUND_PENDING', 'Supplier failed, refund initiated');
    return { booking: await BookingModel.findById(bookingId), supplierResult };
  }

  await BookingModel.updateSupplierPnr(bookingId, supplierResult.supplierPnr);
  await transitionBooking(booking, 'BOOKING_CONFIRMED', `PNR: ${supplierResult.supplierPnr}`);
  await BookingModel.updateTicketingStatus(bookingId, 'ISSUED');
  await StatusLogModel.logTransition(bookingId, 'NOT_ISSUED', 'ISSUED', 'ticketing', 'Ticket issued on confirmation');

  return { booking: await BookingModel.findById(bookingId), supplierResult };
}

module.exports = { initiateBooking, confirmBooking };
