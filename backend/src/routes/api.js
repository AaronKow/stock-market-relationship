const express = require('express');
const { upcomingEarnings, signals, relationships, watchlists } = require('../data/mockData');
const AppError = require('../utils/appError');
const { validate, requireNumericParam, requireBody } = require('../middleware/validate');
const { prisma } = require('../services/prisma');
const { recalculateAllCompanyScores } = require('../services/scoringEngine');

const router = express.Router();

function mergeValidators(...validators) {
  return (req) => validators.flatMap((validator) => validator(req));
}

function parseBooleanFlag(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

router.get('/companies', async (req, res, next) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        scoreSnapshots: {
          orderBy: { snapshotDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { ticker: 'asc' },
    });

    const data = companies.map((company) => ({
      ...company,
      latestScore: company.scoreSnapshots[0] ?? null,
      scoreSnapshots: undefined,
    }));

    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get('/companies/:id', async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        scoreSnapshots: {
          orderBy: { snapshotDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!company) {
      return next(new AppError('Company not found', 404));
    }

    return res.json({
      data: {
        ...company,
        latestScore: company.scoreSnapshots[0] ?? null,
        latestScoreExplanation: company.scoreSnapshots[0]?.explanationJson ?? null,
        scoreSnapshots: undefined,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/earnings/upcoming', (req, res) => {
  res.json({ data: upcomingEarnings });
});

router.get('/signals', (req, res) => {
  res.json({ data: signals });
});

router.get('/relationships', (req, res) => {
  res.json({ data: relationships });
});

router.get('/scores/top', async (req, res, next) => {
  try {
    const shouldRefresh = parseBooleanFlag(req.query.refresh);

    if (shouldRefresh) {
      await recalculateAllCompanyScores();
    }

    const latest = await prisma.companyScoreSnapshot.aggregate({
      _max: { snapshotDate: true },
    });

    if (!latest._max.snapshotDate) {
      return res.json({ data: [] });
    }

    const snapshots = await prisma.companyScoreSnapshot.findMany({
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
      take: 25,
    });

    return res.json({
      data: snapshots.map((snapshot) => ({
        ...snapshot,
        explanation: snapshot.explanationJson ?? null,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/watchlists', validate(requireBody(['name'])), (req, res) => {
  const watchlist = {
    id: watchlists.length + 1,
    name: req.body.name,
    items: [],
  };

  watchlists.push(watchlist);

  res.status(201).json({ data: watchlist });
});

router.post(
  '/watchlists/:id/items',
  validate(mergeValidators(requireNumericParam('id'), requireBody(['companyId']))),
  (req, res, next) => {
    const watchlist = watchlists.find((entry) => entry.id === Number(req.params.id));

    if (!watchlist) {
      return next(new AppError('Watchlist not found', 404));
    }

    const companyId = Number(req.body.companyId);

    const item = {
      id: watchlist.items.length + 1,
      companyId,
    };

    watchlist.items.push(item);

    return res.status(201).json({ data: item });
  },
);

router.delete(
  '/watchlists/:id/items/:itemId',
  validate(mergeValidators(requireNumericParam('id'), requireNumericParam('itemId'))),
  (req, res, next) => {
    const watchlist = watchlists.find((entry) => entry.id === Number(req.params.id));

    if (!watchlist) {
      return next(new AppError('Watchlist not found', 404));
    }

    const itemIndex = watchlist.items.findIndex((item) => item.id === Number(req.params.itemId));

    if (itemIndex < 0) {
      return next(new AppError('Watchlist item not found', 404));
    }

    const [removed] = watchlist.items.splice(itemIndex, 1);

    return res.json({ data: removed });
  },
);

module.exports = router;
