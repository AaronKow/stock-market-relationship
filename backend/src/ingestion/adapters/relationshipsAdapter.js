const { RelationshipType } = require('@prisma/client');
const { prisma } = require('../../services/prisma');
const { resolveCompanyByTicker } = require('./companyResolver');
const { normalizePointInTime } = require('../core/pointInTime');

const ALLOWED_REL_TYPES = new Set(Object.values(RelationshipType));

function normalizeRelationshipType(value) {
  const normalized = String(value || '').toUpperCase();
  return ALLOWED_REL_TYPES.has(normalized) ? normalized : RelationshipType.PEER;
}

function buildDedupeKey(providerName, record) {
  if (record.externalId) {
    return `relationship:${providerName}:${record.externalId}`;
  }

  return `relationship:${providerName}:${record.sourceTicker}:${record.targetTicker}:${normalizeRelationshipType(record.relationshipType)}`;
}

async function ingest({ records, provider, storedPayloads, startedAt }) {
  let processed = 0;
  let failed = 0;

  for (const record of records) {
    try {
      const [sourceCompany, targetCompany] = await Promise.all([
        resolveCompanyByTicker({ ticker: record.sourceTicker, name: record.sourceCompanyName }),
        resolveCompanyByTicker({ ticker: record.targetTicker, name: record.targetCompanyName }),
      ]);

      if (!sourceCompany || !targetCompany) {
        failed += 1;
        continue;
      }

      const relationshipType = normalizeRelationshipType(record.relationshipType);
      const pit = normalizePointInTime({
        publishedAt: record.sourcePublishedAt,
        availableAt: record.sourceAvailableAt,
        fallbackAvailableAt: startedAt,
      });
      const dedupeKey = buildDedupeKey(provider.name, record);
      const rawPayload = storedPayloads.find((payload) => payload.externalId === (record.externalId || null));

      await prisma.relationship.upsert({
        where: {
          dedupeKey,
        },
        create: {
          sourceCompanyId: sourceCompany.id,
          targetCompanyId: targetCompany.id,
          relationshipType,
          strength: Number.isFinite(record.strength) ? record.strength : null,
          confidence: Number.isFinite(record.confidence) ? record.confidence : null,
          rationale: record.rationale || null,
          sourceProvider: provider.name,
          sourceName: provider.source,
          sourceUrl: record.sourceUrl || null,
          sourcePublishedAt: pit.publishedAt,
          sourceAvailableAt: pit.availableAt,
          ingestedAt: startedAt,
          rawPayloadId: rawPayload?.id || null,
          externalId: record.externalId || null,
          dedupeKey,
        },
        update: {
          strength: Number.isFinite(record.strength) ? record.strength : null,
          confidence: Number.isFinite(record.confidence) ? record.confidence : null,
          rationale: record.rationale || null,
          sourceProvider: provider.name,
          sourceName: provider.source,
          sourceUrl: record.sourceUrl || null,
          sourcePublishedAt: pit.publishedAt,
          sourceAvailableAt: pit.availableAt,
          ingestedAt: startedAt,
          rawPayloadId: rawPayload?.id || null,
          externalId: record.externalId || null,
        },
      });

      processed += 1;
    } catch (error) {
      failed += 1;
    }
  }

  return {
    processed,
    failed,
  };
}

module.exports = {
  ingest,
};
