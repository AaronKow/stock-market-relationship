const { runEarningsIngestionJob } = require('../ingestion/jobs/earningsIngestionJob');
const { runCompanyMetadataIngestionJob } = require('../ingestion/jobs/companyMetadataIngestionJob');
const { runRelationshipsIngestionJob } = require('../ingestion/jobs/relationshipsIngestionJob');
const { runSignalsIngestionJob } = require('../ingestion/jobs/signalsIngestionJob');
const { recalculateAllCompanyScores, recalculateCompanyScore } = require('./scoringEngine');

async function runManualIngestion({ companyId = null } = {}) {
  const startedAt = new Date();

  const jobs = {
    earnings: await runEarningsIngestionJob(),
    companyMetadata: await runCompanyMetadataIngestionJob(),
    relationships: await runRelationshipsIngestionJob(),
    signals: await runSignalsIngestionJob(),
  };

  let scoreSummary;

  if (companyId) {
    const snapshot = await recalculateCompanyScore(companyId, new Date());
    scoreSummary = {
      mode: 'single-company',
      companyId,
      snapshotId: snapshot?.id || null,
      snapshots: snapshot ? 1 : 0,
    };
  } else {
    const snapshots = await recalculateAllCompanyScores(new Date());
    scoreSummary = {
      mode: 'all-companies',
      snapshots: snapshots.length,
    };
  }

  return {
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt.getTime(),
    jobs,
    scoreSummary,
  };
}

module.exports = {
  runManualIngestion,
};
