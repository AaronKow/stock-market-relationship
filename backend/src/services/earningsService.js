const { prisma } = require('./prisma');

async function getUpcomingEarnings({ windowDays = 30 } = {}) {
  const now = new Date();
  const end = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

  return prisma.earningsEvent.findMany({
    where: {
      AND: [
        {
          OR: [{ sourceAvailableAt: null }, { sourceAvailableAt: { lte: now } }],
        },
      ],
      eventDate: {
        gte: now,
        lte: end,
      },
    },
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
    orderBy: [{ eventDate: 'asc' }, { company: { ticker: 'asc' } }],
  });
}

module.exports = {
  getUpcomingEarnings,
};
