#!/usr/bin/env node

const { runCompanyMetadataIngestionJob } = require('../../backend/src/ingestion/jobs/companyMetadataIngestionJob');

async function run() {
  const startedAt = new Date().toISOString();
  const summary = await runCompanyMetadataIngestionJob();

  console.log(
    JSON.stringify({
      job: process.env.INGESTION_JOB_NAME || 'ingest-company-metadata',
      startedAt,
      status: 'completed',
      providers: summary,
    }),
  );
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
