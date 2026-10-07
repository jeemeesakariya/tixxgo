'use strict';

const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');

async function processPayment(bookingId, amount) {
  const mode = env.PAYMENT_MODE;

  if (mode === 'TIMEOUT') {
    await new Promise((resolve) => setTimeout(resolve, env.SUPPLIER_TIMEOUT_MS + 500));
    throw new Error('Payment gateway timeout');
  }

  if (mode === 'FAIL') {
    return { success: false, error: 'Payment declined' };
  }

  return { success: true, transactionId: uuidv4() };
}

module.exports = { processPayment };
