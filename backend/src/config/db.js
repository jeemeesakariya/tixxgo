'use strict';

const mysql = require('mysql2/promise');
const env = require('./env');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then((conn) => {
    logger.info(`MySQL connected to ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
    conn.release();
  })
  .catch((err) => {
    logger.error('MySQL connection failed', { error: err.message });
  });

module.exports = pool;
