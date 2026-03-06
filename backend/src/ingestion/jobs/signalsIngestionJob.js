const { runIngestionJob } = require('../core/ingestionJobRunner');
const signalsAdapter = require('../adapters/signalsAdapter');
const { createLocalJsonSignalsProvider } = require('../providers/signals/localJsonSignalsProvider');
const { createPremiumNewsSignalsProvider } = require('../providers/signals/premiumNewsSignalsProvider');

async function runSignalsIngestionJob() {
  return runIngestionJob({
    jobName: process.env.INGESTION_JOB_NAME || 'ingest-signals',
    adapter: signalsAdapter,
    providers: [
      createLocalJsonSignalsProvider(),
      createPremiumNewsSignalsProvider(),
    ],
  });
}

module.exports = {
  runSignalsIngestionJob,
};
