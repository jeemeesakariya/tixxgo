'use strict';

function generateBookingRef() {
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  return `TXG-${digits}`;
}

module.exports = { generateBookingRef };
