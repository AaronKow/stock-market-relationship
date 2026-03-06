const fs = require('node:fs/promises');
const path = require('node:path');

async function readJsonFile(filePath) {
  const resolved = path.resolve(filePath);
  const content = await fs.readFile(resolved, 'utf8');
  return JSON.parse(content);
}

function createJsonFileProvider({ name, source, entityType, filePath, mapRecord, disabledReason = null }) {
  return {
    name,
    source,
    entityType,
    disabledReason,
    isEnabled() {
      return Boolean(filePath);
    },
    async fetchPage({ cursor = null }) {
      const rawPayload = await readJsonFile(filePath);
      const records = Array.isArray(rawPayload) ? rawPayload : rawPayload.records || [];

      if (cursor) {
        return {
          records: [],
          hasMore: false,
          nextCursor: cursor,
          rawPayloads: [],
        };
      }

      return {
        records: records.map((item) => mapRecord(item)).filter(Boolean),
        hasMore: false,
        nextCursor: {
          consumedAt: new Date().toISOString(),
          filePath,
        },
        rawPayloads: records.map((item) => ({
          externalId: item.externalId || item.id || null,
          payload: item,
          fetchedAt: new Date().toISOString(),
          publishedAt: item.sourcePublishedAt || null,
          availableAt: item.sourceAvailableAt || item.sourcePublishedAt || null,
          requestUrl: `file://${path.resolve(filePath)}`,
          contentType: 'application/json',
          httpStatus: 200,
        })),
      };
    },
  };
}

module.exports = {
  createJsonFileProvider,
};
