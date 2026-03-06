const { prisma } = require('../../services/prisma');

async function resolveCompanyByTicker({ ticker, name = null, exchange = null, country = null }) {
  if (!ticker) {
    return null;
  }

  const normalizedTicker = ticker.trim().toUpperCase();

  return prisma.company.upsert({
    where: {
      ticker: normalizedTicker,
    },
    create: {
      ticker: normalizedTicker,
      name: name || normalizedTicker,
      exchange,
      country,
    },
    update: {
      name: name || undefined,
      exchange: exchange || undefined,
      country: country || undefined,
    },
  });
}

module.exports = {
  resolveCompanyByTicker,
};
