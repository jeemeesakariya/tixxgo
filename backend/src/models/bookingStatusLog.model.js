'use strict';

const pool = require('../config/db');

async function logTransition(bookingId, previousStatus, newStatus, statusType, reason) {
  await pool.execute(
    `INSERT INTO booking_status_logs
      (booking_id, previous_status, new_status, status_type, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [bookingId, previousStatus, newStatus, statusType, reason || null]
  );
}

async function findByBookingId(bookingId) {
  const [rows] = await pool.execute(
    'SELECT * FROM booking_status_logs WHERE booking_id = ? ORDER BY created_at ASC',
    [bookingId]
  );
  return rows;
}

module.exports = { logTransition, findByBookingId };
