#!/usr/bin/env node

async function run() {
  const startedAt = new Date().toISOString();

  console.log(
    JSON.stringify({
      job: process.env.INGESTION_JOB_NAME || 'ingest-relationships',
      status: 'placeholder',
      startedAt,
      message: 'Relationship ingestion scaffold executed. Replace with relationship extraction + confidence scoring.',
      nextSteps: ['Collect relationship evidence from filings/news', 'Score relationship strength and confidence', 'Upsert Relationship rows'],
    }),
  );
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
