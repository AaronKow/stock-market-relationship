const { prisma } = require('./prisma');

async function listRelationships({ companyId = null } = {}) {
  return prisma.relationship.findMany({
    where: {
      ...(companyId
        ? {
            OR: [{ sourceCompanyId: companyId }, { targetCompanyId: companyId }],
          }
        : {}),
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
