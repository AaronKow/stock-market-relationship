const express = require('express');
const { companies, upcomingEarnings, signals, relationships, topScores, watchlists } = require('../data/mockData');
const AppError = require('../utils/appError');
const { validate, requireNumericParam, requireBody } = require('../middleware/validate');

const router = express.Router();

function mergeValidators(...validators) {
  return (req) => validators.flatMap((validator) => validator(req));
}

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

router.get('/companies', (req, res) => {
  res.json({ data: companies });
});

router.get('/companies/:id', validate(requireNumericParam('id')), (req, res, next) => {
  const company = companies.find((entry) => entry.id === Number(req.params.id));

  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  return res.json({ data: company });
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

router.get('/scores/top', (req, res) => {
  res.json({ data: topScores });
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

    if (!companies.some((company) => company.id === companyId)) {
      return next(new AppError('Company not found', 404));
    }

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
