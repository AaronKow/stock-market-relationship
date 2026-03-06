# Stock Market Relationship Monorepo

A full-stack monorepo for exploring relationships between companies, earnings events, and synthetic scoring signals.

> **Disclaimer:** This project is a research and educational tool. It is **not** financial advice, investment advice, or a recommendation to buy/sell any security.

## Architecture and monorepo layout

This repository uses npm workspaces and is split into deployable apps plus a shared package:

- `frontend/` — React + Vite SPA for dashboards, tables, graph exploration, and watchlists.
- `backend/` — Node.js + Express API with Prisma/PostgreSQL persistence and scheduled score refresh jobs.
- `shared/` — Shared workspace package for cross-project code.
- `.github/workflows/ci.yml` — CI pipeline for install, optional checks, build, Prisma generation, and API smoke testing.

## Local setup prerequisites

Install the following before starting:

- Node.js 18+ (Node 20 recommended to match CI)
- npm 9+
- PostgreSQL 14+

Install dependencies from repository root:

```bash
npm install
```

## Environment configuration

Copy example env files and fill values:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### Required variables

- Frontend (`frontend/.env`)
  - `VITE_API_BASE_URL` (example: `http://localhost:4000/api`)
- Backend (`backend/.env`)
  - `PORT` (example: `4000`)
  - `DATABASE_URL` (PostgreSQL connection string)
  - `CLIENT_URL` (frontend origin, example: `http://localhost:5173`)
  - `NODE_ENV` (`development`, `production`, or `ci`)

## PostgreSQL + Prisma setup

1. Create a local PostgreSQL database (example: `stock_relationship`).
2. Set `DATABASE_URL` in `backend/.env`.
3. Generate Prisma client:

```bash
npm --workspace backend run prisma:generate
```

## Migrations + seed

Run database migrations and seed synthetic demo data:

```bash
npm --workspace backend run prisma:migrate:dev
npm --workspace backend run db:seed
```

The seeded data is synthetic and intended for research/testing workflows only.

## Run frontend/backend locally

From repository root:

```bash
npm run dev
```

Or run services independently:

```bash
npm run dev:frontend
npm run dev:backend
```

### Additional useful commands

```bash
npm run build
npm --workspace frontend run build
npm --workspace backend run build
npm --workspace backend run start
```

## API overview

Backend routes are mounted under `/api`:

- `GET /api/health` — service health and runtime metadata.
- `GET /api/companies` — company list with latest score snapshot.
- `GET /api/companies/:id` — company details + latest score explanation JSON.
- `GET /api/earnings/upcoming` — upcoming earnings feed (mock data).
- `GET /api/signals` — signal feed (mock data).
- `GET /api/relationships` — company relationship graph edges/nodes (mock data).
- `GET /api/scores/top?refresh=true|false` — top score snapshots; optional on-demand recalculation.
- `POST /api/watchlists` — create watchlist (`{ "name": "..." }`).
- `POST /api/watchlists/:id/items` — add watchlist item (`{ "companyId": number }`).
- `DELETE /api/watchlists/:id/items/:itemId` — remove watchlist item.

## Page overview (frontend)

- `/` — Dashboard summary widgets and top-level market relationship view.
- `/companies` — Company table/list and navigation to details.
- `/companies/:id` — Company details, latest score, and explanation.
- `/signals` — Signal feed view.
- `/graph` — Relationship graph exploration.
- `/watchlist` — Watchlist management flow.

## Deployment

### Netlify (frontend)

Use `frontend/netlify.toml` or equivalent UI settings:

- **Base directory (frontend root):** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Required environment variables:**
  - `VITE_API_BASE_URL` (public backend API URL including `/api`)

Recommended: keep Netlify environment values in the Netlify UI (not committed into the repo).

### Render (backend)

Use `backend/render.yaml` or equivalent UI settings:

- **Root directory (backend root):** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Health check endpoint:** `/api/health`
- **Required environment variables:**
  - `NODE_ENV=production`
  - `PORT=10000` (or Render-provided port)
  - `DATABASE_URL`
  - `CLIENT_URL` (frontend origin)

## GitHub Actions CI behavior

The CI workflow (`.github/workflows/ci.yml`) runs on pushes to `main` and all pull requests. It performs:

1. Checkout + Node 20 setup.
2. `npm ci --workspaces --include-workspace-root`.
3. Optional `lint`/`test` scripts if defined in root/frontend/backend.
4. Frontend build validation.
5. Backend Prisma client generation.
6. Backend build validation.
7. Backend startup smoke test against `http://127.0.0.1:$PORT/api/health`.

## UI copy guidance (disclaimer language)

Any user-facing area that displays scores, rankings, or “signals” should include explicit cautionary text such as:

- “For research purposes only — not financial advice.”
- “Synthetic/experimental analytics; verify independently before making decisions.”

Recommended placements:

- Dashboard header/subheader.
- Signals page near filters/table.
- Company detail score card footnote.
- Watchlist actions and alert-like UI elements.

## Future improvements

- **Live ingestion:** Replace mock feeds with scheduled/streaming market + earnings data ingestion.
- **Alerts:** Add threshold/event-based notifications (email/webhooks/in-app).
- **Backtesting:** Evaluate score behavior against historical outcomes with configurable windows.
- **Auth hardening:** Add robust authentication, authorization, audit logging, and rate limits.
- **Deploy hooks:** Introduce secure deploy-hook orchestration for release automation across Netlify/Render.

