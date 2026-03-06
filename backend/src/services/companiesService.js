const { prisma } = require('./prisma');
const { companyWithLatestScore, toCompanyWithLatestScore } = require('./companyProjection');
const AppError = require('../utils/appError');

function normalizeTicker(value) {
  const ticker = String(value || '')
    .trim()
    .toUpperCase();

  if (!ticker) {
    throw new AppError('Ticker is required', 400, [{ field: 'body.ticker', message: 'Must be a non-empty string' }]);
  }

  if (!/^[A-Z0-9.-]{1,12}$/.test(ticker)) {
    throw new AppError('Invalid ticker format', 400, [
      { field: 'body.ticker', message: 'Use 1-12 chars: A-Z, 0-9, dot, or hyphen' },
    ]);
  }

  return ticker;
}

async function listCompanies() {
  const companies = await prisma.company.findMany({
    include: companyWithLatestScore,
    orderBy: { ticker: 'asc' },
  });

  return companies.map(toCompanyWithLatestScore);
}

async function getCompanyById(id) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: companyWithLatestScore,
  });

  if (!company) {
    return null;
  }

  const projected = toCompanyWithLatestScore(company);
  return {
    ...projected,
    latestScoreExplanation: projected.latestScore?.explanationJson ?? null,
  };
}

async function upsertCompany({ ticker, name = null, sector = null, industry = null, exchange = null, country = null }) {
  const normalizedTicker = normalizeTicker(ticker);
  const normalizedName = String(name || '').trim() || normalizedTicker;

  const company = await prisma.company.upsert({
    where: { ticker: normalizedTicker },
    create: {
      ticker: normalizedTicker,
      name: normalizedName,
      sector: String(sector || '').trim() || null,
      industry: String(industry || '').trim() || null,
      exchange: String(exchange || '').trim() || null,
      country: String(country || '').trim() || null,
    },
    update: {
      name: normalizedName,
      sector: String(sector || '').trim() || undefined,
      industry: String(industry || '').trim() || undefined,
      exchange: String(exchange || '').trim() || undefined,
      country: String(country || '').trim() || undefined,
    },
    include: companyWithLatestScore,
  });

  return toCompanyWithLatestScore(company);
}

module.exports = {
  listCompanies,
  getCompanyById,
  upsertCompany,
};
