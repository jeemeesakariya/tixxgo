'use strict';

const pool = require('../config/db');

async function createPricingSnapshot(bookingId, pricing) {
  const [result] = await pool.execute(
    `INSERT INTO pricing_snapshots
      (booking_id, supplier_cost, base_fare, taxes, service_fee, discount, customer_total)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      bookingId,
      pricing.supplierCost,
      pricing.baseFare,
      pricing.taxes,
      pricing.serviceFee,
      pricing.discount,
      pricing.customerTotal,
    ]
  );
  return result.insertId;
}

async function findByBookingId(bookingId) {
  const [rows] = await pool.execute(
    'SELECT * FROM pricing_snapshots WHERE booking_id = ? ORDER BY created_at DESC',
    [bookingId]
  );
  return rows;
}

module.exports = { createPricingSnapshot, findByBookingId };
