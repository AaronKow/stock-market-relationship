const { runIngestionJob } = require('../core/ingestionJobRunner');
const relationshipsAdapter = require('../adapters/relationshipsAdapter');
const { createLocalJsonRelationshipsProvider } = require('../providers/relationships/localJsonRelationshipsProvider');

async function runRelationshipsIngestionJob() {
  return runIngestionJob({
    jobName: process.env.INGESTION_JOB_NAME || 'ingest-relationships',
    adapter: relationshipsAdapter,
    providers: [
      createLocalJsonRelationshipsProvider(),
    ],
  });
}

module.exports = {
  runRelationshipsIngestionJob,
};
