#!/usr/bin/env node

const { runEarningsIngestionJob } = require('../../backend/src/ingestion/jobs/earningsIngestionJob');

async function run() {
  const startedAt = new Date().toISOString();
  const summary = await runEarningsIngestionJob();

  console.log(
    JSON.stringify({
      job: process.env.INGESTION_JOB_NAME || 'ingest-earnings',
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
