const { SessionType } = require('@prisma/client');
const { prisma } = require('../../services/prisma');
const { resolveCompanyByTicker } = require('./companyResolver');
const { normalizePointInTime } = require('../core/pointInTime');

const ALLOWED_SESSION_TYPES = new Set(Object.values(SessionType));

function normalizeSessionType(value) {
  const normalized = String(value || '').toUpperCase();
  return ALLOWED_SESSION_TYPES.has(normalized) ? normalized : SessionType.POST_MARKET;
}

function buildDedupeKey(providerName, record) {
  if (record.externalId) {
    return `earnings:${providerName}:${record.externalId}`;
  }

  const eventDate = record.eventDate ? new Date(record.eventDate).toISOString() : 'unknown-date';
  const fiscalYear = record.fiscalYear ?? 'na';
  const fiscalQuarter = record.fiscalQuarter ?? 'na';
  return `earnings:${providerName}:${record.ticker}:${fiscalYear}:${fiscalQuarter}:${eventDate}`;
}

async function ingest({ records, provider, storedPayloads, startedAt }) {
  let processed = 0;
  let failed = 0;

  for (const record of records) {
    try {
      const company = await resolveCompanyByTicker({
        ticker: record.ticker,
        name: record.companyName,
        exchange: record.exchange,
        country: record.country,
      });

      if (!company || !record.eventDate) {
        failed += 1;
        continue;
      }

      const pit = normalizePointInTime({
        publishedAt: record.sourcePublishedAt,
        availableAt: record.sourceAvailableAt,
        fallbackAvailableAt: startedAt,
      });

      const dedupeKey = buildDedupeKey(provider.name, record);
      const rawPayload = storedPayloads.find((payload) => payload.externalId === (record.externalId || null));

      await prisma.earningsEvent.upsert({
        where: {
          dedupeKey,
        },
        create: {
          companyId: company.id,
          externalId: record.externalId || null,
          sourceProvider: provider.name,
          sourceName: provider.source,
          sourceUrl: record.sourceUrl || null,
          sourcePublishedAt: pit.publishedAt,
          sourceAvailableAt: pit.availableAt,
          ingestedAt: startedAt,
          rawPayloadId: rawPayload?.id || null,
          dedupeKey,
          eventDate: new Date(record.eventDate),
          sessionType: normalizeSessionType(record.sessionType),
          fiscalQuarter: Number.isFinite(record.fiscalQuarter) ? record.fiscalQuarter : null,
          fiscalYear: Number.isFinite(record.fiscalYear) ? record.fiscalYear : null,
          estimatedEps: Number.isFinite(record.estimatedEps) ? record.estimatedEps : null,
          actualEps: Number.isFinite(record.actualEps) ? record.actualEps : null,
          estimatedRevenue: Number.isFinite(record.estimatedRevenue) ? record.estimatedRevenue : null,
          actualRevenue: Number.isFinite(record.actualRevenue) ? record.actualRevenue : null,
          notes: record.notes || null,
        },
        update: {
          sourceProvider: provider.name,
          sourceName: provider.source,
          sourceUrl: record.sourceUrl || null,
          sourcePublishedAt: pit.publishedAt,
          sourceAvailableAt: pit.availableAt,
          ingestedAt: startedAt,
          rawPayloadId: rawPayload?.id || null,
          eventDate: new Date(record.eventDate),
          sessionType: normalizeSessionType(record.sessionType),
          fiscalQuarter: Number.isFinite(record.fiscalQuarter) ? record.fiscalQuarter : null,
          fiscalYear: Number.isFinite(record.fiscalYear) ? record.fiscalYear : null,
          estimatedEps: Number.isFinite(record.estimatedEps) ? record.estimatedEps : null,
          actualEps: Number.isFinite(record.actualEps) ? record.actualEps : null,
          estimatedRevenue: Number.isFinite(record.estimatedRevenue) ? record.estimatedRevenue : null,
          actualRevenue: Number.isFinite(record.actualRevenue) ? record.actualRevenue : null,
          notes: record.notes || null,
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
