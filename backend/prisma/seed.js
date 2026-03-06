const { PrismaClient, RelationshipType, Sentiment, SessionType, SignalType } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Synthetic demo seed only.
 * This dataset is fictional and for testing/dev environments.
 * It must not be interpreted as investment advice.
 */
async function main() {
  console.log('Seeding synthetic stock relationship dataset (NOT investment advice)...');

  await prisma.$transaction([
    prisma.companyScoreSnapshot.deleteMany(),
    prisma.signalEvent.deleteMany(),
    prisma.earningsEvent.deleteMany(),
    prisma.relationship.deleteMany(),
    prisma.watchlistItem.deleteMany(),
    prisma.watchlist.deleteMany(),
    prisma.company.deleteMany(),
    prisma.user.deleteMany(),
    prisma.ingestionLog.deleteMany(),
  ]);

  const companiesData = [
    { ticker: 'AURX', name: 'Aurora Robotics Exchange', sector: 'Technology', industry: 'Industrial Automation', exchange: 'SYNX', country: 'US' },
    { ticker: 'CLDN', name: 'CloudNexa Systems', sector: 'Technology', industry: 'Cloud Infrastructure', exchange: 'SYNX', country: 'US' },
    { ticker: 'VRDM', name: 'Verdant Materials', sector: 'Materials', industry: 'Specialty Chemicals', exchange: 'SYNX', country: 'US' },
    { ticker: 'HLIO', name: 'HelioGrid Energy', sector: 'Utilities', industry: 'Renewable Utilities', exchange: 'SYNX', country: 'US' },
    { ticker: 'NMBL', name: 'Nimble Freight Tech', sector: 'Industrials', industry: 'Logistics Platforms', exchange: 'SYNX', country: 'US' },
    { ticker: 'ORBT', name: 'OrbitCom Networks', sector: 'Communication Services', industry: 'Satellite Communications', exchange: 'SYNX', country: 'US' },
    { ticker: 'MRNA', name: 'Marina BioLabs', sector: 'Health Care', industry: 'Biotech Tools', exchange: 'SYNX', country: 'US' },
    { ticker: 'FINT', name: 'FinTrellis Holdings', sector: 'Financials', industry: 'Payments Infrastructure', exchange: 'SYNX', country: 'US' },
    { ticker: 'QNTA', name: 'QuantaForge Devices', sector: 'Technology', industry: 'Semiconductor Equipment', exchange: 'SYNX', country: 'US' },
    { ticker: 'BOLT', name: 'Boltline Mobility', sector: 'Consumer Discretionary', industry: 'EV Components', exchange: 'SYNX', country: 'US' },
    { ticker: 'SEAW', name: 'SeaWind Shipping', sector: 'Industrials', industry: 'Marine Transportation', exchange: 'SYNX', country: 'US' },
    { ticker: 'AGRX', name: 'AgriNext Genomics', sector: 'Consumer Staples', industry: 'Agri Biotechnology', exchange: 'SYNX', country: 'US' },
    { ticker: 'TRUS', name: 'TrustArc Cyber', sector: 'Technology', industry: 'Cybersecurity', exchange: 'SYNX', country: 'US' },
    { ticker: 'LUMA', name: 'Luma Retail Cloud', sector: 'Consumer Discretionary', industry: 'Retail Software', exchange: 'SYNX', country: 'US' },
    { ticker: 'PIVT', name: 'Pivot Health Devices', sector: 'Health Care', industry: 'Medical Devices', exchange: 'SYNX', country: 'US' },
  ];

  await prisma.company.createMany({ data: companiesData });
  const companies = await prisma.company.findMany();
  const companyByTicker = Object.fromEntries(companies.map((company) => [company.ticker, company]));

  const seedUser = await prisma.user.create({
    data: {
      email: 'demo.synthetic@stock-relationship.local',
      name: 'Synthetic Demo User',
    },
  });

  const relationshipsData = [
    ['AURX', 'QNTA', RelationshipType.SUPPLIER, 0.82, 0.9, 'AURX sources precision chips from QNTA.'],
    ['AURX', 'NMBL', RelationshipType.CUSTOMER, 0.68, 0.81, 'AURX uses NMBL for regional logistics.'],
    ['AURX', 'TRUS', RelationshipType.PARTNER, 0.57, 0.72, 'Joint security hardening initiative.'],
    ['CLDN', 'TRUS', RelationshipType.PARTNER, 0.75, 0.86, 'Cloud security bundle for enterprise tenants.'],
    ['CLDN', 'LUMA', RelationshipType.CUSTOMER, 0.63, 0.83, 'LUMA hosts retail workloads on CLDN.'],
    ['CLDN', 'ORBT', RelationshipType.SUPPLIER, 0.49, 0.71, 'ORBT provides backup satellite uplinks.'],
    ['VRDM', 'BOLT', RelationshipType.SUPPLIER, 0.8, 0.88, 'Battery coating compounds sold to BOLT.'],
    ['VRDM', 'HLIO', RelationshipType.PARTNER, 0.52, 0.67, 'Grid storage pilot programs.'],
    ['HLIO', 'SEAW', RelationshipType.CUSTOMER, 0.45, 0.66, 'SEAW procures renewable power credits.'],
    ['HLIO', 'AGRX', RelationshipType.MACRO, 0.4, 0.6, 'Weather-linked energy demand influences AGRX costs.'],
    ['NMBL', 'SEAW', RelationshipType.PARTNER, 0.7, 0.82, 'Intermodal shipping collaboration.'],
    ['NMBL', 'FINT', RelationshipType.CUSTOMER, 0.61, 0.79, 'NMBL uses FINT treasury payment rails.'],
    ['ORBT', 'SEAW', RelationshipType.CUSTOMER, 0.58, 0.76, 'Fleet telemetry and vessel communications contract.'],
    ['ORBT', 'AURX', RelationshipType.COMPETITOR, 0.44, 0.62, 'Overlap in autonomous infrastructure patents.'],
    ['MRNA', 'PIVT', RelationshipType.PARTNER, 0.66, 0.84, 'Co-development of diagnostics instrumentation.'],
    ['MRNA', 'AGRX', RelationshipType.PEER, 0.39, 0.64, 'Both depend on gene sequencing capacity.'],
    ['FINT', 'LUMA', RelationshipType.SUPPLIER, 0.71, 0.87, 'Embedded checkout APIs licensed to LUMA.'],
    ['FINT', 'CLDN', RelationshipType.CUSTOMER, 0.54, 0.73, 'CLDN handles encrypted payment data workloads.'],
    ['QNTA', 'BOLT', RelationshipType.SUPPLIER, 0.77, 0.89, 'QNTA power chips integrated in BOLT modules.'],
    ['QNTA', 'TRUS', RelationshipType.CUSTOMER, 0.56, 0.74, 'QNTA deploys TRUS endpoint protection.'],
    ['BOLT', 'LUMA', RelationshipType.PARTNER, 0.42, 0.65, 'Showroom commerce integration project.'],
    ['SEAW', 'NMBL', RelationshipType.CUSTOMER, 0.69, 0.81, 'SEAW purchases route optimization services.'],
    ['AGRX', 'VRDM', RelationshipType.SUPPLIER, 0.51, 0.69, 'VRDM micronutrients sold into AGRX line.'],
    ['TRUS', 'PIVT', RelationshipType.SUPPLIER, 0.47, 0.7, 'Medical device security firmware contract.'],
    ['LUMA', 'AURX', RelationshipType.CUSTOMER, 0.55, 0.75, 'Warehouse robotics rollout using AURX systems.'],
    ['PIVT', 'HLIO', RelationshipType.CUSTOMER, 0.43, 0.61, 'Hospitals source renewable backup power via HLIO.'],
  ];

  const relationshipCreates = relationshipsData.map(([sourceTicker, targetTicker, relationshipType, strength, confidence, rationale]) =>
    prisma.relationship.create({
      data: {
        sourceCompanyId: companyByTicker[sourceTicker].id,
        targetCompanyId: companyByTicker[targetTicker].id,
        relationshipType,
        strength,
        confidence,
        rationale,
        createdByUserId: seedUser.id,
      },
    }),
  );
  await prisma.$transaction(relationshipCreates);

  const relationships = await prisma.relationship.findMany();
  const relationshipByKey = Object.fromEntries(
    relationships.map((relationship) => [
      `${relationship.sourceCompanyId}:${relationship.targetCompanyId}:${relationship.relationshipType}`,
      relationship,
    ]),
  );

  const earningsData = [
    ['AURX', '2025-02-05T21:00:00Z', SessionType.POST_MARKET, 4, 2024, 1.12, 1.18, 1200000000, 1245000000, 'Synthetic quarter with modest upside surprise.'],
    ['CLDN', '2025-02-11T13:00:00Z', SessionType.PRE_MARKET, 4, 2024, 0.74, 0.7, 980000000, 955000000, 'Synthetic miss driven by temporary migration costs.'],
    ['VRDM', '2025-02-08T21:30:00Z', SessionType.POST_MARKET, 4, 2024, 0.49, 0.52, 510000000, 525000000, 'Synthetic pricing resilience in specialty inputs.'],
    ['HLIO', '2025-02-13T11:30:00Z', SessionType.PRE_MARKET, 4, 2024, 0.32, 0.29, 640000000, 618000000, 'Synthetic weather disruptions impacted output.'],
    ['NMBL', '2025-02-09T20:45:00Z', SessionType.POST_MARKET, 4, 2024, 0.41, 0.44, 730000000, 760000000, 'Synthetic automation contracts boosted margins.'],
    ['ORBT', '2025-02-10T22:00:00Z', SessionType.POST_MARKET, 4, 2024, 0.26, 0.22, 410000000, 398000000, 'Synthetic launch schedule slippage.'],
    ['MRNA', '2025-02-06T21:10:00Z', SessionType.POST_MARKET, 4, 2024, 0.35, 0.4, 280000000, 301000000, 'Synthetic diagnostics demand increase.'],
    ['FINT', '2025-02-07T12:00:00Z', SessionType.PRE_MARKET, 4, 2024, 0.58, 0.61, 860000000, 884000000, 'Synthetic transaction volume tailwind.'],
    ['QNTA', '2025-02-12T21:20:00Z', SessionType.POST_MARKET, 4, 2024, 0.67, 0.63, 790000000, 772000000, 'Synthetic capex cycle normalization.'],
    ['BOLT', '2025-02-14T11:45:00Z', SessionType.PRE_MARKET, 4, 2024, 0.21, 0.24, 560000000, 579000000, 'Synthetic EV platform design-win momentum.'],
  ];

  const earningsCreates = earningsData.map(
    ([ticker, eventDate, sessionType, fiscalQuarter, fiscalYear, estimatedEps, actualEps, estimatedRevenue, actualRevenue, notes]) =>
      prisma.earningsEvent.create({
        data: {
          companyId: companyByTicker[ticker].id,
          eventDate: new Date(eventDate),
          sessionType,
          fiscalQuarter,
          fiscalYear,
          estimatedEps,
          actualEps,
          estimatedRevenue,
          actualRevenue,
          notes,
        },
      }),
  );
  await prisma.$transaction(earningsCreates);

  const earningsEvents = await prisma.earningsEvent.findMany();
  const earningsByCompanyId = Object.fromEntries(earningsEvents.map((event) => [event.companyId, event]));

  const signalSeed = [
    ['AURX', SignalType.NEWS, Sentiment.POSITIVE],
    ['AURX', SignalType.TECHNICAL, Sentiment.NEUTRAL],
    ['AURX', SignalType.EARNINGS, Sentiment.POSITIVE],
    ['CLDN', SignalType.NEWS, Sentiment.NEGATIVE],
    ['CLDN', SignalType.ANALYST, Sentiment.NEGATIVE],
    ['CLDN', SignalType.EARNINGS, Sentiment.NEGATIVE],
    ['VRDM', SignalType.PRICE_ACTION, Sentiment.POSITIVE],
    ['VRDM', SignalType.MACRO, Sentiment.NEUTRAL],
    ['VRDM', SignalType.EARNINGS, Sentiment.POSITIVE],
    ['HLIO', SignalType.NEWS, Sentiment.NEGATIVE],
    ['HLIO', SignalType.MACRO, Sentiment.NEGATIVE],
    ['HLIO', SignalType.EARNINGS, Sentiment.NEGATIVE],
    ['NMBL', SignalType.NEWS, Sentiment.POSITIVE],
    ['NMBL', SignalType.INSIDER, Sentiment.POSITIVE],
    ['NMBL', SignalType.EARNINGS, Sentiment.POSITIVE],
    ['ORBT', SignalType.NEWS, Sentiment.NEGATIVE],
    ['ORBT', SignalType.TECHNICAL, Sentiment.NEGATIVE],
    ['ORBT', SignalType.EARNINGS, Sentiment.NEGATIVE],
    ['MRNA', SignalType.NEWS, Sentiment.POSITIVE],
    ['MRNA', SignalType.ANALYST, Sentiment.POSITIVE],
    ['MRNA', SignalType.EARNINGS, Sentiment.POSITIVE],
    ['FINT', SignalType.NEWS, Sentiment.POSITIVE],
    ['FINT', SignalType.PRICE_ACTION, Sentiment.POSITIVE],
    ['FINT', SignalType.EARNINGS, Sentiment.POSITIVE],
    ['QNTA', SignalType.NEWS, Sentiment.NEGATIVE],
    ['QNTA', SignalType.TECHNICAL, Sentiment.NEUTRAL],
    ['QNTA', SignalType.EARNINGS, Sentiment.NEGATIVE],
    ['BOLT', SignalType.NEWS, Sentiment.POSITIVE],
    ['BOLT', SignalType.ANALYST, Sentiment.POSITIVE],
    ['BOLT', SignalType.EARNINGS, Sentiment.POSITIVE],
  ];

  const signalCreates = signalSeed.map(([ticker, signalType, sentiment], index) => {
    const company = companyByTicker[ticker];
    const occurredAt = new Date(Date.UTC(2025, 1, 1 + index, 14, (index * 7) % 60));
    const relatedRelationship = relationships[index % relationships.length];
    const earningsEvent = signalType === SignalType.EARNINGS ? earningsByCompanyId[company.id] : null;

    return prisma.signalEvent.create({
      data: {
        companyId: company.id,
        relationshipId: relatedRelationship?.id,
        earningsEventId: earningsEvent?.id,
        signalType,
        sentiment,
        occurredAt,
        headline: `${ticker} synthetic ${signalType.toLowerCase().replace('_', ' ')} signal #${index + 1}`,
        description: 'Generated demo signal for local development. Not investment advice.',
        source: 'Synthetic Feed Generator',
        sourceUrl: `https://example.invalid/synthetic-signal/${ticker.toLowerCase()}/${index + 1}`,
        confidence: 0.45 + (index % 5) * 0.1,
        metadata: {
          synthetic: true,
          runLabel: 'demo-seed-v1',
          ordinal: index + 1,
        },
      },
    });
  });
  await prisma.$transaction(signalCreates);

  const watchlists = await prisma.$transaction([
    prisma.watchlist.create({
      data: {
        userId: seedUser.id,
        name: 'Synthetic High Conviction',
        description: 'Demo-only watchlist. Fictional securities for UI testing.',
        isDefault: true,
      },
    }),
    prisma.watchlist.create({
      data: {
        userId: seedUser.id,
        name: 'Synthetic Event Radar',
        description: 'Demo-only event-driven sample watchlist.',
        isDefault: false,
      },
    }),
  ]);

  await prisma.watchlistItem.createMany({
    data: [
      { watchlistId: watchlists[0].id, companyId: companyByTicker.AURX.id, notes: 'Demo core position candidate.' },
      { watchlistId: watchlists[0].id, companyId: companyByTicker.NMBL.id, notes: 'Demo logistics momentum name.' },
      { watchlistId: watchlists[0].id, companyId: companyByTicker.FINT.id, notes: 'Demo fintech quality screen.' },
      { watchlistId: watchlists[0].id, companyId: companyByTicker.BOLT.id, notes: 'Demo growth basket component.' },
      { watchlistId: watchlists[1].id, companyId: companyByTicker.CLDN.id, notes: 'Synthetic earnings risk monitor.' },
      { watchlistId: watchlists[1].id, companyId: companyByTicker.HLIO.id, notes: 'Synthetic weather sensitivity monitor.' },
      { watchlistId: watchlists[1].id, companyId: companyByTicker.ORBT.id, notes: 'Synthetic launch cadence monitor.' },
      { watchlistId: watchlists[1].id, companyId: companyByTicker.QNTA.id, notes: 'Synthetic supply chain monitor.' },
    ],
  });

  const snapshotDate = new Date('2025-02-15T00:00:00Z');
  const snapshotCompanies = ['AURX', 'CLDN', 'NMBL', 'FINT', 'BOLT'];
  await prisma.companyScoreSnapshot.createMany({
    data: snapshotCompanies.map((ticker, i) => {
      const relationshipScore = 55 + i * 4;
      const signalScore = 58 + i * 3;
      const earningsScore = 52 + i * 2;
      return {
        companyId: companyByTicker[ticker].id,
        snapshotDate,
        relationshipScore,
        signalScore,
        earningsScore,
        totalScore: Number((relationshipScore * 0.4 + signalScore * 0.4 + earningsScore * 0.2).toFixed(2)),
        scoreBreakdown: {
          synthetic: true,
          weights: { relationship: 0.4, signal: 0.4, earnings: 0.2 },
        },
        explanationJson: {
          runType: 'synthetic-seed-snapshot',
          disclaimer: 'Generated for development and demonstration only; not investment advice.',
        },
      };
    }),
  });

  await prisma.ingestionLog.create({
    data: {
      source: 'synthetic-seed',
      entityType: 'full-dataset',
      status: 'SUCCEEDED',
      startedAt: new Date('2025-02-15T00:00:00Z'),
      finishedAt: new Date('2025-02-15T00:00:04Z'),
      recordsProcessed: companiesData.length + relationshipsData.length + signalSeed.length + earningsData.length,
      recordsFailed: 0,
      metadata: {
        synthetic: true,
        note: 'Seed generation for local development. Not investment advice.',
      },
    },
  });

  console.log('Synthetic seed complete.');
  console.log(`Companies: ${companiesData.length}`);
  console.log(`Relationships: ${relationshipsData.length}`);
  console.log(`Signal events: ${signalSeed.length}`);
  console.log(`Earnings events: ${earningsData.length}`);
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
