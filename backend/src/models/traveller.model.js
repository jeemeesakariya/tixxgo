'use strict';

const pool = require('../config/db');

async function createTraveller(bookingId, data) {
  const [result] = await pool.execute(
    `INSERT INTO travellers (
      booking_id, first_name, last_name, email, phone,
      date_of_birth, passport_number, nationality
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bookingId,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.dateOfBirth,
      data.passportNumber || null,
      data.nationality || null,
    ]
  );
  return result.insertId;
}

async function findByBookingId(bookingId) {
  const [rows] = await pool.execute(
    'SELECT * FROM travellers WHERE booking_id = ?',
    [bookingId]
  );
  return rows;
}

module.exports = { createTraveller, findByBookingId };
