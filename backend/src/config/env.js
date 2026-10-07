'use strict';

require('dotenv').config();

const env = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'tixxgo',
  PAYMENT_MODE: process.env.PAYMENT_MODE || 'SUCCESS',
  SUPPLIER_TIMEOUT_MS: parseInt(process.env.SUPPLIER_TIMEOUT_MS || '5000', 10),
};

module.exports = env;
