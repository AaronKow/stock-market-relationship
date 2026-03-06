const { prisma } = require('./prisma');
const { companyWithLatestScore, toCompanyWithLatestScore } = require('./companyProjection');

async function listCompanies() {
  const companies = await prisma.company.findMany({
    include: companyWithLatestScore,
    orderBy: { ticker: 'asc' },
  });

  return companies.map(toCompanyWithLatestScore);
}

async function getCompanyById(id) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: companyWithLatestScore,
  });

  if (!company) {
    return null;
  }

  const projected = toCompanyWithLatestScore(company);
  return {
    ...projected,
    latestScoreExplanation: projected.latestScore?.explanationJson ?? null,
  };
}

module.exports = {
  listCompanies,
  getCompanyById,
};
