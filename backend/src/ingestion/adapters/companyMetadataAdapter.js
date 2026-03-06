const { prisma } = require('../../services/prisma');
const { resolveCompanyByTicker } = require('./companyResolver');
const { normalizePointInTime } = require('../core/pointInTime');

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

      if (!company) {
        failed += 1;
        continue;
      }

      const pit = normalizePointInTime({
        publishedAt: record.sourcePublishedAt,
        availableAt: record.sourceAvailableAt,
        fallbackAvailableAt: startedAt,
      });

      const rawPayload = storedPayloads.find((payload) => payload.externalId === (record.externalId || null));

      await prisma.company.update({
        where: { id: company.id },
        data: {
          cik: record.cik || company.cik || null,
          sicCode: record.sicCode || null,
          sicDescription: record.sicDescription || null,
          fiscalYearEnd: record.fiscalYearEnd || null,
          latestFilingAt: record.latestFilingAt ? new Date(record.latestFilingAt) : null,
          metadataSource: provider.source,
          metadataSourceUrl: record.sourceUrl || null,
          metadataPublishedAt: pit.publishedAt,
          metadataAvailableAt: pit.availableAt,
          metadataIngestedAt: startedAt,
          metadataRawPayloadId: rawPayload?.id || null,
          ingestionMetadata: {
            provider: provider.name,
            externalId: record.externalId || null,
          },
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
