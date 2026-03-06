const { prisma } = require('./prisma');

async function listRelationships({ companyId = null } = {}) {
  const now = new Date();

  return prisma.relationship.findMany({
    where: {
      ...(companyId
        ? {
            OR: [{ sourceCompanyId: companyId }, { targetCompanyId: companyId }],
          }
        : {}),
      AND: [{ OR: [{ sourceAvailableAt: null }, { sourceAvailableAt: { lte: now } }] }],
    },
    include: {
      sourceCompany: {
        select: {
          id: true,
          ticker: true,
          name: true,
          sector: true,
        },
      },
      targetCompany: {
        select: {
          id: true,
          ticker: true,
          name: true,
          sector: true,
        },
      },
    },
    orderBy: [{ sourceCompany: { ticker: 'asc' } }, { targetCompany: { ticker: 'asc' } }],
  });
}

module.exports = {
  listRelationships,
};
