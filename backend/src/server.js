const { createApp } = require('./app');
const { startScheduler } = require('./scheduler/jobs');
const logger = require('./utils/logger');

const { app, config } = createApp();

const server = app.listen(config.port, () => {
  logger.info('Backend API started', {
    port: config.port,
    nodeEnv: config.nodeEnv,
  });
});

let stopScheduler;
if (config.nodeEnv !== 'test' && config.enableScheduler) {
  stopScheduler = startScheduler();
}

function shutdown(signal) {
  logger.info('Shutdown signal received', { signal });

  if (stopScheduler) {
    stopScheduler();
  }

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
