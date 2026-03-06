# Stock Market Relationship Monorepo

A full-stack monorepo for exploring company relationships, synthetic market signals, and score snapshots for research workflows.

> Disclaimer: This project is for research and education only. It is not financial advice.

## Architecture overview

The repo uses npm workspaces and has three packages:

- `frontend/`: React + Vite SPA with dashboards, sortable/filterable data tables, relationship graph exploration, and watchlist workflows.
- `backend/`: Express API with Prisma + PostgreSQL persistence, scheduled jobs, and score calculation services.
- `shared/`: Reserved for cross-workspace shared code.

Runtime flow:

1. Frontend calls backend REST APIs under `/api`.
2. Backend services query Prisma models and return normalized response payloads (`{ data: ... }`).
3. Scheduler runs score recomputation and script-backed ingestion placeholders on cron schedules.

## Data model overview

Schema is defined in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).

Core entities:

- `Company`: tracked security metadata.
- `EarningsEvent`: earnings calendar and reported metrics.
- `Relationship`: directional links between companies (`SUPPLIER`, `CUSTOMER`, `PEER`, etc.) with strength/confidence.
- `SignalEvent`: timestamped events with `signalType`, `sentiment`, and confidence; optionally tied to relationships/earnings.
- `CompanyScoreSnapshot`: daily score output per company.
- `Watchlist` + `WatchlistItem`: user-defined tracking collections.
- `IngestionLog`: ingestion run auditing (status, counts, errors).

## Local setup

Prerequisites:

- Node.js 18+ (Node 20 recommended)
- npm 9+
- PostgreSQL 14+

Install dependencies from repo root:

```bash
npm install
```

Create env files:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Required backend env values (`backend/.env`):

- `PORT`
- `DATABASE_URL`
- `CLIENT_URL`
- `NODE_ENV`
- Optional: `ENABLE_SCHEDULER` (`true` by default)
- Optional cron overrides:
  - `CRON_INGEST_EARNINGS`
  - `CRON_INGEST_RELATIONSHIPS`
  - `CRON_INGEST_SIGNALS`

Required frontend env values (`frontend/.env`):

- `VITE_API_BASE_URL` (example: `http://localhost:4000/api`)

## Database + seed usage

Generate Prisma client:

```bash
npm --workspace backend run prisma:generate
```

Run migrations + seed synthetic data:

```bash
npm --workspace backend run prisma:migrate:dev
npm --workspace backend run db:seed
```

Recompute score snapshots after seed:

```bash
npm --workspace backend run scores:recompute
```

## Running locally

From repo root:

```bash
npm run dev
```

Or separately:

```bash
npm run dev:frontend
npm run dev:backend
```

Build all workspaces:

```bash
npm run build
```

## Ingestion scaffolding and cron jobs

Scheduler entrypoint: [`backend/src/scheduler/jobs.js`](backend/src/scheduler/jobs.js)

Current cron jobs:

- `ingest-earnings`
- `ingest-relationships`
- `ingest-signals`
- `recalculate-company-scores`

The three ingestion jobs call script placeholders in `scripts/ingestion/`:

- `scripts/ingestion/earningsIngestion.js`
- `scripts/ingestion/relationshipsIngestion.js`
- `scripts/ingestion/signalsIngestion.js`

Run placeholders manually:

```bash
npm run ingest:earnings
npm run ingest:relationships
npm run ingest:signals
```

## Scoring explanation

Scoring logic is in [`backend/src/services/scoringEngine.js`](backend/src/services/scoringEngine.js).

`totalScore` (clamped 0-100) is computed from:

- Base score anchor (`50`)
- Signal contribution: sentiment * confidence * freshness decay
- Relationship-weighted signal contribution: adds relationship strength/confidence weighting
- Earnings timing boost: increases score as next earnings date approaches inside configured window
- Risk penalty: clustered severe recent negative signals reduce score
- Revisions component: currently scaffolded (`enabled: false`, score `0`)

Each snapshot also stores `explanationJson` so UI can show a transparent component breakdown.

## API overview

- `GET /api/health`
- `GET /api/companies`
- `GET /api/companies/:id`
- `GET /api/earnings/upcoming`
- `GET /api/signals`
- `GET /api/relationships`
- `GET /api/scores/top`
- `GET /api/watchlists`
- `POST /api/watchlists`
- `GET /api/watchlists/:id`
- `POST /api/watchlists/:id/items`
- `DELETE /api/watchlists/:id/items/:itemId`

## Future improvements

- Replace placeholder ingestion scripts with real provider adapters and upsert pipelines.
- Persist scheduler runs into `IngestionLog` for dashboard observability.
- Add deduplication/idempotency keys for ingestion safety.
- Add alerting for ingestion failures and score anomalies.
- Introduce authentication and per-user watchlist authorization.
- Add historical backtesting and score calibration tooling.
- Add integration tests for API routes + scheduler contract tests.
