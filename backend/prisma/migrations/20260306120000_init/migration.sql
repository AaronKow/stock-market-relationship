-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('PEER', 'SUPPLIER', 'CUSTOMER', 'COMPETITOR', 'PARTNER', 'MACRO');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('PRE_MARKET', 'IN_MARKET', 'POST_MARKET');

-- CreateEnum
CREATE TYPE "SignalType" AS ENUM ('EARNINGS', 'NEWS', 'PRICE_ACTION', 'ANALYST', 'INSIDER', 'TECHNICAL', 'MACRO');

-- CreateEnum
CREATE TYPE "IngestionStatus" AS ENUM ('STARTED', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT,
    "industry" TEXT,
    "exchange" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarningsEvent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "sessionType" "SessionType" NOT NULL,
    "fiscalQuarter" INTEGER,
    "fiscalYear" INTEGER,
    "estimatedEps" DECIMAL(8,4),
    "actualEps" DECIMAL(8,4),
    "estimatedRevenue" DECIMAL(18,2),
    "actualRevenue" DECIMAL(18,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EarningsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL,
    "sourceCompanyId" TEXT NOT NULL,
    "targetCompanyId" TEXT NOT NULL,
    "relationshipType" "RelationshipType" NOT NULL,
    "strength" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "rationale" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalEvent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "relationshipId" TEXT,
    "earningsEventId" TEXT,
    "signalType" "SignalType" NOT NULL,
    "sentiment" "Sentiment" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "headline" TEXT,
    "description" TEXT,
    "source" TEXT,
    "sourceUrl" TEXT,
    "confidence" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyScoreSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "relationshipScore" DOUBLE PRECISION NOT NULL,
    "signalScore" DOUBLE PRECISION NOT NULL,
    "earningsScore" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "scoreBreakdown" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL,
    "watchlistId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionLog" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "status" "IngestionStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "checksum" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ticker_key" ON "Company"("ticker");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_sector_industry_idx" ON "Company"("sector", "industry");

-- CreateIndex
CREATE INDEX "EarningsEvent_companyId_eventDate_idx" ON "EarningsEvent"("companyId", "eventDate");

-- CreateIndex
CREATE INDEX "EarningsEvent_eventDate_idx" ON "EarningsEvent"("eventDate");

-- CreateIndex
CREATE UNIQUE INDEX "EarningsEvent_companyId_fiscalYear_fiscalQuarter_key" ON "EarningsEvent"("companyId", "fiscalYear", "fiscalQuarter");

-- CreateIndex
CREATE INDEX "Relationship_sourceCompanyId_relationshipType_idx" ON "Relationship"("sourceCompanyId", "relationshipType");

-- CreateIndex
CREATE INDEX "Relationship_targetCompanyId_relationshipType_idx" ON "Relationship"("targetCompanyId", "relationshipType");

-- CreateIndex
CREATE UNIQUE INDEX "Relationship_sourceCompanyId_targetCompanyId_relationshipTy_key" ON "Relationship"("sourceCompanyId", "targetCompanyId", "relationshipType");

-- CreateIndex
CREATE INDEX "SignalEvent_companyId_occurredAt_idx" ON "SignalEvent"("companyId", "occurredAt");

-- CreateIndex
CREATE INDEX "SignalEvent_signalType_occurredAt_idx" ON "SignalEvent"("signalType", "occurredAt");

-- CreateIndex
CREATE INDEX "SignalEvent_relationshipId_idx" ON "SignalEvent"("relationshipId");

-- CreateIndex
CREATE INDEX "SignalEvent_earningsEventId_idx" ON "SignalEvent"("earningsEventId");

-- CreateIndex
CREATE INDEX "SignalEvent_sentiment_occurredAt_idx" ON "SignalEvent"("sentiment", "occurredAt");

-- CreateIndex
CREATE INDEX "CompanyScoreSnapshot_snapshotDate_idx" ON "CompanyScoreSnapshot"("snapshotDate");

-- CreateIndex
CREATE INDEX "CompanyScoreSnapshot_companyId_totalScore_idx" ON "CompanyScoreSnapshot"("companyId", "totalScore");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyScoreSnapshot_companyId_snapshotDate_key" ON "CompanyScoreSnapshot"("companyId", "snapshotDate");

-- CreateIndex
CREATE INDEX "Watchlist_userId_isDefault_idx" ON "Watchlist"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_name_key" ON "Watchlist"("userId", "name");

-- CreateIndex
CREATE INDEX "WatchlistItem_companyId_idx" ON "WatchlistItem"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_watchlistId_companyId_key" ON "WatchlistItem"("watchlistId", "companyId");

-- CreateIndex
CREATE INDEX "IngestionLog_source_entityType_startedAt_idx" ON "IngestionLog"("source", "entityType", "startedAt");

-- CreateIndex
CREATE INDEX "IngestionLog_status_startedAt_idx" ON "IngestionLog"("status", "startedAt");

-- AddForeignKey
ALTER TABLE "EarningsEvent" ADD CONSTRAINT "EarningsEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_sourceCompanyId_fkey" FOREIGN KEY ("sourceCompanyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_targetCompanyId_fkey" FOREIGN KEY ("targetCompanyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalEvent" ADD CONSTRAINT "SignalEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalEvent" ADD CONSTRAINT "SignalEvent_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalEvent" ADD CONSTRAINT "SignalEvent_earningsEventId_fkey" FOREIGN KEY ("earningsEventId") REFERENCES "EarningsEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyScoreSnapshot" ADD CONSTRAINT "CompanyScoreSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

