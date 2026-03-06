const cron = require('node-cron');
const logger = require('../utils/logger');
const { recalculateAllCompanyScores } = require('../services/scoringEngine');

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
    createJob('recalculate-company-scores', '*/15 * * * *', async () => {
      const snapshots = await recalculateAllCompanyScores();
      logger.info('Company score recalculation executed', { snapshots: snapshots.length });
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
