const express = require('express');
const AppError = require('../utils/appError');
const {
  validate,
  mergeValidators,
  requireUuidParam,
  requireUuidBody,
  optionalUuidBody,
  requireNonEmptyStringBody,
  optionalStringBody,
  optionalBooleanBody,
} = require('../middleware/validate');
const { listCompanies, getCompanyById, upsertCompany } = require('../services/companiesService');
const { getUpcomingEarnings } = require('../services/earningsService');
const { listSignals } = require('../services/signalsService');
const { listRelationships } = require('../services/relationshipsService');
const { parseBooleanFlag, listTopScores } = require('../services/scoresService');
const { runManualIngestion } = require('../services/manualIngestionService');
const {
  createWatchlist,
  addWatchlistItem,
  removeWatchlistItem,
  listWatchlists,
  getWatchlistById,
} = require('../services/watchlistsService');

const router = express.Router();

function parsePositiveInt(value, fallback, max = 500) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('Validation failed', 400, [{ field: 'query', message: 'Expected a positive integer parameter' }]);
  }

  return Math.min(parsed, max);
}

function validateOptionalUuidQuery(fieldName) {
  return (req, res, next) => {
    const value = req.query[fieldName];
    if (value === undefined) {
      return next();
    }

    const isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value));
    if (!isValid) {
      return next(new AppError('Validation failed', 400, [{ field: `query.${fieldName}`, message: 'Must be a UUID' }]));
    }

    return next();
  };
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
    const data = await listCompanies();
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/companies',
  validate(
    mergeValidators(
      requireNonEmptyStringBody('ticker'),
      optionalStringBody('name', 120),
      optionalStringBody('sector', 80),
      optionalStringBody('industry', 120),
      optionalStringBody('exchange', 40),
      optionalStringBody('country', 40),
    ),
  ),
  async (req, res, next) => {
    try {
      const data = await upsertCompany({
        ticker: req.body.ticker,
        name: req.body.name ?? null,
        sector: req.body.sector ?? null,
        industry: req.body.industry ?? null,
        exchange: req.body.exchange ?? null,
        country: req.body.country ?? null,
      });
      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  },
);

router.get('/companies/:id', validate(requireUuidParam('id')), async (req, res, next) => {
  try {
    const data = await getCompanyById(req.params.id);

    if (!data) {
      return next(new AppError('Company not found', 404));
    }

    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get('/earnings/upcoming', async (req, res, next) => {
  try {
    const windowDays = parsePositiveInt(req.query.days, 30, 365);
    const data = await getUpcomingEarnings({ windowDays });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get('/signals', validateOptionalUuidQuery('companyId'), async (req, res, next) => {
  try {
    const limit = parsePositiveInt(req.query.limit, 100, 500);
    const data = await listSignals({
      companyId: req.query.companyId,
      limit,
    });

    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get('/relationships', validateOptionalUuidQuery('companyId'), async (req, res, next) => {
  try {
    const data = await listRelationships({ companyId: req.query.companyId });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get('/scores/top', async (req, res, next) => {
  try {
    const refresh = parseBooleanFlag(req.query.refresh);
    const limit = parsePositiveInt(req.query.limit, 25, 100);

    const snapshots = await listTopScores({ refresh, limit });

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

router.post('/ingestion/run', validate(optionalUuidBody('companyId')), async (req, res, next) => {
  try {
    const data = await runManualIngestion({
      companyId: req.body.companyId ?? null,
    });

    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/watchlists',
  validate(
    mergeValidators(
      requireNonEmptyStringBody('name'),
      optionalStringBody('description', 500),
      optionalUuidBody('userId'),
      optionalBooleanBody('isDefault'),
    ),
  ),
  async (req, res, next) => {
    try {
      const data = await createWatchlist({
        name: req.body.name.trim(),
        description: req.body.description?.trim() || null,
        userId: req.body.userId ?? null,
        isDefault: req.body.isDefault ?? false,
      });

      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  },
);

router.get('/watchlists', async (req, res, next) => {
  try {
    const data = await listWatchlists({
      userId: req.query.userId ?? null,
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.get('/watchlists/:id', validate(requireUuidParam('id')), async (req, res, next) => {
  try {
    const data = await getWatchlistById({ id: req.params.id });
    if (!data) {
      return next(new AppError('Watchlist not found', 404));
    }
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/watchlists/:id/items',
  validate(mergeValidators(requireUuidParam('id'), requireUuidBody('companyId'), optionalStringBody('notes', 500))),
  async (req, res, next) => {
    try {
      const data = await addWatchlistItem({
        watchlistId: req.params.id,
        companyId: req.body.companyId,
        notes: req.body.notes?.trim() || null,
      });

      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  },
);

router.delete(
  '/watchlists/:id/items/:itemId',
  validate(mergeValidators(requireUuidParam('id'), requireUuidParam('itemId'))),
  async (req, res, next) => {
    try {
      const data = await removeWatchlistItem({
        watchlistId: req.params.id,
        itemId: req.params.itemId,
      });

      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  },
);

module.exports = router;
