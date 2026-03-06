const cron = require('node-cron');
const logger = require('../utils/logger');

function createJob(name, schedule, task) {
  return cron.schedule(schedule, async () => {
    const startedAt = Date.now();
    logger.info('Job started', { job: name });

    try {
      await task();
      logger.info('Job completed', {
        job: name,
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      logger.error('Job failed', {
        job: name,
        durationMs: Date.now() - startedAt,
        error: error.message,
      });
    }
  });
}

function startScheduler() {
  const jobs = [
    createJob('ingest-earnings', '*/30 * * * *', async () => {
      logger.info('Stub earnings ingestion executed');
    }),
    createJob('ingest-relationships', '*/45 * * * *', async () => {
      logger.info('Stub relationships ingestion executed');
    }),
    createJob('ingest-signals', '0 * * * *', async () => {
      logger.info('Stub signals ingestion executed');
    }),
  ];

  logger.info('Scheduler started', { jobCount: jobs.length });

  return () => {
    jobs.forEach((job) => job.stop());
    logger.info('Scheduler stopped');
  };
}

module.exports = {
  startScheduler,
};
