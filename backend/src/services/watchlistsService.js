const { prisma } = require('./prisma');
const AppError = require('../utils/appError');

const watchlistCompanySelect = { id: true, ticker: true, name: true, sector: true };

async function resolveUserId(explicitUserId) {
  if (explicitUserId) {
    const user = await prisma.user.findUnique({ where: { id: explicitUserId }, select: { id: true } });
    if (!user) {
      throw new AppError('User not found for watchlist creation', 404);
    }
    return user.id;
  }

  const firstUser = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' }, select: { id: true } });
  if (!firstUser) {
    throw new AppError('No users available. Seed data first or provide a valid userId.', 400);
  }

  return firstUser.id;
}

async function createWatchlist({ name, description = null, userId = null, isDefault = false }) {
  const finalUserId = await resolveUserId(userId);

  try {
    return await prisma.watchlist.create({
      data: {
        name,
        description,
        userId: finalUserId,
        isDefault,
      },
      include: {
        items: {
          include: {
            company: {
              select: watchlistCompanySelect,
            },
          },
        },
      },
    });
  } catch (error) {
    if (error?.code === 'P2002') {
      throw new AppError('A watchlist with this name already exists for the user', 409);
    }
    throw error;
  }
}

async function addWatchlistItem({ watchlistId, companyId, notes = null }) {
  const watchlist = await prisma.watchlist.findUnique({ where: { id: watchlistId }, select: { id: true } });
  if (!watchlist) {
    throw new AppError('Watchlist not found', 404);
  }

  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
  if (!company) {
    throw new AppError('Company not found', 404);
  }

  try {
    return await prisma.watchlistItem.create({
      data: {
        watchlistId,
        companyId,
        notes,
      },
      include: {
        company: {
          select: watchlistCompanySelect,
        },
      },
    });
  } catch (error) {
    if (error?.code === 'P2002') {
      throw new AppError('Company is already in this watchlist', 409);
    }
    throw error;
  }
}

async function removeWatchlistItem({ watchlistId, itemId }) {
  const watchlist = await prisma.watchlist.findUnique({ where: { id: watchlistId }, select: { id: true } });
  if (!watchlist) {
    throw new AppError('Watchlist not found', 404);
  }

  const item = await prisma.watchlistItem.findUnique({
    where: { id: itemId },
    include: { company: { select: watchlistCompanySelect } },
  });

  if (!item || item.watchlistId !== watchlistId) {
    throw new AppError('Watchlist item not found', 404);
  }

  await prisma.watchlistItem.delete({ where: { id: itemId } });
  return item;
}

async function listWatchlists({ userId = null } = {}) {
  const where = {};
  if (userId) {
    where.userId = userId;
  } else {
    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (!firstUser) {
      return [];
    }
    where.userId = firstUser.id;
  }

  return prisma.watchlist.findMany({
    where,
    include: {
      items: {
        include: {
          company: {
            select: watchlistCompanySelect,
          },
        },
        orderBy: { addedAt: 'desc' },
      },
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });
}

async function getWatchlistById({ id }) {
  return prisma.watchlist.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          company: {
            select: watchlistCompanySelect,
          },
        },
        orderBy: { addedAt: 'desc' },
      },
    },
  });
}

module.exports = {
  createWatchlist,
  addWatchlistItem,
  removeWatchlistItem,
  listWatchlists,
  getWatchlistById,
};
