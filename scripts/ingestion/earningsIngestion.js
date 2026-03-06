#!/usr/bin/env node

async function run() {
  const startedAt = new Date().toISOString();

  console.log(
    JSON.stringify({
      job: process.env.INGESTION_JOB_NAME || 'ingest-earnings',
      status: 'placeholder',
      startedAt,
      message: 'Earnings ingestion scaffold executed. Replace with provider fetch + upsert pipeline.',
      nextSteps: ['Fetch upcoming and reported earnings', 'Normalize fiscal period fields', 'Upsert EarningsEvent rows'],
    }),
  );
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
