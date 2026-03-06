const { recalculateAllCompanyScores } = require('../services/scoringEngine');
const { prisma } = require('../services/prisma');

function parseAsOfDate(rawDate) {
  if (!rawDate) {
    return new Date();
  }

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid --as-of date: ${rawDate}. Use ISO-8601, e.g. 2026-03-07T00:00:00Z`);
  }

  return parsed;
}

async function main() {
  const arg = process.argv.find((entry) => entry.startsWith('--as-of='));
  const asOfDate = parseAsOfDate(arg ? arg.replace('--as-of=', '') : null);

  console.log(`Recomputing company score snapshots as of ${asOfDate.toISOString()}...`);
  const snapshots = await recalculateAllCompanyScores(asOfDate);
  console.log(`Recomputed ${snapshots.length} snapshots.`);
}

main()
  .catch((error) => {
    console.error('Score recomputation failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
