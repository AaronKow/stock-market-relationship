const { prisma } = require('./prisma');

async function listCompanies() {
  const companies = await prisma.company.findMany({
    include: {
      scoreSnapshots: {
        orderBy: { snapshotDate: 'desc' },
        take: 1,
      },
    },
    orderBy: { ticker: 'asc' },
  });

  return companies.map((company) => ({
    ...company,
    latestScore: company.scoreSnapshots[0] ?? null,
    scoreSnapshots: undefined,
  }));
}

async function getCompanyById(id) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      scoreSnapshots: {
        orderBy: { snapshotDate: 'desc' },
        take: 1,
      },
    },
  });

  if (!company) {
    return null;
  }

  return {
    ...company,
    latestScore: company.scoreSnapshots[0] ?? null,
    latestScoreExplanation: company.scoreSnapshots[0]?.explanationJson ?? null,
    scoreSnapshots: undefined,
  };
}

module.exports = {
  listCompanies,
  getCompanyById,
};
