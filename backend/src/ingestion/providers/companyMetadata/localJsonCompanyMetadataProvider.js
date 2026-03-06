const path = require('node:path');
const { createJsonFileProvider } = require('../jsonFileProvider');

function createLocalJsonCompanyMetadataProvider() {
  const filePath =
    process.env.COMPANY_METADATA_JSON_PATH || path.resolve(__dirname, '../../samples/companyMetadata.sample.json');

  return createJsonFileProvider({
    name: 'local-json-company-metadata',
    source: 'SEC/filing structured import',
    entityType: 'company_metadata',
    filePath,
    mapRecord: (record) => ({
      externalId: record.externalId || record.cik || record.ticker,
      ticker: record.ticker,
      companyName: record.companyName || null,
      exchange: record.exchange || null,
      country: record.country || null,
      cik: record.cik || null,
      sicCode: record.sicCode || null,
      sicDescription: record.sicDescription || null,
      fiscalYearEnd: record.fiscalYearEnd || null,
      latestFilingAt: record.latestFilingAt || null,
      sourceUrl: record.sourceUrl || null,
      sourcePublishedAt: record.sourcePublishedAt || null,
      sourceAvailableAt: record.sourceAvailableAt || null,
    }),
  });
}

module.exports = {
  createLocalJsonCompanyMetadataProvider,
};
