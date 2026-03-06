const { Sentiment, SignalType } = require('@prisma/client');
const { createHash } = require('node:crypto');
const { prisma } = require('../../services/prisma');
const { resolveCompanyByTicker } = require('./companyResolver');
const { normalizePointInTime } = require('../core/pointInTime');

const ALLOWED_SIGNAL_TYPES = new Set(Object.values(SignalType));
const ALLOWED_SENTIMENTS = new Set(Object.values(Sentiment));

function normalizeSignalType(value) {
  const normalized = String(value || '').toUpperCase();
  return ALLOWED_SIGNAL_TYPES.has(normalized) ? normalized : SignalType.NEWS;
}

function normalizeSentiment(value) {
  const normalized = String(value || '').toUpperCase();
  return ALLOWED_SENTIMENTS.has(normalized) ? normalized : Sentiment.NEUTRAL;
}

function buildDedupeKey(providerName, record) {
  if (record.externalId) {
    return `signal:${providerName}:${record.externalId}`;
  }

  const fingerprint = createHash('sha256')
    .update([
      record.ticker || '',
      record.occurredAt || '',
      record.headline || '',
      record.sourceUrl || '',
    ].join('|'))
    .digest('hex');

  return `signal:${providerName}:${fingerprint}`;
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

      if (!company || !record.occurredAt) {
        failed += 1;
        continue;
      }

      const pit = normalizePointInTime({
        occurredAt: record.occurredAt,
        publishedAt: record.sourcePublishedAt,
        availableAt: record.sourceAvailableAt,
        fallbackAvailableAt: startedAt,
      });

      const dedupeKey = buildDedupeKey(provider.name, record);
      const rawPayload = storedPayloads.find((payload) => payload.externalId === (record.externalId || null));

      await prisma.signalEvent.upsert({
        where: {
          dedupeKey,
        },
        create: {
          companyId: company.id,
          signalType: normalizeSignalType(record.signalType),
          sentiment: normalizeSentiment(record.sentiment),
          occurredAt: pit.occurredAt,
          headline: record.headline || null,
          description: record.description || null,
          source: provider.source,
          sourceProvider: provider.name,
          sourceUrl: record.sourceUrl || null,
          sourcePublishedAt: pit.publishedAt,
          sourceAvailableAt: pit.availableAt,
          ingestedAt: startedAt,
          externalId: record.externalId || null,
          rawPayloadId: rawPayload?.id || null,
          dedupeKey,
          confidence: Number.isFinite(record.confidence) ? record.confidence : null,
          metadata: record.metadata || null,
        },
        update: {
          signalType: normalizeSignalType(record.signalType),
          sentiment: normalizeSentiment(record.sentiment),
          occurredAt: pit.occurredAt,
          headline: record.headline || null,
          description: record.description || null,
          source: provider.source,
          sourceProvider: provider.name,
          sourceUrl: record.sourceUrl || null,
          sourcePublishedAt: pit.publishedAt,
          sourceAvailableAt: pit.availableAt,
          ingestedAt: startedAt,
          externalId: record.externalId || null,
          rawPayloadId: rawPayload?.id || null,
          confidence: Number.isFinite(record.confidence) ? record.confidence : null,
          metadata: record.metadata || null,
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
