const { prisma } = require('./prisma');

const SENTIMENT_MULTIPLIER = {
  POSITIVE: 1,
  NEUTRAL: 0,
  NEGATIVE: -1,
};

const DEFAULT_SIGNAL_CONFIDENCE = 0.5;
const DEFAULT_RELATIONSHIP_CONFIDENCE = 0.5;
const DEFAULT_RELATIONSHIP_STRENGTH = 0.5;

const EARNINGS_BOOST_WINDOW_DAYS = 14;
const SIGNAL_HALF_LIFE_DAYS = 10;
const NEGATIVE_CLUSTER_WINDOW_DAYS = 7;

function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getDaysBetween(later, earlier) {
  return (later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24);
}

function computeFreshnessDecay(occurredAt, asOfDate = new Date()) {
  const ageInDays = Math.max(0, getDaysBetween(asOfDate, occurredAt));
  return Math.pow(0.5, ageInDays / SIGNAL_HALF_LIFE_DAYS);
}

function computeEarningsTimingBoost(upcomingEarningsDate, asOfDate = new Date()) {
  if (!upcomingEarningsDate) {
    return { score: 0, daysUntilEarnings: null };
  }

  const daysUntilEarnings = getDaysBetween(upcomingEarningsDate, asOfDate);

  if (daysUntilEarnings < 0 || daysUntilEarnings > EARNINGS_BOOST_WINDOW_DAYS) {
    return { score: 0, daysUntilEarnings };
  }

  const proximityRatio = 1 - daysUntilEarnings / EARNINGS_BOOST_WINDOW_DAYS;
  return {
    score: proximityRatio * 15,
    daysUntilEarnings,
  };
}

function computeRiskPenalty(signalEvents, asOfDate = new Date()) {
  const clusteredNegatives = signalEvents.filter((signalEvent) => {
    if (signalEvent.sentiment !== 'NEGATIVE') {
      return false;
    }

    const ageInDays = getDaysBetween(asOfDate, signalEvent.occurredAt);
    return ageInDays >= 0 && ageInDays <= NEGATIVE_CLUSTER_WINDOW_DAYS;
  });

  const clusterCount = clusteredNegatives.length;
  const penalty = clusterCount > 1 ? Math.pow(clusterCount - 1, 1.2) * 4 : 0;

  return {
    penalty,
    clusterCount,
    windowDays: NEGATIVE_CLUSTER_WINDOW_DAYS,
  };
}

function computeSignalContribution(signalEvent, asOfDate = new Date()) {
  const sentimentMultiplier = SENTIMENT_MULTIPLIER[signalEvent.sentiment] ?? 0;
  const confidence = signalEvent.confidence ?? DEFAULT_SIGNAL_CONFIDENCE;
  const freshness = computeFreshnessDecay(signalEvent.occurredAt, asOfDate);

  const relationshipStrength = signalEvent.relationship?.strength ?? DEFAULT_RELATIONSHIP_STRENGTH;
  const relationshipConfidence = signalEvent.relationship?.confidence ?? DEFAULT_RELATIONSHIP_CONFIDENCE;

  const signalContribution = sentimentMultiplier * confidence * freshness * 25;
  const relationshipContribution =
    signalEvent.relationshipId
      ? sentimentMultiplier * confidence * relationshipStrength * relationshipConfidence * freshness * 35
      : 0;

  return {
    signalContribution,
    relationshipContribution,
    freshness,
  };
}

