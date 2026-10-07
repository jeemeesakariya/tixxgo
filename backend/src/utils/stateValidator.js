'use strict';

const ALLOWED_TRANSITIONS = {
  payment: {
    PAYMENT_PENDING: ['PAYMENT_SUCCESS', 'PAYMENT_FAILED'],
    PAYMENT_SUCCESS: ['REFUND_PENDING'],
    REFUND_PENDING: ['REFUNDED'],
  },
  booking: {
    INITIATED: ['SUPPLIER_BOOKING', 'BOOKING_FAILED'],
    SUPPLIER_BOOKING: ['BOOKING_CONFIRMED', 'BOOKING_FAILED', 'UNKNOWN'],
    UNKNOWN: ['BOOKING_CONFIRMED', 'BOOKING_FAILED'],
    BOOKING_CONFIRMED: ['CANCELLATION_REQUESTED'],
    CANCELLATION_REQUESTED: ['CANCELLED'],
  },
};

function validateStateTransition(currentStatus, newStatus, type) {
  const transitions = ALLOWED_TRANSITIONS[type];
  if (!transitions) {
    throw new Error(`Unknown transition type: ${type}`);
  }
  const allowed = transitions[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new Error(
      `Invalid ${type} transition: ${currentStatus} -> ${newStatus}`
    );
  }
}

module.exports = { validateStateTransition };
