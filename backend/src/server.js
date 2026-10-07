'use strict';

require('./config/env');
const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { startReconciliationJob } = require('./services/bookingReconciliationJob');

require('./config/db');

const server = app.listen(env.PORT, () => {
  logger.info(`Tixxgo backend listening on port ${env.PORT}`);
});

startReconciliationJob();

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