function buildExplanation({
  company,
  asOfDate,
  earningsTiming,
  signalContribution,
  relationshipContribution,
  riskPenalty,
  revisions,
  totalScore,
}) {
  return {
    companyId: company.id,
    ticker: company.ticker,
    asOf: asOfDate.toISOString(),
    components: {
      earningsTimingBoost: {
        windowDays: EARNINGS_BOOST_WINDOW_DAYS,
        daysUntilEarnings: earningsTiming.daysUntilEarnings,
        score: earningsTiming.score,
      },
      relationshipSignals: {
        weightedContribution: relationshipContribution,
        weighting: {
          confidence: true,
          relationshipStrength: true,
          relationshipConfidence: true,
          freshnessDecay: true,
        },
      },
      baseSignals: {
        weightedContribution: signalContribution,
        freshnessHalfLifeDays: SIGNAL_HALF_LIFE_DAYS,
      },
      riskPenalty: {
        clusteredNegativeSignals: riskPenalty.clusterCount,
        windowDays: riskPenalty.windowDays,
        penalty: riskPenalty.penalty,
      },
      revisions: revisions,
    },
    totalScore,
  };
}

function computeCompanyScore(company, asOfDate = new Date()) {
  const earningsEvent = company.earningsEvents
    .filter((event) => event.eventDate >= asOfDate)
    .sort((a, b) => a.eventDate - b.eventDate)[0];

  const earningsTiming = computeEarningsTimingBoost(earningsEvent?.eventDate, asOfDate);

  const aggregate = company.signalEvents.reduce(
    (accumulator, signalEvent) => {
      const contribution = computeSignalContribution(signalEvent, asOfDate);
      accumulator.signal += contribution.signalContribution;
      accumulator.relationship += contribution.relationshipContribution;
      return accumulator;
    },
    { signal: 0, relationship: 0 },
  );

  const riskPenalty = computeRiskPenalty(company.signalEvents, asOfDate);
  const revisions = {
    enabled: false,
    score: 0,
    note: 'Revision component reserved for estimate-change signals.',
  };

  const totalScore = clamp(
    50 + aggregate.signal + aggregate.relationship + earningsTiming.score - riskPenalty.penalty + revisions.score,
    0,
    100,
  );

  const explanationJson = buildExplanation({
    company,
    asOfDate,
    earningsTiming,
    signalContribution: aggregate.signal,
    relationshipContribution: aggregate.relationship,
    riskPenalty,
    revisions,
    totalScore,
  });

  return {
    relationshipScore: aggregate.relationship,
    signalScore: aggregate.signal,
    earningsScore: earningsTiming.score,
    totalScore,
    scoreBreakdown: explanationJson.components,
    explanationJson,
  };
}

async function recalculateCompanyScore(companyId, asOfDate = new Date()) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      earningsEvents: true,
      signalEvents: {
        include: {
          relationship: true,
        },
      },
    },
  });

  if (!company) {
    return null;
  }

  const snapshotDate = startOfUtcDay(asOfDate);
  const computed = computeCompanyScore(company, asOfDate);

  return prisma.companyScoreSnapshot.upsert({
    where: {
      companyId_snapshotDate: {
        companyId,
        snapshotDate,
      },
    },
    create: {
      companyId,
      snapshotDate,
      relationshipScore: computed.relationshipScore,
      signalScore: computed.signalScore,
      earningsScore: computed.earningsScore,
      totalScore: computed.totalScore,
      scoreBreakdown: computed.scoreBreakdown,
      explanationJson: computed.explanationJson,
    },
    update: {
      relationshipScore: computed.relationshipScore,
      signalScore: computed.signalScore,
      earningsScore: computed.earningsScore,
      totalScore: computed.totalScore,
      scoreBreakdown: computed.scoreBreakdown,
      explanationJson: computed.explanationJson,
    },
  });
}

async function recalculateAllCompanyScores(asOfDate = new Date()) {
  const companies = await prisma.company.findMany({ select: { id: true } });
  const snapshots = [];

  for (const company of companies) {
    const snapshot = await recalculateCompanyScore(company.id, asOfDate);
    if (snapshot) {
      snapshots.push(snapshot);
    }
  }

  return snapshots;
}

module.exports = {
  computeCompanyScore,
  recalculateCompanyScore,
  recalculateAllCompanyScores,
};
