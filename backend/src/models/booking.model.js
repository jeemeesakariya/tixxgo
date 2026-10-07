'use strict';

const pool = require('../config/db');

async function createBooking(data) {
  const [result] = await pool.execute(
    `INSERT INTO bookings (
      tixxgo_ref, tixxgo_result_id, flight_number, airline, origin, destination,
      departure_time, arrival_time, baggage, refundable,
      supplier, supplier_result_id,
      supplier_cost, base_fare, taxes, service_fee, discount, customer_total,
      payment_status, booking_status, ticketing_status, idempotency_key
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.tixxgoRef,
      data.tixxgoResultId,
      data.flightNumber,
      data.airline,
      data.origin,
      data.destination,
      data.departureTime,
      data.arrivalTime,
      data.baggage,
      data.refundable,
      data.supplier,
      data.supplierResultId,
      data.supplierCost,
      data.baseFare,
      data.taxes,
      data.serviceFee,
      data.discount,
      data.customerTotal,
      'PAYMENT_PENDING',
      'INITIATED',
      'NOT_ISSUED',
      data.idempotencyKey,
    ]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findByTixxgoRef(ref) {
  const [rows] = await pool.execute('SELECT * FROM bookings WHERE tixxgo_ref = ?', [ref]);
  return rows[0] || null;
}

async function findByIdempotencyKey(key) {
  const [rows] = await pool.execute('SELECT * FROM bookings WHERE idempotency_key = ?', [key]);
  return rows[0] || null;
}

async function updatePaymentStatus(id, status) {
  await pool.execute('UPDATE bookings SET payment_status = ? WHERE id = ?', [status, id]);
}

async function updateBookingStatus(id, status) {
  await pool.execute('UPDATE bookings SET booking_status = ? WHERE id = ?', [status, id]);
}

async function updateTicketingStatus(id, status) {
  await pool.execute('UPDATE bookings SET ticketing_status = ? WHERE id = ?', [status, id]);
}

async function updateSupplierPnr(id, pnr) {
  await pool.execute('UPDATE bookings SET supplier_pnr = ? WHERE id = ?', [pnr, id]);
}

async function findUnknownBookings() {
  const [rows] = await pool.execute(
    `SELECT * FROM bookings
     WHERE booking_status = 'UNKNOWN'
     AND created_at < NOW() - INTERVAL 10 MINUTE`
  );
  return rows;
}

async function updateCancellationData(id, data) {
  await pool.execute(
    `UPDATE bookings SET
      cancellation_ref = ?,
      airline_cancel_charge = ?,
      tixxgo_cancel_fee = ?,
      refund_amount = ?
     WHERE id = ?`,
    [data.cancellationRef, data.airlineCharge, data.tixxgoFee, data.refundAmount, id]
  );
}

module.exports = {
  createBooking,
  findById,
  findByTixxgoRef,
  findByIdempotencyKey,
  updatePaymentStatus,
  updateBookingStatus,
  updateTicketingStatus,
  updateSupplierPnr,
  findUnknownBookings,
  updateCancellationData,
};
