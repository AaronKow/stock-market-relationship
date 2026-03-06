const { prisma } = require('../../services/prisma');

async function getCheckpoint({ provider, entityType }) {
  return prisma.ingestionCheckpoint.findUnique({
    where: {
      provider_entityType: {
        provider,
        entityType,
      },
    },
  });
}

async function saveCheckpoint({ provider, entityType, cursor }) {
  return prisma.ingestionCheckpoint.upsert({
    where: {
      provider_entityType: {
        provider,
        entityType,
      },
    },
    create: {
      provider,
      entityType,
      cursor,
    },
    update: {
      cursor,
    },
  });
}

module.exports = {
  getCheckpoint,
  saveCheckpoint,
};
