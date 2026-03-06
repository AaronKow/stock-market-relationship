#!/usr/bin/env node

async function run() {
  const startedAt = new Date().toISOString();

  console.log(
    JSON.stringify({
      job: process.env.INGESTION_JOB_NAME || 'ingest-signals',
      status: 'placeholder',
      startedAt,
      message: 'Signal ingestion scaffold executed. Replace with event ingestion + enrichment pipeline.',
      nextSteps: ['Fetch event feed from providers', 'Classify signal type and sentiment', 'Upsert SignalEvent rows with confidence'],
    }),
  );
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
