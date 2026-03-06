const path = require('node:path');
const { createJsonFileProvider } = require('../jsonFileProvider');

function createLocalJsonRelationshipsProvider() {
  const filePath =
    process.env.RELATIONSHIPS_JSON_PATH || path.resolve(__dirname, '../../samples/relationships.sample.json');

  return createJsonFileProvider({
    name: 'local-json-relationships',
    source: 'External dataset JSON import',
    entityType: 'relationships',
    filePath,
    mapRecord: (record) => ({
      externalId: record.externalId || record.id || null,
      sourceTicker: record.sourceTicker,
      sourceCompanyName: record.sourceCompanyName || null,
      targetTicker: record.targetTicker,
      targetCompanyName: record.targetCompanyName || null,
      relationshipType: record.relationshipType,
      strength: record.strength == null ? null : Number(record.strength),
      confidence: record.confidence == null ? null : Number(record.confidence),
      rationale: record.rationale || null,
      sourceUrl: record.sourceUrl || null,
      sourcePublishedAt: record.sourcePublishedAt || null,
      sourceAvailableAt: record.sourceAvailableAt || null,
    }),
  });
}

module.exports = {
  createLocalJsonRelationshipsProvider,
};
