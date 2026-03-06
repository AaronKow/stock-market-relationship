const companies = [
  { id: 1, ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { id: 2, ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { id: 3, ticker: 'TSLA', name: 'Tesla, Inc.', sector: 'Consumer Cyclical' },
];

const upcomingEarnings = [
  { id: 1, companyId: 1, date: '2026-04-28', session: 'after_close' },
  { id: 2, companyId: 2, date: '2026-04-30', session: 'after_close' },
];

const signals = [
  { id: 1, companyId: 1, type: 'momentum', strength: 0.86 },
  { id: 2, companyId: 3, type: 'volatility', strength: 0.73 },
];

const relationships = [
  { id: 1, sourceCompanyId: 1, targetCompanyId: 2, type: 'supplier', weight: 0.52 },
  { id: 2, sourceCompanyId: 3, targetCompanyId: 1, type: 'competitor', weight: 0.61 },
];

const topScores = [
  { companyId: 1, score: 97 },
  { companyId: 2, score: 93 },
  { companyId: 3, score: 89 },
];

const watchlists = [];

module.exports = {
  companies,
  upcomingEarnings,
  signals,
  relationships,
  topScores,
  watchlists,
};
