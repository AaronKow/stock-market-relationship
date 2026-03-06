#!/usr/bin/env node

const { runRelationshipsIngestionJob } = require('../../backend/src/ingestion/jobs/relationshipsIngestionJob');

async function run() {
  const startedAt = new Date().toISOString();
  const summary = await runRelationshipsIngestionJob();

  console.log(
    JSON.stringify({
      job: process.env.INGESTION_JOB_NAME || 'ingest-relationships',
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
