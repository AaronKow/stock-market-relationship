const { IngestionStatus } = require('@prisma/client');
const logger = require('../../utils/logger');
const { prisma } = require('../../services/prisma');
const { withRetry } = require('./retry');
const { RateLimiter } = require('./rateLimit');
const { assertProviderContract } = require('./providerContract');
const { getCheckpoint, saveCheckpoint } = require('./checkpointStore');
const { storeRawPayloads } = require('./rawPayloadStore');

function parseRetryCount() {
  const configured = Number(process.env.INGESTION_MAX_RETRIES);
  return Number.isFinite(configured) && configured >= 0 ? configured : 2;
}

function parsePageLimit() {
  const configured = Number(process.env.INGESTION_MAX_PAGES);
  return Number.isFinite(configured) && configured > 0 ? configured : 25;
}

function buildRunKey(jobName, providerName) {
  return process.env.INGESTION_RUN_KEY || `${jobName}:${providerName}:${new Date().toISOString()}`;
}

async function createStartedLog({ jobName, provider, runKey }) {
  let attempt = Number(process.env.INGESTION_ATTEMPT) || 1;

  while (attempt <= 10) {
    try {
      return await prisma.ingestionLog.create({
        data: {
          jobName,
          source: provider.source,
          provider: provider.name,
          entityType: provider.entityType,
          status: IngestionStatus.STARTED,
          runKey,
          attempt,
          metadata: {
            mode: provider.isEnabled?.() === false ? 'disabled' : 'active',
          },
        },
      });
    } catch (error) {
      if (error.code !== 'P2002') {
        throw error;
      }

      attempt += 1;
    }
  }

  throw new Error(`Unable to create ingestion log for runKey ${runKey}; attempts exhausted.`);
}

async function runProviderIngestion({ jobName, provider, adapter }) {
  assertProviderContract(provider);

  const runKey = buildRunKey(jobName, provider.name);
  const startedAt = new Date();
  const ingestionLog = await createStartedLog({ jobName, provider, runKey });

  if (provider.isEnabled?.() === false) {
    await prisma.ingestionLog.update({
      where: { id: ingestionLog.id },
      data: {
        status: IngestionStatus.SKIPPED,
        finishedAt: new Date(),
        metadata: {
          reason: provider.disabledReason || 'Provider not enabled in environment',
        },
      },
    });

    logger.info('Ingestion provider skipped', {
      job: jobName,
      provider: provider.name,
      entityType: provider.entityType,
    });

    return {
      provider: provider.name,
      status: IngestionStatus.SKIPPED,
      processed: 0,
      failed: 0,
      rawPayloadCount: 0,
    };
  }

  const maxRetries = parseRetryCount();
  const maxPages = parsePageLimit();
  const rateLimiter = new RateLimiter({ minIntervalMs: provider.minIntervalMs || 0 });

  let recordsProcessed = 0;
  let recordsFailed = 0;
  let rawPayloadCount = 0;
  let page = 0;

  try {
    const useCheckpoint = provider.useCheckpoint === true;
    const checkpoint = useCheckpoint
      ? await getCheckpoint({ provider: provider.name, entityType: provider.entityType })
      : null;
    let cursor = checkpoint?.cursor || null;

    while (page < maxPages) {
      await rateLimiter.throttle();

      const response = await withRetry(
        async () => provider.fetchPage({
          cursor,
          startedAt,
          checkpoint,
        }),
        {
          retries: maxRetries,
          onRetry: ({ attempt, delayMs, error }) => {
            logger.warn('Provider fetch retry scheduled', {
              job: jobName,
              provider: provider.name,
              entityType: provider.entityType,
              attempt,
              delayMs,
              error: error.message,
            });
          },
        },
      );

      rateLimiter.update(response.rateLimit || {});

      const storedPayloads = await storeRawPayloads({
        ingestionLogId: ingestionLog.id,
        source: provider.source,
        provider: provider.name,
        entityType: provider.entityType,
        payloads: response.rawPayloads || [],
      });

      const adapterResult = await adapter.ingest({
        records: response.records || [],
        provider,
        ingestionLogId: ingestionLog.id,
        storedPayloads,
        startedAt,
      });

      recordsProcessed += adapterResult.processed;
      recordsFailed += adapterResult.failed;
      rawPayloadCount += storedPayloads.length;

      if (useCheckpoint && response.nextCursor !== undefined) {
        cursor = response.nextCursor;
        await saveCheckpoint({ provider: provider.name, entityType: provider.entityType, cursor });
      }

      page += 1;

      if (!response.hasMore) {
        break;
      }
    }

    const rateLimitSnapshot = rateLimiter.snapshot();

    await prisma.ingestionLog.update({
      where: { id: ingestionLog.id },
      data: {
        status: recordsFailed > 0 ? IngestionStatus.PARTIAL : IngestionStatus.SUCCEEDED,
        finishedAt: new Date(),
        recordsProcessed,
        recordsFailed,
        rawPayloadCount,
        rateLimitRemaining: rateLimitSnapshot.remaining,
        rateLimitResetAt: rateLimitSnapshot.resetAt,
        metadata: {
          pageCount: page,
          maxPages,
          checkpointCursor: cursor,
          useCheckpoint,
        },
      },
    });

    return {
      provider: provider.name,
      status: recordsFailed > 0 ? IngestionStatus.PARTIAL : IngestionStatus.SUCCEEDED,
      processed: recordsProcessed,
      failed: recordsFailed,
      rawPayloadCount,
    };
  } catch (error) {
    await prisma.ingestionLog.update({
      where: { id: ingestionLog.id },
      data: {
        status: IngestionStatus.FAILED,
        finishedAt: new Date(),
        recordsProcessed,
        recordsFailed,
        rawPayloadCount,
        errorMessage: error.message,
      },
    });

    throw error;
  }
}

async function runIngestionJob({ jobName, adapter, providers }) {
  const summaries = [];

  for (const provider of providers) {
    try {
      const summary = await runProviderIngestion({ jobName, provider, adapter });
      summaries.push(summary);
    } catch (error) {
      logger.error('Ingestion provider failed', {
        job: jobName,
        provider: provider.name,
        entityType: provider.entityType,
        error: error.message,
      });

      summaries.push({
        provider: provider.name,
        status: IngestionStatus.FAILED,
        processed: 0,
        failed: 0,
        rawPayloadCount: 0,
        error: error.message,
      });
    }
  }

  return summaries;
}

module.exports = {
  runIngestionJob,
};
