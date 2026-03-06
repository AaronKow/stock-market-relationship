const cron = require('node-cron');
const path = require('node:path');
const logger = require('../utils/logger');
const { recalculateAllCompanyScores } = require('../services/scoringEngine');
const { runNodeScript } = require('./scriptJob');

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

function createScriptBackedJob({ name, schedule, scriptFile }) {
  const scriptPath = path.resolve(__dirname, '../../../scripts/ingestion', scriptFile);

  return createJob(name, schedule, async () => {
    const result = await runNodeScript({
      scriptPath,
      env: { INGESTION_JOB_NAME: name },
    });

    logger.info('Ingestion script completed', {
      job: name,
      scriptFile,
      output: result.stdout || null,
    });
  });
}

function startScheduler() {
  const jobs = [
    createScriptBackedJob({
      name: 'ingest-earnings',
      schedule: process.env.CRON_INGEST_EARNINGS || '*/30 * * * *',
      scriptFile: 'earningsIngestion.js',
    }),
    createScriptBackedJob({
      name: 'ingest-relationships',
      schedule: process.env.CRON_INGEST_RELATIONSHIPS || '*/45 * * * *',
      scriptFile: 'relationshipsIngestion.js',
    }),
    createScriptBackedJob({
      name: 'ingest-signals',
      schedule: process.env.CRON_INGEST_SIGNALS || '0 * * * *',
      scriptFile: 'signalsIngestion.js',
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
