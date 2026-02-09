# Beta Live Ads Platform (MVP)

Production focused monorepo for self-owned Twitch live ad delivery with OBS overlay control, strict event ingestion, proof of delivery, and campaign reporting.

## Monorepo layout

- `apps/api`, NestJS + Fastify API with WebSockets (`/overlay`, `/dashboard`)
- `apps/worker`, BullMQ aggregation worker
- `apps/portal`, Next.js App Router portal (agency, streamer, admin pages)
- `apps/overlay`, Next.js public overlay route (`/overlay?key=...`) for OBS Browser Source
- `packages/db`, Prisma schema, client, and seed
- `packages/shared`, shared types, zod schemas, event contracts, RBAC permissions
- `packages/ui`, shared UI primitives
- `infra/docker-compose.yml`, local Postgres, Redis, MinIO

## MVP behavior

- Impression definition is strict, `ad_completed` only
- Click definition includes overlay `ad_click` and can be extended for shortlinks
- Session definition uses connection heartbeat continuity with 5 minute disconnect grace
- All timestamps are UTC
- Event table is append only and validated against strict schema

## Security and reliability highlights

- Overlay keys are long random secrets and stored as SHA-256 hash
- Overlay keys are redacted from API logs
- Event ingestion is rate limited by overlay key and source IP
- Payload size is capped to 16KB in schema validation
- Explicit permission checks for every protected endpoint via RBAC guard
- Request IDs are attached to responses and event payloads
- Prometheus metrics endpoint at `GET /metrics`

## Local setup

### 1) Install dependencies

```bash
pnpm install
```

### 2) Start infra

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 3) Configure env files

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/portal/.env.example apps/portal/.env
cp apps/overlay/.env.example apps/overlay/.env
cp packages/db/.env.example packages/db/.env
```

### 4) Prisma generate and migrate

```bash
pnpm --filter @beta/db prisma generate
pnpm db:migrate
```

### 5) Seed data

```bash
pnpm db:seed
```

The seed prints one demo overlay key once. Save it immediately.

### 6) Start all services

```bash
pnpm dev
```

Services:

- Portal, `http://localhost:3000`
- Overlay app, `http://localhost:3001`
- API, `http://localhost:4000`
- Worker runs in background in Turbo process group

## Core endpoint map (MVP)

### Auth

- `POST /auth/request-magic-link`
- `POST /auth/verify-magic-link`
- `POST /auth/logout`

### User and streamer

- `GET /me`
- `POST /streamers/profile`
- `GET /streamers/profile`
- `POST /streamers/channels`
- `GET /streamers/channels`
- `POST /overlay/rotate-key`

### Campaign and delivery

- `POST /campaigns`
- `GET /campaigns`
- `GET /campaigns/:id`
- `POST /campaigns/:id/flights`
- `POST /campaigns/:id/assign-streamers`
- `POST /creatives` (multipart upload to S3 compatible storage)
- `GET /creatives/:id`
- `POST /deliveries/trigger`

### Tracking and reports

- `POST /events/ingest` (auth via `x-overlay-key`)
- `GET /reports/campaign/:id/summary`
- `GET /reports/campaign/:id/proof-timeline`
- `GET /reports/campaign/:id/export.csv`
- `GET /reports/campaign/:id/export.pdf`

### Payouts and admin

- `GET /payouts/run?campaignId=...`
- `POST /payouts/:id/mark-paid`
- `GET /admin/audit`

## Tests

Run all tests:

```bash
pnpm test
```

Included meaningful tests:

- `packages/shared/tests/events.test.ts`, strict event schema and RBAC checks
- `apps/api/test/delivery-policy.test.ts`, pacing and cap enforcement
- `apps/api/test/payouts-calculation.test.ts`, payout logic for CPM and fixed fee

## GitHub Pages (portal frontend)

Static portal output is published from `docs/`, ready for GitHub Pages branch deployment.

Expected URL:

- `https://<github-username>.github.io/<repo-name>/`
- Example route, `https://<github-username>.github.io/<repo-name>/streamer/`

How to deploy in GitHub:

1. Open repository `Settings`, then `Pages`
2. Under `Build and deployment`, set source to `Deploy from a branch`
3. Branch `main`, folder `/docs`
4. Save, GitHub will publish the static portal

## Observability

- Structured logs through Fastify logger
- Per request `x-request-id`
- `GET /metrics` exposes process and custom counters:
  - `beta_ads_events_ingested_total`
  - `beta_ads_delivery_commands_total`

## Notes

- This MVP favors reliability and explicit validation over feature breadth.
- Email delivery is intentionally stubbed in development, magic link is returned in API response.
- PDF export is server side generated through `pdfkit` in API reporting module.
- Worker aggregation currently scans the last 30 days each run, this can be optimized with incremental checkpoints in a follow-up.
