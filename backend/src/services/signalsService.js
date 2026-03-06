const { prisma } = require('./prisma');

async function listSignals({ companyId = null, limit = 100 } = {}) {
  const now = new Date();

  return prisma.signalEvent.findMany({
    where: {
      ...(companyId ? { companyId } : {}),
      occurredAt: { lte: now },
      AND: [{ OR: [{ sourceAvailableAt: null }, { sourceAvailableAt: { lte: now } }] }],
    },
    include: {
      company: {
        select: {
          id: true,
          ticker: true,
          name: true,
        },
      },
      relationship: {
        include: {
          sourceCompany: { select: { id: true, ticker: true, name: true } },
          targetCompany: { select: { id: true, ticker: true, name: true } },
        },
      },
    },
    orderBy: { occurredAt: 'desc' },
    take: limit,
  });
}

module.exports = {
  listSignals,
};
