const { runIngestionJob } = require('../core/ingestionJobRunner');
const earningsAdapter = require('../adapters/earningsAdapter');
const { createLocalJsonEarningsProvider } = require('../providers/earnings/localJsonEarningsProvider');
const { createFmpEarningsProvider } = require('../providers/earnings/fmpEarningsProvider');

async function runEarningsIngestionJob() {
  return runIngestionJob({
    jobName: process.env.INGESTION_JOB_NAME || 'ingest-earnings',
    adapter: earningsAdapter,
    providers: [
      createLocalJsonEarningsProvider(),
      createFmpEarningsProvider(),
    ],
  });
}

module.exports = {
  runEarningsIngestionJob,
};
