const path = require('node:path');
const { createJsonFileProvider } = require('../jsonFileProvider');

function createLocalJsonEarningsProvider() {
  const filePath = process.env.EARNINGS_JSON_PATH || path.resolve(__dirname, '../../samples/earnings.sample.json');

  return createJsonFileProvider({
    name: 'local-json-earnings',
    source: 'Structured JSON Import',
    entityType: 'earnings',
    filePath,
    mapRecord: (record) => ({
      externalId: record.externalId || record.id || null,
      ticker: record.ticker,
      companyName: record.companyName || null,
      exchange: record.exchange || null,
      country: record.country || null,
      eventDate: record.eventDate,
      sessionType: record.sessionType || null,
      fiscalQuarter: Number(record.fiscalQuarter),
      fiscalYear: Number(record.fiscalYear),
      estimatedEps: record.estimatedEps == null ? null : Number(record.estimatedEps),
      actualEps: record.actualEps == null ? null : Number(record.actualEps),
      estimatedRevenue: record.estimatedRevenue == null ? null : Number(record.estimatedRevenue),
      actualRevenue: record.actualRevenue == null ? null : Number(record.actualRevenue),
      notes: record.notes || null,
      sourceUrl: record.sourceUrl || null,
      sourcePublishedAt: record.sourcePublishedAt || null,
      sourceAvailableAt: record.sourceAvailableAt || null,
    }),
  });
}

module.exports = {
  createLocalJsonEarningsProvider,
};
