'use strict';

const cron = require('node-cron');
const BookingModel = require('../models/booking.model');
const StatusLogModel = require('../models/bookingStatusLog.model');
const { getAdapter } = require('../suppliers/supplierGateway');
const logger = require('../utils/logger');

async function reconcileUnknownBookings() {
  let unknownBookings;
  try {
    unknownBookings = await BookingModel.findUnknownBookings();
  } catch (err) {
    logger.error('Reconciliation: failed to fetch unknown bookings', { error: err.message });
    return;
  }

  if (unknownBookings.length === 0) {
    return;
  }

  logger.info(`Reconciliation: processing ${unknownBookings.length} unknown booking(s)`);

  for (const booking of unknownBookings) {
    try {
      const adapter = getAdapter(booking.supplier);
      const statusResult = await adapter.checkBookingStatus(booking.supplier_pnr);

      if (statusResult.status === 'CONFIRMED') {
        await BookingModel.updateBookingStatus(booking.id, 'BOOKING_CONFIRMED');
        await BookingModel.updateTicketingStatus(booking.id, 'ISSUED');
        await StatusLogModel.logTransition(
          booking.id,
          'UNKNOWN',
          'BOOKING_CONFIRMED',
          'booking',
          'Reconciliation: supplier confirmed'
        );
        await StatusLogModel.logTransition(
          booking.id,
          'NOT_ISSUED',
          'ISSUED',
          'ticketing',
          'Reconciliation: ticket issued'
        );
        logger.info(`Reconciliation: booking ${booking.tixxgo_ref} CONFIRMED`);
      } else {
        await BookingModel.updateBookingStatus(booking.id, 'BOOKING_FAILED');
        await BookingModel.updatePaymentStatus(booking.id, 'REFUND_PENDING');
        await StatusLogModel.logTransition(
          booking.id,
          'UNKNOWN',
          'BOOKING_FAILED',
          'booking',
          'Reconciliation: supplier not confirmed'
        );
        await StatusLogModel.logTransition(
          booking.id,
          booking.payment_status,
          'REFUND_PENDING',
          'payment',
          'Reconciliation: refund initiated after failed booking'
        );
        logger.warn(`Reconciliation: booking ${booking.tixxgo_ref} FAILED`);
      }
    } catch (err) {
      logger.error(`Reconciliation: error processing booking ${booking.tixxgo_ref}`, {
        error: err.message,
      });
    }
  }
}

function startReconciliationJob() {
  cron.schedule('* * * * *', () => {
    reconcileUnknownBookings().catch((err) => {
      logger.error('Reconciliation job unhandled error', { error: err.message });
    });
  });
  logger.info('Booking reconciliation job started (every minute)');
}

module.exports = { startReconciliationJob };
