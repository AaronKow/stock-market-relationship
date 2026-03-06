-- Extend enum values for richer ingestion run outcomes.
ALTER TYPE "IngestionStatus" ADD VALUE IF NOT EXISTS 'PARTIAL';
ALTER TYPE "IngestionStatus" ADD VALUE IF NOT EXISTS 'SKIPPED';

-- Company ingestion + filing metadata fields.
ALTER TABLE "Company"
  ADD COLUMN "cik" TEXT,
  ADD COLUMN "sicCode" TEXT,
  ADD COLUMN "sicDescription" TEXT,
  ADD COLUMN "fiscalYearEnd" TEXT,
  ADD COLUMN "latestFilingAt" TIMESTAMP(3),
  ADD COLUMN "metadataSource" TEXT,
  ADD COLUMN "metadataSourceUrl" TEXT,
  ADD COLUMN "metadataPublishedAt" TIMESTAMP(3),
  ADD COLUMN "metadataAvailableAt" TIMESTAMP(3),
  ADD COLUMN "metadataIngestedAt" TIMESTAMP(3),
  ADD COLUMN "metadataRawPayloadId" TEXT,
  ADD COLUMN "ingestionMetadata" JSONB;

-- Add source attribution + point-in-time fields for domain entities.
ALTER TABLE "EarningsEvent"
  ADD COLUMN "externalId" TEXT,
  ADD COLUMN "sourceProvider" TEXT,
  ADD COLUMN "sourceName" TEXT,
  ADD COLUMN "sourceUrl" TEXT,
  ADD COLUMN "sourcePublishedAt" TIMESTAMP(3),
  ADD COLUMN "sourceAvailableAt" TIMESTAMP(3),
  ADD COLUMN "ingestedAt" TIMESTAMP(3),
  ADD COLUMN "rawPayloadId" TEXT,
  ADD COLUMN "dedupeKey" TEXT;

ALTER TABLE "Relationship"
  ADD COLUMN "externalId" TEXT,
  ADD COLUMN "sourceProvider" TEXT,
  ADD COLUMN "sourceName" TEXT,
  ADD COLUMN "sourceUrl" TEXT,
  ADD COLUMN "sourcePublishedAt" TIMESTAMP(3),
  ADD COLUMN "sourceAvailableAt" TIMESTAMP(3),
  ADD COLUMN "ingestedAt" TIMESTAMP(3),
  ADD COLUMN "rawPayloadId" TEXT,
  ADD COLUMN "dedupeKey" TEXT;

ALTER TABLE "SignalEvent"
  ADD COLUMN "externalId" TEXT,
  ADD COLUMN "sourceProvider" TEXT,
  ADD COLUMN "sourcePublishedAt" TIMESTAMP(3),
  ADD COLUMN "sourceAvailableAt" TIMESTAMP(3),
  ADD COLUMN "ingestedAt" TIMESTAMP(3),
  ADD COLUMN "rawPayloadId" TEXT,
  ADD COLUMN "dedupeKey" TEXT;

-- Improve ingestion logging for retry/idempotency/rate-limit observability.
ALTER TABLE "IngestionLog"
  ADD COLUMN "jobName" TEXT,
  ADD COLUMN "provider" TEXT,
  ADD COLUMN "runKey" TEXT,
  ADD COLUMN "attempt" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "rawPayloadCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "rateLimitRemaining" INTEGER,
  ADD COLUMN "rateLimitResetAt" TIMESTAMP(3);

ALTER TABLE "IngestionLog"
  ALTER COLUMN "startedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- New tables for payload retention and incremental checkpoints.
CREATE TABLE "RawIngestionPayload" (
  "id" TEXT NOT NULL,
  "ingestionLogId" TEXT,
  "source" TEXT NOT NULL,
  "provider" TEXT,
  "entityType" TEXT NOT NULL,
  "externalId" TEXT,
  "requestUrl" TEXT,
  "httpStatus" INTEGER,
  "contentType" TEXT,
  "payloadHash" TEXT,
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP(3),
  "availableAt" TIMESTAMP(3),
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RawIngestionPayload_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IngestionCheckpoint" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "cursor" JSONB,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IngestionCheckpoint_pkey" PRIMARY KEY ("id")
);

-- Constraints + indexes.
CREATE UNIQUE INDEX "Company_cik_key" ON "Company"("cik");
CREATE INDEX "Company_cik_idx" ON "Company"("cik");

CREATE UNIQUE INDEX "EarningsEvent_dedupeKey_key" ON "EarningsEvent"("dedupeKey");
CREATE INDEX "EarningsEvent_sourceAvailableAt_idx" ON "EarningsEvent"("sourceAvailableAt");

CREATE UNIQUE INDEX "Relationship_dedupeKey_key" ON "Relationship"("dedupeKey");
CREATE UNIQUE INDEX "SignalEvent_dedupeKey_key" ON "SignalEvent"("dedupeKey");

CREATE INDEX "IngestionLog_jobName_provider_startedAt_idx" ON "IngestionLog"("jobName", "provider", "startedAt");
CREATE UNIQUE INDEX "IngestionLog_runKey_attempt_key" ON "IngestionLog"("runKey", "attempt");

CREATE INDEX "RawIngestionPayload_source_entityType_fetchedAt_idx" ON "RawIngestionPayload"("source", "entityType", "fetchedAt");
CREATE INDEX "RawIngestionPayload_provider_entityType_externalId_idx" ON "RawIngestionPayload"("provider", "entityType", "externalId");
CREATE INDEX "RawIngestionPayload_payloadHash_idx" ON "RawIngestionPayload"("payloadHash");

CREATE UNIQUE INDEX "IngestionCheckpoint_provider_entityType_key" ON "IngestionCheckpoint"("provider", "entityType");
CREATE INDEX "IngestionCheckpoint_entityType_updatedAt_idx" ON "IngestionCheckpoint"("entityType", "updatedAt");

ALTER TABLE "RawIngestionPayload"
  ADD CONSTRAINT "RawIngestionPayload_ingestionLogId_fkey"
  FOREIGN KEY ("ingestionLogId") REFERENCES "IngestionLog"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
