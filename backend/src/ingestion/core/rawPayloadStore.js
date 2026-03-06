const { prisma } = require('../../services/prisma');
const { hashPayload } = require('./hash');

async function storeRawPayloads({ ingestionLogId, source, provider, entityType, payloads = [] }) {
  if (!Array.isArray(payloads) || payloads.length === 0) {
    return [];
  }

  const created = [];

  for (const payload of payloads) {
    const payloadBody = payload.payload ?? payload.raw ?? payload;

    const record = await prisma.rawIngestionPayload.create({
      data: {
        ingestionLogId,
        source,
        provider,
        entityType,
        externalId: payload.externalId || null,
        requestUrl: payload.requestUrl || null,
        httpStatus: Number.isFinite(payload.httpStatus) ? payload.httpStatus : null,
        contentType: payload.contentType || null,
        payloadHash: hashPayload(payloadBody),
        fetchedAt: payload.fetchedAt ? new Date(payload.fetchedAt) : new Date(),
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
        availableAt: payload.availableAt ? new Date(payload.availableAt) : null,
        payload: payloadBody,
      },
    });

    created.push(record);
  }

  return created;
}

module.exports = {
  storeRawPayloads,
};
