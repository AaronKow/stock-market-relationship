const path = require('node:path');
const { createJsonFileProvider } = require('../jsonFileProvider');

function createLocalJsonSignalsProvider() {
  const filePath = process.env.SIGNALS_JSON_PATH || path.resolve(__dirname, '../../samples/signals.sample.json');

  return createJsonFileProvider({
    name: 'local-json-signals',
    source: 'News/transcript/manual notes import',
    entityType: 'signals',
    filePath,
    mapRecord: (record) => ({
      externalId: record.externalId || record.id || null,
      ticker: record.ticker,
      companyName: record.companyName || null,
      exchange: record.exchange || null,
      country: record.country || null,
      signalType: record.signalType || 'NEWS',
      sentiment: record.sentiment || 'NEUTRAL',
      occurredAt: record.occurredAt,
      headline: record.headline || null,
      description: record.description || null,
      sourceUrl: record.sourceUrl || null,
      sourcePublishedAt: record.sourcePublishedAt || null,
      sourceAvailableAt: record.sourceAvailableAt || null,
      confidence: record.confidence == null ? null : Number(record.confidence),
      metadata: record.metadata || null,
    }),
  });
}

module.exports = {
  createLocalJsonSignalsProvider,
};
