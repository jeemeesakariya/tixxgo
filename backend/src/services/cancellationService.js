'use strict';

const BookingModel = require('../models/booking.model');
const StatusLogModel = require('../models/bookingStatusLog.model');
const { getAdapter } = require('../suppliers/supplierGateway');
const { validateStateTransition } = require('../utils/stateValidator');
const logger = require('../utils/logger');

const AIRLINE_CHARGE = 500;
const TIXXGO_FEE = 200;

async function getCancellationPreview(bookingId) {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) {
    throw new Error(`Booking not found: ${bookingId}`);
  }
  const customerTotal = parseFloat(booking.customer_total);
  const refundAmount = customerTotal - AIRLINE_CHARGE - TIXXGO_FEE;
  return {
    airlineCharge: AIRLINE_CHARGE,
    tixxgoFee: TIXXGO_FEE,
    refundAmount,
    currentTotal: customerTotal,
  };
}

async function cancelBooking(bookingId) {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) {
    throw new Error(`Booking not found: ${bookingId}`);
  }

  if (booking.booking_status !== 'BOOKING_CONFIRMED') {
    throw new Error(
      `Cannot cancel booking in status: ${booking.booking_status}`
    );
  }

  validateStateTransition(booking.booking_status, 'CANCELLATION_REQUESTED', 'booking');
  await BookingModel.updateBookingStatus(bookingId, 'CANCELLATION_REQUESTED');
  await StatusLogModel.logTransition(
    bookingId,
    booking.booking_status,
    'CANCELLATION_REQUESTED',
    'booking',
    'Customer requested cancellation'
  );
  booking.booking_status = 'CANCELLATION_REQUESTED';

  const adapter = getAdapter(booking.supplier);
  let supplierResult;
  try {
    supplierResult = await adapter.cancelBooking(booking.supplier_pnr);
  } catch (err) {
    logger.error('Supplier cancellation error', { bookingId, error: err.message });
    throw err;
  }

  const customerTotal = parseFloat(booking.customer_total);
  const refundAmount = customerTotal - AIRLINE_CHARGE - TIXXGO_FEE;

  await BookingModel.updateCancellationData(bookingId, {
    cancellationRef: supplierResult.cancellationRef,
    airlineCharge: AIRLINE_CHARGE,
    tixxgoFee: TIXXGO_FEE,
    refundAmount,
  });

  validateStateTransition('CANCELLATION_REQUESTED', 'CANCELLED', 'booking');
  await BookingModel.updateBookingStatus(bookingId, 'CANCELLED');
  await StatusLogModel.logTransition(
    bookingId,
    'CANCELLATION_REQUESTED',
    'CANCELLED',
    'booking',
    `Supplier cancelled: ${supplierResult.cancellationRef}`
  );

  validateStateTransition(booking.payment_status, 'REFUND_PENDING', 'payment');
  await BookingModel.updatePaymentStatus(bookingId, 'REFUND_PENDING');
  await StatusLogModel.logTransition(
    bookingId,
    booking.payment_status,
    'REFUND_PENDING',
    'payment',
    `Refund of ${refundAmount} initiated`
  );

  await BookingModel.updateTicketingStatus(bookingId, 'CANCELLED');
  await StatusLogModel.logTransition(
    bookingId,
    'ISSUED',
    'CANCELLED',
    'ticketing',
    'Ticket cancelled'
  );

  return {
    booking: await BookingModel.findById(bookingId),
    cancellationRef: supplierResult.cancellationRef,
    refundAmount,
  };
}

module.exports = { getCancellationPreview, cancelBooking };
