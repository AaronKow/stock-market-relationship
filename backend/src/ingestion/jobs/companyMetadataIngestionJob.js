const { runIngestionJob } = require('../core/ingestionJobRunner');
const companyMetadataAdapter = require('../adapters/companyMetadataAdapter');
const { createLocalJsonCompanyMetadataProvider } = require('../providers/companyMetadata/localJsonCompanyMetadataProvider');
const { createSecSubmissionsProvider } = require('../providers/companyMetadata/secSubmissionsProvider');

async function runCompanyMetadataIngestionJob() {
  return runIngestionJob({
    jobName: process.env.INGESTION_JOB_NAME || 'ingest-company-metadata',
    adapter: companyMetadataAdapter,
    providers: [
      createLocalJsonCompanyMetadataProvider(),
      createSecSubmissionsProvider(),
    ],
  });
}

module.exports = {
  runCompanyMetadataIngestionJob,
};
