# Stock Market Relationship Monorepo

This repository is organized as an npm workspaces monorepo with independently deployable applications and shared code.

## Workspace layout

- `frontend/` — Front-end app (Netlify-friendly scripts).
- `backend/` — Back-end API/service (Render-friendly scripts).
- `shared/` — Reusable shared package for cross-workspace logic/types.

## Prerequisites

- Node.js 18+
- npm 9+

## Install

```bash
npm install
```

## Root scripts

- `npm run dev` — Run frontend and backend dev servers together.
- `npm run dev:frontend` — Run frontend workspace dev server.
- `npm run dev:backend` — Run backend workspace dev server.
- `npm run build` — Build all workspaces.

## Workspace scripts

Each workspace has independent scripts for local development and deployment environments.

### frontend

- `npm --workspace frontend run dev`
- `npm --workspace frontend run build`
- `npm --workspace frontend run start`

### backend

- `npm --workspace backend run dev`
- `npm --workspace backend run build`
- `npm --workspace backend run start`
- `npm --workspace backend run db:seed`

### Database setup and synthetic seeding

The backend uses Prisma with PostgreSQL. To initialize and seed local data:

```bash
npm --workspace backend run prisma:generate
npm --workspace backend run prisma:migrate:dev
npm run db:seed
```

Seed output is intentionally synthetic and exists only for development/demo workflows. It is fictional and **not investment advice**.

### shared

- `npm --workspace shared run build`

## Deployment compatibility notes

- **Netlify (`frontend`)**: Use `npm --workspace frontend run build` as build command; publish directory is framework-specific (commonly `frontend/dist`).
- **Render (`backend`)**: Build with `npm --workspace backend run build` and run with `npm --workspace backend run start`.
