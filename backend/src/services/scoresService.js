const { prisma } = require('./prisma');
const { recalculateAllCompanyScores } = require('./scoringEngine');

function parseBooleanFlag(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

async function listTopScores({ refresh = false, limit = 25 } = {}) {
  if (refresh) {
    await recalculateAllCompanyScores();
  }

  const latest = await prisma.companyScoreSnapshot.aggregate({
    _max: { snapshotDate: true },
  });

  if (!latest._max.snapshotDate) {
    return [];
  }

  return prisma.companyScoreSnapshot.findMany({
    where: { snapshotDate: latest._max.snapshotDate },
    include: {
      company: {
        select: {
          id: true,
          ticker: true,
          name: true,
          sector: true,
        },
      },
    },
    orderBy: { totalScore: 'desc' },
    take: limit,
  });
}

module.exports = {
  parseBooleanFlag,
  listTopScores,
};
