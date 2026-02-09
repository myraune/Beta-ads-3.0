# Phase 1

Goal: Scaffold monorepo foundations, CI, Docker infra, root scripts, and environment templates.

Files:
- /Users/myraune/Desktop/beta ads/.gitignore
- /Users/myraune/Desktop/beta ads/package.json
- /Users/myraune/Desktop/beta ads/pnpm-workspace.yaml
- /Users/myraune/Desktop/beta ads/turbo.json
- /Users/myraune/Desktop/beta ads/tsconfig.base.json
- /Users/myraune/Desktop/beta ads/.env.example
- /Users/myraune/Desktop/beta ads/infra/docker-compose.yml
- /Users/myraune/Desktop/beta ads/.github/workflows/ci.yml
- /Users/myraune/Desktop/beta ads/README.md

How to run locally:
```bash
pnpm install
docker compose -f infra/docker-compose.yml up -d
```

Minimal tests:
```bash
pnpm lint
```

## .gitignore

```txt
node_modules
.pnpm-store
.env
.env.*
!.env.example
.next
dist
coverage
.turbo
*.log
.DS_Store
apps/**/.next
packages/db/generated
output
tmp

```

## package.json

```json
{
  "name": "beta-live-ads-platform",
  "private": true,
  "packageManager": "pnpm@10.28.2",
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "db:migrate": "pnpm --filter @beta/db prisma migrate dev",
    "db:deploy": "pnpm --filter @beta/db prisma migrate deploy",
    "db:seed": "pnpm --filter @beta/db db:seed",
    "db:studio": "pnpm --filter @beta/db prisma studio"
  },
  "devDependencies": {
    "@types/node": "^22.13.4",
    "eslint": "^9.20.1",
    "prettier": "^3.5.0",
    "turbo": "^2.4.2",
    "typescript": "^5.8.2",
    "vitest": "^3.0.6"
  }
}

```

## pnpm-workspace.yaml

```yaml
packages:
  - apps/*
  - packages/*

```

## turbo.json

```json
{
  "$schema": "https://turborepo.org/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "dependsOn": ["^dev"],
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    }
  }
}

```

## tsconfig.base.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": "."
  }
}

```

## .env.example

```txt
NODE_ENV=development
DATABASE_URL=postgresql://beta:beta@localhost:5432/beta_ads?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace-with-long-random-secret
MAGIC_LINK_BASE_URL=http://localhost:3000
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=beta-ads
S3_FORCE_PATH_STYLE=true
API_PORT=4000
WORKER_CONCURRENCY=5
PORTAL_URL=http://localhost:3000
OVERLAY_URL=http://localhost:3001

```

## infra/docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: beta-ads-postgres
    environment:
      POSTGRES_DB: beta_ads
      POSTGRES_USER: beta
      POSTGRES_PASSWORD: beta
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U beta -d beta_ads"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: beta-ads-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:RELEASE.2025-01-20T14-49-07Z
    container_name: beta-ads-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data

  minio-init:
    image: minio/mc:RELEASE.2025-01-17T23-25-50Z
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      mc alias set local http://minio:9000 minioadmin minioadmin;
      mc mb -p local/beta-ads || true;
      mc anonymous set public local/beta-ads;
      exit 0;
      "

volumes:
  postgres-data:
  minio-data:

```

## .github/workflows/ci.yml

```yaml
name: ci

on:
  push:
    branches: ["main", "codex/**"]
  pull_request:

jobs:
  lint-test-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.28.2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - name: Install
        run: pnpm install --frozen-lockfile
      - name: Lint
        run: pnpm lint
      - name: Test
        run: pnpm test
      - name: Build
        run: pnpm build

```

## README.md

```md
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

```

# Phase 2

Goal: Build shared contracts and database models with strict validation, RBAC, and seed data.

Files:
- /Users/myraune/Desktop/beta ads/packages/shared/package.json
- /Users/myraune/Desktop/beta ads/packages/shared/tsconfig.json
- /Users/myraune/Desktop/beta ads/packages/shared/src/enums.ts
- /Users/myraune/Desktop/beta ads/packages/shared/src/rbac.ts
- /Users/myraune/Desktop/beta ads/packages/shared/src/events.ts
- /Users/myraune/Desktop/beta ads/packages/shared/src/schemas.ts
- /Users/myraune/Desktop/beta ads/packages/shared/src/index.ts
- /Users/myraune/Desktop/beta ads/packages/shared/tests/events.test.ts
- /Users/myraune/Desktop/beta ads/packages/db/package.json
- /Users/myraune/Desktop/beta ads/packages/db/tsconfig.json
- /Users/myraune/Desktop/beta ads/packages/db/.env.example
- /Users/myraune/Desktop/beta ads/packages/db/prisma/schema.prisma
- /Users/myraune/Desktop/beta ads/packages/db/prisma/seed.ts
- /Users/myraune/Desktop/beta ads/packages/db/src/index.ts

How to run locally:
```bash
pnpm --filter @beta/db prisma generate
pnpm db:migrate
pnpm db:seed
```

Minimal tests:
```bash
pnpm --filter @beta/shared test
```

## packages/shared/package.json

```json
{
  "name": "@beta/shared",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "src/index.ts",
  "scripts": {
    "dev": "tsc -w -p tsconfig.json",
    "build": "tsc -p tsconfig.json",
    "lint": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "typescript": "^5.8.2",
    "vitest": "^3.0.6"
  }
}

```

## packages/shared/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}

```

## packages/shared/src/enums.ts

```ts
export const ROLES = ["admin", "agency", "brand", "streamer", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const EVENT_TYPES = [
  "overlay_connected",
  "overlay_heartbeat",
  "overlay_disconnected",
  "session_started",
  "session_ended",
  "ad_candidate_selected",
  "ad_command_sent",
  "ad_rendered",
  "ad_completed",
  "ad_click",
  "ad_error"
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const CAMPAIGN_STATUSES = ["draft", "submitted", "approved", "rejected", "active", "paused", "completed"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CREATIVE_FORMATS = ["image", "gif", "mp4"] as const;
export type CreativeFormat = (typeof CREATIVE_FORMATS)[number];

export const APPROVAL_STATUSES = ["draft", "submitted", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const PAYOUT_STATUSES = ["pending", "paid"] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

```

## packages/shared/src/rbac.ts

```ts
import type { Role } from "./enums";

export const PERMISSIONS = {
  auth: ["request_magic_link", "verify_magic_link", "logout"],
  users: ["read_me"],
  streamers: ["upsert_profile", "read_profile", "create_channel", "read_channels", "rotate_overlay_key"],
  campaigns: ["create", "read", "read_one", "create_flight", "assign_streamers"],
  creatives: ["upload", "read"],
  deliveries: ["trigger"],
  events: ["ingest"],
  reports: ["summary", "export_csv", "export_pdf"],
  payouts: ["run", "mark_paid"],
  admin: ["audit"]
} as const;

export type Resource = keyof typeof PERMISSIONS;
export type Permission<R extends Resource = Resource> = `${R}:${(typeof PERMISSIONS)[R][number]}`;

export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "users:read_me",
    "streamers:upsert_profile",
    "streamers:read_profile",
    "streamers:create_channel",
    "streamers:read_channels",
    "streamers:rotate_overlay_key",
    "campaigns:create",
    "campaigns:read",
    "campaigns:read_one",
    "campaigns:create_flight",
    "campaigns:assign_streamers",
    "creatives:upload",
    "creatives:read",
    "deliveries:trigger",
    "events:ingest",
    "reports:summary",
    "reports:export_csv",
    "reports:export_pdf",
    "payouts:run",
    "payouts:mark_paid",
    "admin:audit"
  ],
  agency: [
    "users:read_me",
    "campaigns:create",
    "campaigns:read",
    "campaigns:read_one",
    "campaigns:create_flight",
    "campaigns:assign_streamers",
    "creatives:upload",
    "creatives:read",
    "deliveries:trigger",
    "reports:summary",
    "reports:export_csv",
    "reports:export_pdf",
    "payouts:run"
  ],
  brand: [
    "users:read_me",
    "campaigns:read",
    "campaigns:read_one",
    "creatives:read",
    "reports:summary",
    "reports:export_csv",
    "reports:export_pdf"
  ],
  streamer: [
    "users:read_me",
    "streamers:upsert_profile",
    "streamers:read_profile",
    "streamers:create_channel",
    "streamers:read_channels",
    "streamers:rotate_overlay_key",
    "reports:summary"
  ],
  viewer: ["users:read_me"]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

```

## packages/shared/src/events.ts

```ts
import { z } from "zod";
import { EVENT_TYPES } from "./enums";

const uuidField = z.string().uuid();

export const overlayEventSchema = z
  .object({
    id: uuidField.optional(),
    type: z.enum(EVENT_TYPES),
    ts: z.coerce.date(),
    request_id: z.string().min(6).max(128),
    streamer_id: uuidField.nullable().optional(),
    channel_id: uuidField.nullable().optional(),
    session_id: uuidField.nullable().optional(),
    campaign_id: uuidField.nullable().optional(),
    creative_id: uuidField.nullable().optional(),
    payload: z.record(z.any()).default({})
  })
  .superRefine((value, ctx) => {
    const payloadBytes = Buffer.byteLength(JSON.stringify(value.payload), "utf8");
    if (payloadBytes > 16_384) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payload"],
        message: "payload exceeds 16KB"
      });
    }
  });

export type OverlayEventInput = z.infer<typeof overlayEventSchema>;

export const overlayCommandSchema = z.object({
  commandId: z.string().uuid(),
  campaignId: z.string().uuid(),
  creativeId: z.string().uuid(),
  durationSec: z.number().int().positive().max(120),
  assetUrl: z.string().url(),
  clickUrl: z.string().url().optional(),
  animation: z.enum(["fade", "slide", "pulse"]).default("fade")
});

export type OverlayCommand = z.infer<typeof overlayCommandSchema>;

```

## packages/shared/src/schemas.ts

```ts
import { z } from "zod";
import { CAMPAIGN_STATUSES, CREATIVE_FORMATS } from "./enums";

export const requestMagicLinkSchema = z.object({
  email: z.string().email()
});

export const verifyMagicLinkSchema = z.object({
  email: z.string().email(),
  token: z.string().min(20).max(256)
});

export const streamerProfileSchema = z.object({
  displayName: z.string().min(2).max(80),
  twitchHandle: z.string().min(2).max(80),
  country: z.string().min(2).max(2),
  language: z.string().min(2).max(8),
  categories: z.array(z.string().min(2).max(40)).max(10),
  avgViewers: z.number().int().min(0).max(1_000_000),
  pricingTier: z.string().min(1).max(40)
});

export const channelSchema = z.object({
  twitchChannelName: z.string().min(2).max(120),
  country: z.string().min(2).max(2),
  language: z.string().min(2).max(8),
  categories: z.array(z.string().min(2).max(40)).max(10),
  avgViewers: z.number().int().min(0).max(1_000_000),
  pricingTier: z.string().min(1).max(40)
});

export const campaignCreateSchema = z.object({
  name: z.string().min(2).max(120),
  advertiser: z.string().min(2).max(120),
  objective: z.string().min(2).max(256),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  budget: z.number().positive(),
  currency: z.string().length(3),
  targeting: z.record(z.any()).default({}),
  status: z.enum(CAMPAIGN_STATUSES).default("draft")
});

export const flightCreateSchema = z.object({
  pacingPerHour: z.number().int().min(1).max(1_000),
  capPerStreamerPerHour: z.number().int().min(1).max(200),
  capPerSession: z.number().int().min(1).max(200),
  allowedFormats: z.array(z.enum(CREATIVE_FORMATS)).min(1)
});

export const assignStreamerSchema = z.object({
  streamerChannelIds: z.array(z.string().uuid()).min(1),
  cpmRate: z.number().positive().optional(),
  fixedFee: z.number().positive().optional()
});

export const deliveryTriggerSchema = z.object({
  channelId: z.string().uuid(),
  campaignId: z.string().uuid().optional(),
  creativeId: z.string().uuid().optional(),
  durationSec: z.number().int().positive().max(120).default(15)
});

```

## packages/shared/src/index.ts

```ts
export * from "./enums";
export * from "./events";
export * from "./rbac";
export * from "./schemas";

```

## packages/shared/tests/events.test.ts

```ts
import { describe, expect, it } from "vitest";
import { hasPermission, overlayEventSchema } from "../src";

describe("overlayEventSchema", () => {
  it("accepts valid ad_completed events", () => {
    const parsed = overlayEventSchema.parse({
      type: "ad_completed",
      ts: new Date().toISOString(),
      request_id: "req_123456",
      channel_id: "4cd98059-53bf-4731-bc82-4b3f4bef6c34",
      payload: { durationSec: 30 }
    });

    expect(parsed.type).toBe("ad_completed");
  });

  it("rejects payloads larger than 16KB", () => {
    expect(() =>
      overlayEventSchema.parse({
        type: "ad_completed",
        ts: new Date().toISOString(),
        request_id: "req_123456",
        payload: { huge: "x".repeat(17_000) }
      })
    ).toThrow(/16KB/);
  });
});

describe("rbac", () => {
  it("allows agency delivery trigger", () => {
    expect(hasPermission("agency", "deliveries:trigger")).toBe(true);
  });

  it("blocks viewer from admin audit", () => {
    expect(hasPermission("viewer", "admin:audit")).toBe(false);
  });
});

```

## packages/db/package.json

```json
{
  "name": "@beta/db",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "src/index.ts",
  "scripts": {
    "dev": "prisma generate && tsc -w -p tsconfig.json",
    "build": "prisma generate && tsc -p tsconfig.json",
    "lint": "tsc -p tsconfig.json --noEmit",
    "test": "echo 'No db tests'",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "prisma": "prisma",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^6.3.1"
  },
  "devDependencies": {
    "prisma": "^6.3.1",
    "tsx": "^4.19.2",
    "typescript": "^5.8.2"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}

```

## packages/db/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "dist"
  },
  "include": ["src", "prisma/seed.ts"]
}

```

## packages/db/.env.example

```txt
DATABASE_URL=postgresql://beta:beta@localhost:5432/beta_ads?schema=public

```

## packages/db/prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  admin
  agency
  brand
  streamer
  viewer
}

enum CampaignStatus {
  draft
  submitted
  approved
  rejected
  active
  paused
  completed
}

enum CreativeFormat {
  image
  gif
  mp4
}

enum ApprovalStatus {
  draft
  submitted
  approved
  rejected
}

enum SessionStatus {
  active
  disconnected
  ended
}

enum EventType {
  overlay_connected
  overlay_heartbeat
  overlay_disconnected
  session_started
  session_ended
  ad_candidate_selected
  ad_command_sent
  ad_rendered
  ad_completed
  ad_click
  ad_error
}

enum PayoutRateType {
  cpm
  fixed
}

enum PayoutStatus {
  pending
  paid
}

model User {
  id              String           @id @default(uuid())
  email           String           @unique
  role            Role             @default(streamer)
  passwordHash    String?
  emailVerifiedAt DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  streamerProfile StreamerProfile?
  magicLinks      MagicLinkToken[]
  auditLogs       AuditLog[]
}

model MagicLinkToken {
  id         String    @id @default(uuid())
  userId     String
  tokenHash  String    @unique
  expiresAt  DateTime
  consumedAt DateTime?
  createdAt  DateTime  @default(now())
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, expiresAt])
}

model StreamerProfile {
  id          String              @id @default(uuid())
  userId      String              @unique
  displayName String?
  twitchHandle String?
  country     String?
  language    String?
  categories  String[]            @default([])
  avgViewers  Int?
  pricingTier String?
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  channels    Channel[]
  sessions    StreamSession[]
  events      Event[]

  @@index([twitchHandle])
}

model Channel {
  id               String               @id @default(uuid())
  streamerProfileId String
  twitchChannelName String
  country          String
  language         String
  categories       String[]             @default([])
  avgViewers       Int
  pricingTier      String
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt
  streamerProfile  StreamerProfile      @relation(fields: [streamerProfileId], references: [id], onDelete: Cascade)
  overlayCredential OverlayCredential?
  sessions         StreamSession[]
  assignments      CampaignAssignment[]
  payouts          Payout[]
  events           Event[]
  metrics          DailyMetric[]

  @@index([streamerProfileId])
}

model OverlayCredential {
  id        String   @id @default(uuid())
  channelId String   @unique
  keyHash   String
  keyPrefix String
  createdAt DateTime @default(now())
  rotatedAt DateTime @default(now())
  channel   Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)
}

model StreamSession {
  id               String         @id @default(uuid())
  streamerProfileId String
  channelId        String
  startedAt        DateTime       @default(now())
  endedAt          DateTime?
  lastHeartbeatAt  DateTime       @default(now())
  status           SessionStatus  @default(active)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  streamerProfile  StreamerProfile @relation(fields: [streamerProfileId], references: [id], onDelete: Cascade)
  channel          Channel        @relation(fields: [channelId], references: [id], onDelete: Cascade)
  events           Event[]

  @@index([channelId, startedAt])
  @@index([lastHeartbeatAt])
}

model Campaign {
  id         String               @id @default(uuid())
  name       String
  advertiser String
  objective  String
  startDate  DateTime
  endDate    DateTime
  budget     Decimal              @db.Decimal(14, 2)
  currency   String
  status     CampaignStatus       @default(draft)
  targeting  Json
  createdAt  DateTime             @default(now())
  updatedAt  DateTime             @updatedAt
  flights    Flight[]
  creatives  Creative[]
  assignments CampaignAssignment[]
  payouts    Payout[]
  events     Event[]
  metrics    DailyMetric[]

  @@index([status, startDate, endDate])
}

model Flight {
  id                   String           @id @default(uuid())
  campaignId           String
  pacingPerHour        Int
  capPerStreamerPerHour Int
  capPerSession        Int
  allowedFormats       CreativeFormat[]
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt
  campaign             Campaign         @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@index([campaignId])
}

model Creative {
  id             String         @id @default(uuid())
  campaignId     String
  format         CreativeFormat
  durationSec    Int
  clickUrl       String
  fallbackUrl    String?
  objectKey      String
  mimeType       String
  sizeBytes      Int
  approvalStatus ApprovalStatus @default(draft)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  campaign       Campaign       @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  events         Event[]

  @@index([campaignId, approvalStatus])
}

model CampaignAssignment {
  id         String    @id @default(uuid())
  campaignId String
  channelId  String
  cpmRate    Decimal?  @db.Decimal(10, 4)
  fixedFee   Decimal?  @db.Decimal(12, 2)
  createdAt  DateTime  @default(now())
  campaign   Campaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  channel    Channel   @relation(fields: [channelId], references: [id], onDelete: Cascade)

  @@unique([campaignId, channelId])
  @@index([channelId])
}

model Event {
  id         String       @id @default(uuid())
  type       EventType
  ts         DateTime
  requestId  String
  streamerId String?
  channelId  String?
  sessionId  String?
  campaignId String?
  creativeId String?
  payload    Json
  ip         String?      @db.Inet
  userAgent  String?
  createdAt  DateTime     @default(now())
  streamer   StreamerProfile? @relation(fields: [streamerId], references: [id], onDelete: SetNull)
  channel    Channel?     @relation(fields: [channelId], references: [id], onDelete: SetNull)
  session    StreamSession? @relation(fields: [sessionId], references: [id], onDelete: SetNull)
  campaign   Campaign?    @relation(fields: [campaignId], references: [id], onDelete: SetNull)
  creative   Creative?    @relation(fields: [creativeId], references: [id], onDelete: SetNull)

  @@index([type, ts])
  @@index([campaignId, ts])
  @@index([channelId, ts])
  @@index([sessionId, ts])
}

model DailyMetric {
  id             String   @id @default(uuid())
  day            DateTime
  campaignId     String
  channelId      String
  impressions    Int      @default(0)
  clicks         Int      @default(0)
  minutesOnScreen Decimal @default(0) @db.Decimal(12, 4)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  campaign       Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  channel        Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)

  @@unique([day, campaignId, channelId])
  @@index([campaignId, day])
}

model Payout {
  id                  String         @id @default(uuid())
  campaignId          String
  channelId           String
  rateType            PayoutRateType
  rate                Decimal        @db.Decimal(12, 4)
  deliveredImpressions Int
  amount              Decimal        @db.Decimal(12, 2)
  status              PayoutStatus   @default(pending)
  createdAt           DateTime       @default(now())
  paidAt              DateTime?
  campaign            Campaign       @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  channel             Channel        @relation(fields: [channelId], references: [id], onDelete: Cascade)

  @@unique([campaignId, channelId])
  @@index([campaignId, status])
}

model AuditLog {
  id          String   @id @default(uuid())
  actorUserId String?
  action      String
  entityType  String
  entityId    String
  payload     Json?
  createdAt   DateTime @default(now())
  actor       User?    @relation(fields: [actorUserId], references: [id], onDelete: SetNull)

  @@index([entityType, entityId, createdAt])
}

```

## packages/db/prisma/seed.ts

```ts
import { createHash, randomBytes } from "node:crypto";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

function hashOverlayKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

async function upsertUser(email: string, role: Role) {
  return prisma.user.upsert({
    where: { email },
    update: { role, emailVerifiedAt: new Date() },
    create: { email, role, emailVerifiedAt: new Date() }
  });
}

async function main() {
  const admin = await upsertUser("admin@betaads.local", "admin");
  await upsertUser("agency@betaads.local", "agency");
  await upsertUser("brand@betaads.local", "brand");
  const streamerUser = await upsertUser("streamer@betaads.local", "streamer");

  const streamerProfile = await prisma.streamerProfile.upsert({
    where: { userId: streamerUser.id },
    update: {
      displayName: "Demo Streamer",
      twitchHandle: "demo_streamer"
    },
    create: {
      userId: streamerUser.id,
      displayName: "Demo Streamer",
      twitchHandle: "demo_streamer",
      country: "US",
      language: "en",
      categories: ["gaming", "fps"],
      avgViewers: 120,
      pricingTier: "mid"
    }
  });

  const channel = await prisma.channel.upsert({
    where: { id: "a9a57f97-e6ea-4728-94e7-af1edca9f0aa" },
    update: {
      streamerProfileId: streamerProfile.id
    },
    create: {
      id: "a9a57f97-e6ea-4728-94e7-af1edca9f0aa",
      streamerProfileId: streamerProfile.id,
      twitchChannelName: "demo_streamer",
      country: "US",
      language: "en",
      categories: ["gaming", "fps"],
      avgViewers: 120,
      pricingTier: "mid"
    }
  });

  const overlayKey = randomBytes(48).toString("base64url");
  await prisma.overlayCredential.upsert({
    where: { channelId: channel.id },
    update: {
      keyHash: hashOverlayKey(overlayKey),
      keyPrefix: overlayKey.slice(0, 8),
      rotatedAt: new Date()
    },
    create: {
      channelId: channel.id,
      keyHash: hashOverlayKey(overlayKey),
      keyPrefix: overlayKey.slice(0, 8)
    }
  });

  const campaign = await prisma.campaign.upsert({
    where: { id: "9a2f2c28-48bc-4ad9-9547-d40fa6f40046" },
    update: {
      status: "approved"
    },
    create: {
      id: "9a2f2c28-48bc-4ad9-9547-d40fa6f40046",
      name: "Launch Campaign",
      advertiser: "Beta Brands",
      objective: "Awareness",
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      budget: 5000,
      currency: "USD",
      status: "approved",
      targeting: {
        country: ["US"],
        language: ["en"]
      }
    }
  });

  await prisma.flight.upsert({
    where: { id: "4e530940-2f74-42e7-9fa5-d08656bf6dff" },
    update: {},
    create: {
      id: "4e530940-2f74-42e7-9fa5-d08656bf6dff",
      campaignId: campaign.id,
      pacingPerHour: 30,
      capPerStreamerPerHour: 6,
      capPerSession: 30,
      allowedFormats: ["image", "gif", "mp4"]
    }
  });

  await prisma.campaignAssignment.upsert({
    where: {
      campaignId_channelId: {
        campaignId: campaign.id,
        channelId: channel.id
      }
    },
    update: {
      cpmRate: 15
    },
    create: {
      campaignId: campaign.id,
      channelId: channel.id,
      cpmRate: 15
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      action: "seed_initialized",
      entityType: "system",
      entityId: "seed",
      payload: { campaignId: campaign.id, channelId: channel.id }
    }
  });

  // This is only printed during local seed, it is never persisted in logs by the API.
  process.stdout.write(`Seed completed. Demo overlay key (save now): ${overlayKey}\n`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

```

## packages/db/src/index.ts

```ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __betaPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__betaPrisma ??
  new PrismaClient({
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" }
    ]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__betaPrisma = prisma;
}

export * from "@prisma/client";

```

# Phase 3

Goal: Implement production style NestJS API with auth, RBAC, onboarding, campaign flows, delivery control, event ingestion, reporting, payouts, admin audit, WebSockets, and metrics.

Files:
- /Users/myraune/Desktop/beta ads/apps/api/.env.example
- /Users/myraune/Desktop/beta ads/apps/api/package.json
- /Users/myraune/Desktop/beta ads/apps/api/tsconfig.json
- /Users/myraune/Desktop/beta ads/apps/api/tsconfig.build.json
- /Users/myraune/Desktop/beta ads/apps/api/src/main.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/app.module.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/common/env.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/common/public.decorator.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/common/permissions.decorator.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/common/current-user.decorator.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/common/jwt.strategy.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/common/jwt-auth.guard.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/common/permissions.guard.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/common/prisma.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/common/redis.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/common/metrics.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/common/metrics.controller.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/common/rate-limit.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/auth/auth.module.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/auth/auth.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/auth/auth.controller.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/users/users.controller.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/streamers/streamers.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/streamers/streamers.controller.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/overlay/overlay-key.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/overlay/overlay.controller.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/overlay/dashboard.gateway.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/overlay/overlay.gateway.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/events/events.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/events/events.controller.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/campaigns/campaigns.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/campaigns/campaigns.controller.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/creatives/storage.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/creatives/creatives.controller.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/deliveries/delivery-policy.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/deliveries/deliveries.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/deliveries/deliveries.controller.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/reporting/pdf.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/reporting/reporting.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/reporting/reporting.controller.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/payouts/payouts.service.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/payouts/payouts.controller.ts
- /Users/myraune/Desktop/beta ads/apps/api/src/admin/admin.controller.ts
- /Users/myraune/Desktop/beta ads/apps/api/test/delivery-policy.test.ts
- /Users/myraune/Desktop/beta ads/apps/api/test/payouts-calculation.test.ts

How to run locally:
```bash
pnpm --filter @beta/api dev
```

Minimal tests:
```bash
pnpm --filter @beta/api test
```

## apps/api/.env.example

```txt
NODE_ENV=development
API_PORT=4000
DATABASE_URL=postgresql://beta:beta@localhost:5432/beta_ads?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace-with-long-random-secret
MAGIC_LINK_BASE_URL=http://localhost:3000
OVERLAY_URL=http://localhost:3001
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=beta-ads
S3_FORCE_PATH_STYLE=true

```

## apps/api/package.json

```json
{
  "name": "@beta/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/main.js",
    "lint": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.767.0",
    "@beta/db": "workspace:*",
    "@beta/shared": "workspace:*",
    "@fastify/cors": "^10.0.1",
    "@fastify/helmet": "^13.0.0",
    "@fastify/multipart": "^9.0.3",
    "@fastify/rate-limit": "^10.3.0",
    "@nestjs/common": "^11.0.11",
    "@nestjs/config": "^4.0.1",
    "@nestjs/core": "^11.0.11",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.5",
    "@nestjs/platform-fastify": "^11.0.11",
    "@nestjs/platform-socket.io": "^11.0.11",
    "@nestjs/websockets": "^11.0.11",
    "fastify": "^5.2.1",
    "ioredis": "^5.5.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "pdfkit": "^0.16.0",
    "prom-client": "^15.1.3",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.2",
    "socket.io": "^4.8.1",
    "uuid": "^11.1.0",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/passport-jwt": "^4.0.1",
    "@types/pdfkit": "^0.17.0",
    "@types/supertest": "^6.0.3",
    "supertest": "^7.0.0",
    "tsx": "^4.19.2",
    "typescript": "^5.8.2",
    "vitest": "^3.0.6"
  }
}

```

## apps/api/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "dist",
    "types": ["node"]
  },
  "include": ["src", "test"]
}

```

## apps/api/tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["test", "**/*.test.ts"]
}

```

## apps/api/src/main.ts

```ts
import "reflect-metadata";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { getEnv } from "./common/env";
import { PrismaService } from "./common/prisma.service";

async function bootstrap() {
  const env = getEnv();

  const adapter = new FastifyAdapter({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      redact: {
        paths: ["req.headers.x-overlay-key", "req.headers.authorization"],
        remove: true
      }
    },
    disableRequestLogging: false,
    requestIdHeader: "x-request-id"
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);

  await app.register(cors, {
    origin: true,
    credentials: true
  });

  await app.register(helmet);

  await app.register(multipart, {
    attachFieldsToBody: false,
    limits: {
      fileSize: 50 * 1024 * 1024,
      files: 1,
      fieldSize: 16 * 1024
    }
  });

  await app.register(rateLimit, {
    max: 250,
    timeWindow: "1 minute"
  });

  app
    .getHttpAdapter()
    .getInstance()
    .addHook("onResponse", async (request, reply) => {
      reply.header("x-request-id", String(request.id));
    });

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen({
    port: env.API_PORT,
    host: "0.0.0.0"
  });

  const logger = new Logger("Bootstrap");
  logger.log(`API listening on port ${env.API_PORT}`);
}

bootstrap();

```

## apps/api/src/app.module.ts

```ts
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { AdminController } from "./admin/admin.controller";
import { JwtAuthGuard } from "./common/jwt-auth.guard";
import { JwtStrategy } from "./common/jwt.strategy";
import { MetricsController } from "./common/metrics.controller";
import { MetricsService } from "./common/metrics.service";
import { PermissionGuard } from "./common/permissions.guard";
import { PrismaService } from "./common/prisma.service";
import { EventRateLimitService } from "./common/rate-limit.service";
import { RedisService } from "./common/redis.service";
import { CreativesController } from "./creatives/creatives.controller";
import { StorageService } from "./creatives/storage.service";
import { CampaignsController } from "./campaigns/campaigns.controller";
import { CampaignsService } from "./campaigns/campaigns.service";
import { DeliveriesController } from "./deliveries/deliveries.controller";
import { DeliveriesService } from "./deliveries/deliveries.service";
import { EventsController } from "./events/events.controller";
import { EventsService } from "./events/events.service";
import { OverlayController } from "./overlay/overlay.controller";
import { OverlayKeyService } from "./overlay/overlay-key.service";
import { OverlayGateway } from "./overlay/overlay.gateway";
import { DashboardGateway } from "./overlay/dashboard.gateway";
import { PayoutsController } from "./payouts/payouts.controller";
import { PayoutsService } from "./payouts/payouts.service";
import { ReportingController } from "./reporting/reporting.controller";
import { ReportingService } from "./reporting/reporting.service";
import { PdfReportService } from "./reporting/pdf.service";
import { StreamersController } from "./streamers/streamers.controller";
import { StreamersService } from "./streamers/streamers.service";
import { UsersController } from "./users/users.controller";

@Module({
  imports: [AuthModule],
  controllers: [
    MetricsController,
    UsersController,
    StreamersController,
    OverlayController,
    EventsController,
    CampaignsController,
    CreativesController,
    DeliveriesController,
    ReportingController,
    PayoutsController,
    AdminController
  ],
  providers: [
    PrismaService,
    RedisService,
    MetricsService,
    EventRateLimitService,
    StreamersService,
    OverlayKeyService,
    EventsService,
    CampaignsService,
    StorageService,
    DeliveriesService,
    ReportingService,
    PdfReportService,
    PayoutsService,
    OverlayGateway,
    DashboardGateway,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard
    }
  ]
})
export class AppModule {}

```

## apps/api/src/common/env.ts

```ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  MAGIC_LINK_BASE_URL: z.string().url(),
  OVERLAY_URL: z.string().url(),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().min(2),
  S3_ACCESS_KEY: z.string().min(3),
  S3_SECRET_KEY: z.string().min(8),
  S3_BUCKET: z.string().min(3),
  S3_FORCE_PATH_STYLE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  API_PORT: z.coerce.number().default(4000)
});

export type AppEnv = z.infer<typeof envSchema>;

let parsedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (!parsedEnv) {
    parsedEnv = envSchema.parse(process.env);
  }

  return parsedEnv;
}

```

## apps/api/src/common/public.decorator.ts

```ts
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

```

## apps/api/src/common/permissions.decorator.ts

```ts
import { SetMetadata } from "@nestjs/common";
import type { Permission } from "@beta/shared";

export const PERMISSION_KEY = "permission";

export const RequirePermission = (permission: Permission) => SetMetadata(PERMISSION_KEY, permission);

```

## apps/api/src/common/current-user.decorator.ts

```ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "agency" | "brand" | "streamer" | "viewer";
}

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthUser => {
  const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
  return request.user;
});

```

## apps/api/src/common/jwt.strategy.ts

```ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { getEnv } from "./env";
import type { AuthUser } from "./current-user.decorator";

interface JwtPayload {
  sub: string;
  email: string;
  role: AuthUser["role"];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getEnv().JWT_SECRET
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
  }
}

```

## apps/api/src/common/jwt-auth.guard.ts

```ts
import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}

```

## apps/api/src/common/permissions.guard.ts

```ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { hasPermission } from "@beta/shared";
import { PERMISSION_KEY } from "./permissions.decorator";
import type { AuthUser } from "./current-user.decorator";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string | undefined>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    if (!request.user || !hasPermission(request.user.role, requiredPermission as never)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}

```

## apps/api/src/common/prisma.service.ts

```ts
import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@beta/db";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on("beforeExit", async () => {
      await app.close();
    });
  }
}

```

## apps/api/src/common/redis.service.ts

```ts
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { getEnv } from "./env";

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor() {
    this.client = new Redis(getEnv().REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}

```

## apps/api/src/common/metrics.service.ts

```ts
import { Injectable } from "@nestjs/common";
import { Counter, Registry, collectDefaultMetrics } from "prom-client";

@Injectable()
export class MetricsService {
  readonly registry = new Registry();
  readonly eventIngestCounter: Counter<string>;
  readonly deliveryCommandCounter: Counter<string>;

  constructor() {
    collectDefaultMetrics({ register: this.registry });

    this.eventIngestCounter = new Counter({
      name: "beta_ads_events_ingested_total",
      help: "Total ingested overlay events",
      labelNames: ["type"],
      registers: [this.registry]
    });

    this.deliveryCommandCounter = new Counter({
      name: "beta_ads_delivery_commands_total",
      help: "Total delivery commands sent",
      labelNames: ["result"],
      registers: [this.registry]
    });
  }
}

```

## apps/api/src/common/metrics.controller.ts

```ts
import { Controller, Get, Header } from "@nestjs/common";
import { Public } from "./public.decorator";
import { MetricsService } from "./metrics.service";

@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @Get()
  @Header("Content-Type", "text/plain; version=0.0.4")
  async metrics(): Promise<string> {
    return this.metricsService.registry.metrics();
  }
}

```

## apps/api/src/common/rate-limit.service.ts

```ts
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import { RedisService } from "./redis.service";

@Injectable()
export class EventRateLimitService {
  constructor(private readonly redisService: RedisService) {}

  async consume(overlayKey: string, ip: string): Promise<void> {
    const keyHash = createHash("sha256").update(overlayKey).digest("hex").slice(0, 16);
    const redisKey = `rate:event:${keyHash}:${ip}`;
    const count = await this.redisService.client.incr(redisKey);
    if (count === 1) {
      await this.redisService.client.expire(redisKey, 60);
    }

    if (count > 180) {
      throw new HttpException("Event ingest rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}

```

## apps/api/src/auth/auth.module.ts

```ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { getEnv } from "../common/env";

@Module({
  imports: [
    JwtModule.register({
      secret: getEnv().JWT_SECRET,
      signOptions: { expiresIn: "12h" }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}

```

## apps/api/src/auth/auth.service.ts

```ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomBytes } from "node:crypto";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async requestMagicLink(email: string): Promise<{ ok: true; debugMagicLink?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {},
      create: { email: normalizedEmail, role: "streamer" }
    });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    await this.prisma.magicLinkToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    if (process.env.NODE_ENV !== "production") {
      return {
        ok: true,
        debugMagicLink: `${process.env.MAGIC_LINK_BASE_URL ?? "http://localhost:3000"}/auth/verify?email=${encodeURIComponent(
          normalizedEmail
        )}&token=${token}`
      };
    }

    return { ok: true };
  }

  async verifyMagicLink(email: string, token: string): Promise<{ accessToken: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const magic = await this.prisma.magicLinkToken.findFirst({
      where: {
        userId: user.id,
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!magic) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    await this.prisma.$transaction([
      this.prisma.magicLinkToken.update({
        where: { id: magic.id },
        data: { consumedAt: new Date() }
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() }
      })
    ]);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return { accessToken };
  }

  async logout() {
    return { ok: true };
  }
}

```

## apps/api/src/auth/auth.controller.ts

```ts
import { Body, Controller, Post } from "@nestjs/common";
import { requestMagicLinkSchema, verifyMagicLinkSchema } from "@beta/shared";
import { Public } from "../common/public.decorator";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("request-magic-link")
  async requestMagicLink(@Body() body: unknown) {
    const parsed = requestMagicLinkSchema.parse(body);
    return this.authService.requestMagicLink(parsed.email);
  }

  @Public()
  @Post("verify-magic-link")
  async verifyMagicLink(@Body() body: unknown) {
    const parsed = verifyMagicLinkSchema.parse(body);
    return this.authService.verifyMagicLink(parsed.email, parsed.token);
  }

  @Post("logout")
  async logout() {
    return this.authService.logout();
  }
}

```

## apps/api/src/users/users.controller.ts

```ts
import { Controller, Get } from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { RequirePermission } from "../common/permissions.decorator";
import { PrismaService } from "../common/prisma.service";

@Controller()
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("me")
  @RequirePermission("users:read_me")
  async me(@CurrentUser() user: AuthUser) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        streamerProfile: {
          include: {
            channels: {
              include: {
                overlayCredential: {
                  select: {
                    keyPrefix: true,
                    rotatedAt: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return {
      id: dbUser?.id ?? user.id,
      email: dbUser?.email ?? user.email,
      role: dbUser?.role ?? user.role,
      emailVerifiedAt: dbUser?.emailVerifiedAt ?? null,
      streamerProfile: dbUser?.streamerProfile ?? null
    };
  }
}

```

## apps/api/src/streamers/streamers.service.ts

```ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { channelSchema, streamerProfileSchema } from "@beta/shared";
import { PrismaService } from "../common/prisma.service";
import type { AuthUser } from "../common/current-user.decorator";

@Injectable()
export class StreamersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertProfile(user: AuthUser, payload: unknown) {
    const parsed = streamerProfileSchema.parse(payload);

    return this.prisma.streamerProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName: parsed.displayName,
        twitchHandle: parsed.twitchHandle,
        country: parsed.country,
        language: parsed.language,
        categories: parsed.categories,
        avgViewers: parsed.avgViewers,
        pricingTier: parsed.pricingTier
      },
      create: {
        userId: user.id,
        displayName: parsed.displayName,
        twitchHandle: parsed.twitchHandle,
        country: parsed.country,
        language: parsed.language,
        categories: parsed.categories,
        avgViewers: parsed.avgViewers,
        pricingTier: parsed.pricingTier
      }
    });
  }

  async getProfile(user: AuthUser) {
    const profile = await this.prisma.streamerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      throw new NotFoundException("Streamer profile not found");
    }

    return profile;
  }

  async createChannel(user: AuthUser, payload: unknown) {
    const parsed = channelSchema.parse(payload);
    const profile = await this.prisma.streamerProfile.findUnique({ where: { userId: user.id } });

    if (!profile) {
      throw new NotFoundException("Streamer profile not found");
    }

    return this.prisma.channel.create({
      data: {
        streamerProfileId: profile.id,
        twitchChannelName: parsed.twitchChannelName,
        country: parsed.country,
        language: parsed.language,
        categories: parsed.categories,
        avgViewers: parsed.avgViewers,
        pricingTier: parsed.pricingTier
      }
    });
  }

  async listChannels(user: AuthUser) {
    const profile = await this.prisma.streamerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      return [];
    }

    return this.prisma.channel.findMany({
      where: { streamerProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        overlayCredential: {
          select: {
            keyPrefix: true,
            rotatedAt: true
          }
        }
      }
    });
  }

  async assertChannelAccess(user: AuthUser, channelId: string): Promise<void> {
    if (user.role === "admin") {
      return;
    }

    const channel = await this.prisma.channel.findFirst({
      where: {
        id: channelId,
        streamerProfile: {
          userId: user.id
        }
      }
    });

    if (!channel) {
      throw new ForbiddenException("Channel access denied");
    }
  }
}

```

## apps/api/src/streamers/streamers.controller.ts

```ts
import { Body, Controller, Get, Post } from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { RequirePermission } from "../common/permissions.decorator";
import { StreamersService } from "./streamers.service";

@Controller("streamers")
export class StreamersController {
  constructor(private readonly streamersService: StreamersService) {}

  @Post("profile")
  @RequirePermission("streamers:upsert_profile")
  async upsertProfile(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.streamersService.upsertProfile(user, body);
  }

  @Get("profile")
  @RequirePermission("streamers:read_profile")
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.streamersService.getProfile(user);
  }

  @Post("channels")
  @RequirePermission("streamers:create_channel")
  async createChannel(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.streamersService.createChannel(user, body);
  }

  @Get("channels")
  @RequirePermission("streamers:read_channels")
  async listChannels(@CurrentUser() user: AuthUser) {
    return this.streamersService.listChannels(user);
  }
}

```

## apps/api/src/overlay/overlay-key.service.ts

```ts
import { createHash, randomBytes } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import type { AuthUser } from "../common/current-user.decorator";
import { StreamersService } from "../streamers/streamers.service";

@Injectable()
export class OverlayKeyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streamersService: StreamersService
  ) {}

  private hashOverlayKey(rawKey: string): string {
    return createHash("sha256").update(rawKey).digest("hex");
  }

  async rotateKey(user: AuthUser, channelId: string): Promise<{ overlayKey: string; overlayUrl: string; keyPrefix: string }> {
    await this.streamersService.assertChannelAccess(user, channelId);

    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    const overlayKey = randomBytes(48).toString("base64url");
    const keyHash = this.hashOverlayKey(overlayKey);
    const keyPrefix = overlayKey.slice(0, 8);

    await this.prisma.overlayCredential.upsert({
      where: { channelId },
      update: { keyHash, keyPrefix, rotatedAt: new Date() },
      create: { channelId, keyHash, keyPrefix }
    });

    return {
      overlayKey,
      keyPrefix,
      overlayUrl: `${process.env.OVERLAY_URL ?? "http://localhost:3001"}/overlay?key=${overlayKey}`
    };
  }

  async validateOverlayKey(rawKey: string) {
    const keyHash = this.hashOverlayKey(rawKey);

    const credential = await this.prisma.overlayCredential.findFirst({
      where: { keyHash },
      include: {
        channel: {
          include: {
            streamerProfile: true
          }
        }
      }
    });

    if (!credential) {
      return null;
    }

    return credential;
  }
}

```

## apps/api/src/overlay/overlay.controller.ts

```ts
import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { RequirePermission } from "../common/permissions.decorator";
import { OverlayKeyService } from "./overlay-key.service";

const rotateSchema = z.object({
  channelId: z.string().uuid()
});

@Controller("overlay")
export class OverlayController {
  constructor(private readonly overlayKeyService: OverlayKeyService) {}

  @Post("rotate-key")
  @RequirePermission("streamers:rotate_overlay_key")
  async rotate(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const parsed = rotateSchema.parse(body);
    return this.overlayKeyService.rotateKey(user, parsed.channelId);
  }
}

```

## apps/api/src/overlay/dashboard.gateway.ts

```ts
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
  namespace: "/dashboard",
  cors: {
    origin: "*"
  }
})
export class DashboardGateway {
  @WebSocketServer()
  server!: Server;

  broadcast(event: string, payload: Record<string, unknown>) {
    this.server.emit(event, payload);
  }
}

```

## apps/api/src/overlay/overlay.gateway.ts

```ts
import { Logger } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { randomUUID } from "node:crypto";
import { Server, Socket } from "socket.io";
import { overlayCommandSchema, type OverlayCommand } from "@beta/shared";
import { EventsService } from "../events/events.service";
import { OverlayKeyService } from "./overlay-key.service";
import { DashboardGateway } from "./dashboard.gateway";

interface OverlaySocketContext {
  channelId: string;
  streamerId: string;
  sessionId: string;
}

@WebSocketGateway({
  namespace: "/overlay",
  cors: {
    origin: "*"
  }
})
export class OverlayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OverlayGateway.name);
  private readonly socketState = new Map<string, OverlaySocketContext>();

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly overlayKeyService: OverlayKeyService,
    private readonly eventsService: EventsService,
    private readonly dashboardGateway: DashboardGateway
  ) {}

  async handleConnection(client: Socket) {
    const key =
      (typeof client.handshake.auth?.key === "string" ? client.handshake.auth.key : null) ??
      (typeof client.handshake.query?.key === "string" ? client.handshake.query.key : null);

    if (!key) {
      client.disconnect();
      return;
    }

    const credential = await this.overlayKeyService.validateOverlayKey(key);
    if (!credential) {
      client.disconnect();
      return;
    }

    const session = await this.eventsService.getOrCreateSession(
      credential.channelId,
      credential.channel.streamerProfileId
    );

    this.socketState.set(client.id, {
      channelId: credential.channelId,
      streamerId: credential.channel.streamerProfileId,
      sessionId: session.id
    });

    client.join(credential.channelId);
    client.emit("session", { sessionId: session.id, channelId: credential.channelId });

    await this.eventsService.recordSystemEvent("overlay_connected", {
      requestId: `ws_${randomUUID()}`,
      channelId: credential.channelId,
      streamerId: credential.channel.streamerProfileId,
      sessionId: session.id,
      payload: { source: "socket_connection" },
      ip: client.handshake.address,
      userAgent: client.handshake.headers["user-agent"]
    });

    this.dashboardGateway.broadcast("overlay_status", {
      channelId: credential.channelId,
      status: "connected",
      sessionId: session.id,
      at: new Date().toISOString()
    });
  }

  async handleDisconnect(client: Socket) {
    const context = this.socketState.get(client.id);
    this.socketState.delete(client.id);

    if (!context) {
      return;
    }

    await this.eventsService.markDisconnected(context.sessionId);
    await this.eventsService.recordSystemEvent("overlay_disconnected", {
      requestId: `ws_${randomUUID()}`,
      channelId: context.channelId,
      streamerId: context.streamerId,
      sessionId: context.sessionId,
      payload: { source: "socket_disconnect" }
    });

    this.dashboardGateway.broadcast("overlay_status", {
      channelId: context.channelId,
      status: "disconnected",
      sessionId: context.sessionId,
      at: new Date().toISOString()
    });
  }

  @SubscribeMessage("overlay:heartbeat")
  async onHeartbeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { requestId?: string; payload?: Record<string, unknown> }
  ) {
    const context = this.socketState.get(client.id);
    if (!context) {
      return;
    }

    await this.eventsService.recordSystemEvent("overlay_heartbeat", {
      requestId: body.requestId ?? `ws_${randomUUID()}`,
      channelId: context.channelId,
      streamerId: context.streamerId,
      sessionId: context.sessionId,
      payload: body.payload ?? { source: "socket" }
    });

    this.dashboardGateway.broadcast("overlay_heartbeat", {
      channelId: context.channelId,
      sessionId: context.sessionId,
      at: new Date().toISOString()
    });
  }

  async pushAdCommand(channelId: string, command: OverlayCommand): Promise<boolean> {
    const validated = overlayCommandSchema.parse(command);
    const sockets = await this.server.in(channelId).fetchSockets();

    if (sockets.length === 0) {
      this.logger.warn(`No overlay socket connected for channel ${channelId}`);
      return false;
    }

    this.server.to(channelId).emit("ad:command", validated);
    return true;
  }

  isChannelConnected(channelId: string): boolean {
    const values = [...this.socketState.values()];
    return values.some((ctx) => ctx.channelId === channelId);
  }
}

```

## apps/api/src/events/events.service.ts

```ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Prisma } from "@beta/db";
import { overlayEventSchema, type EventType } from "@beta/shared";
import { MetricsService } from "../common/metrics.service";
import { PrismaService } from "../common/prisma.service";
import { EventRateLimitService } from "../common/rate-limit.service";
import { OverlayKeyService } from "../overlay/overlay-key.service";

interface IngestContext {
  ip: string;
  userAgent?: string;
}

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly overlayKeyService: OverlayKeyService,
    private readonly rateLimitService: EventRateLimitService,
    private readonly metricsService: MetricsService
  ) {}

  async getOrCreateSession(channelId: string, streamerId: string) {
    const now = new Date();
    const existing = await this.prisma.streamSession.findFirst({
      where: { channelId },
      orderBy: { startedAt: "desc" }
    });

    if (!existing) {
      const created = await this.prisma.streamSession.create({
        data: {
          channelId,
          streamerProfileId: streamerId,
          startedAt: now,
          lastHeartbeatAt: now,
          status: "active"
        }
      });

      await this.recordSystemEvent("session_started", {
        requestId: `sys_${randomUUID()}`,
        streamerId,
        channelId,
        sessionId: created.id,
        payload: { reason: "auto_started_on_overlay_connection" }
      });

      return created;
    }

    if (existing.status === "active") {
      return this.prisma.streamSession.update({
        where: { id: existing.id },
        data: { lastHeartbeatAt: now }
      });
    }

    const graceWindowMs = 5 * 60 * 1000;
    const gapMs = now.getTime() - existing.lastHeartbeatAt.getTime();

    if (existing.status === "disconnected" && gapMs <= graceWindowMs) {
      return this.prisma.streamSession.update({
        where: { id: existing.id },
        data: {
          status: "active",
          endedAt: null,
          lastHeartbeatAt: now
        }
      });
    }

    if (existing.status !== "ended") {
      await this.prisma.streamSession.update({
        where: { id: existing.id },
        data: {
          status: "ended",
          endedAt: existing.lastHeartbeatAt
        }
      });

      await this.recordSystemEvent("session_ended", {
        requestId: `sys_${randomUUID()}`,
        streamerId,
        channelId,
        sessionId: existing.id,
        payload: { reason: "disconnect_grace_elapsed" }
      });
    }

    const created = await this.prisma.streamSession.create({
      data: {
        channelId,
        streamerProfileId: streamerId,
        startedAt: now,
        lastHeartbeatAt: now,
        status: "active"
      }
    });

    await this.recordSystemEvent("session_started", {
      requestId: `sys_${randomUUID()}`,
      streamerId,
      channelId,
      sessionId: created.id,
      payload: { reason: "new_session_after_disconnect" }
    });

    return created;
  }

  async markDisconnected(sessionId: string) {
    await this.prisma.streamSession.update({
      where: { id: sessionId },
      data: {
        status: "disconnected",
        lastHeartbeatAt: new Date()
      }
    });
  }

  async ingest(overlayKey: string, body: unknown, context: IngestContext) {
    await this.rateLimitService.consume(overlayKey, context.ip);

    const credential = await this.overlayKeyService.validateOverlayKey(overlayKey);
    if (!credential) {
      throw new UnauthorizedException("Invalid overlay key");
    }

    const parsed = overlayEventSchema.parse(body);
    const channelId = parsed.channel_id ?? credential.channel.id;
    const streamerId = parsed.streamer_id ?? credential.channel.streamerProfileId;

    let sessionId = parsed.session_id ?? null;

    if (parsed.type === "overlay_connected" || parsed.type === "overlay_heartbeat") {
      const session = await this.getOrCreateSession(channelId, streamerId);
      sessionId = session.id;
    }

    if (!sessionId) {
      const latestSession = await this.prisma.streamSession.findFirst({
        where: { channelId },
        orderBy: { startedAt: "desc" }
      });
      sessionId = latestSession?.id ?? null;
    }

    if (parsed.type === "overlay_disconnected" && sessionId) {
      await this.markDisconnected(sessionId);
    }

    if (parsed.type === "overlay_heartbeat" && sessionId) {
      await this.prisma.streamSession.update({
        where: { id: sessionId },
        data: { status: "active", lastHeartbeatAt: new Date() }
      });
    }

    const event = await this.prisma.event.create({
      data: {
        id: parsed.id ?? randomUUID(),
        type: parsed.type,
        ts: parsed.ts,
        requestId: parsed.request_id,
        streamerId,
        channelId,
        sessionId,
        campaignId: parsed.campaign_id ?? null,
        creativeId: parsed.creative_id ?? null,
        payload: parsed.payload,
        ip: context.ip,
        userAgent: context.userAgent ?? null
      }
    });

    this.metricsService.eventIngestCounter.inc({ type: parsed.type });

    return { id: event.id, sessionId };
  }

  async recordSystemEvent(
    type: EventType,
    params: {
      requestId: string;
      streamerId?: string | null;
      channelId?: string | null;
      sessionId?: string | null;
      campaignId?: string | null;
      creativeId?: string | null;
      payload?: Record<string, unknown>;
      ip?: string | null;
      userAgent?: string | null;
    }
  ) {
    const event = await this.prisma.event.create({
      data: {
        type,
        ts: new Date(),
        requestId: params.requestId,
        streamerId: params.streamerId ?? null,
        channelId: params.channelId ?? null,
        sessionId: params.sessionId ?? null,
        campaignId: params.campaignId ?? null,
        creativeId: params.creativeId ?? null,
        payload: (params.payload ?? {}) as Prisma.InputJsonValue,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null
      }
    });

    this.metricsService.eventIngestCounter.inc({ type });

    return event;
  }
}

```

## apps/api/src/events/events.controller.ts

```ts
import { Body, Controller, Headers, Ip, Post, Req, UnauthorizedException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { Public } from "../common/public.decorator";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Post("ingest")
  async ingest(
    @Headers("x-overlay-key") overlayKey: string | undefined,
    @Body() body: unknown,
    @Ip() ip: string,
    @Req() req: FastifyRequest
  ) {
    if (!overlayKey) {
      throw new UnauthorizedException("Missing overlay key");
    }

    return this.eventsService.ingest(overlayKey, body, {
      ip,
      userAgent: req.headers["user-agent"]
    });
  }
}

```

## apps/api/src/campaigns/campaigns.service.ts

```ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { assignStreamerSchema, campaignCreateSchema, flightCreateSchema } from "@beta/shared";
import { PrismaService } from "../common/prisma.service";
import type { AuthUser } from "../common/current-user.decorator";

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, body: unknown) {
    const parsed = campaignCreateSchema.parse(body);

    const campaign = await this.prisma.campaign.create({
      data: {
        name: parsed.name,
        advertiser: parsed.advertiser,
        objective: parsed.objective,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        budget: parsed.budget,
        currency: parsed.currency.toUpperCase(),
        targeting: parsed.targeting,
        status: parsed.status
      }
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "campaign_created",
        entityType: "campaign",
        entityId: campaign.id,
        payload: { campaignName: campaign.name }
      }
    });

    return campaign;
  }

  async list(user: AuthUser) {
    if (user.role === "streamer") {
      const profile = await this.prisma.streamerProfile.findUnique({ where: { userId: user.id } });
      if (!profile) {
        return [];
      }

      return this.prisma.campaign.findMany({
        where: {
          assignments: {
            some: {
              channel: {
                streamerProfileId: profile.id
              }
            }
          }
        },
        include: {
          flights: true,
          creatives: true
        },
        orderBy: { createdAt: "desc" }
      });
    }

    return this.prisma.campaign.findMany({
      include: {
        flights: true,
        creatives: true,
        assignments: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getById(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        flights: true,
        creatives: true,
        assignments: {
          include: { channel: true }
        }
      }
    });

    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    return campaign;
  }

  async createFlight(user: AuthUser, campaignId: string, body: unknown) {
    const parsed = flightCreateSchema.parse(body);

    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    const flight = await this.prisma.flight.create({
      data: {
        campaignId,
        pacingPerHour: parsed.pacingPerHour,
        capPerStreamerPerHour: parsed.capPerStreamerPerHour,
        capPerSession: parsed.capPerSession,
        allowedFormats: parsed.allowedFormats
      }
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "campaign_flight_created",
        entityType: "campaign",
        entityId: campaignId,
        payload: {
          flightId: flight.id,
          pacingPerHour: parsed.pacingPerHour
        }
      }
    });

    return flight;
  }

  async assignStreamers(user: AuthUser, campaignId: string, body: unknown) {
    const parsed = assignStreamerSchema.parse(body);

    const assignments = await this.prisma.$transaction(
      parsed.streamerChannelIds.map((channelId) =>
        this.prisma.campaignAssignment.upsert({
          where: {
            campaignId_channelId: {
              campaignId,
              channelId
            }
          },
          update: {
            cpmRate: parsed.cpmRate,
            fixedFee: parsed.fixedFee
          },
          create: {
            campaignId,
            channelId,
            cpmRate: parsed.cpmRate,
            fixedFee: parsed.fixedFee
          }
        })
      )
    );

    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "campaign_streamers_assigned",
        entityType: "campaign",
        entityId: campaignId,
        payload: {
          count: assignments.length,
          channelIds: parsed.streamerChannelIds
        }
      }
    });

    return { count: assignments.length, assignments };
  }
}

```

## apps/api/src/campaigns/campaigns.controller.ts

```ts
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { z } from "zod";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { RequirePermission } from "../common/permissions.decorator";
import { CampaignsService } from "./campaigns.service";

const campaignIdParamSchema = z.object({
  id: z.string().uuid()
});

@Controller("campaigns")
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @RequirePermission("campaigns:create")
  async create(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.campaignsService.create(user, body);
  }

  @Get()
  @RequirePermission("campaigns:read")
  async list(@CurrentUser() user: AuthUser) {
    return this.campaignsService.list(user);
  }

  @Get(":id")
  @RequirePermission("campaigns:read_one")
  async getById(@Param() params: unknown) {
    const parsed = campaignIdParamSchema.parse(params);
    return this.campaignsService.getById(parsed.id);
  }

  @Post(":id/flights")
  @RequirePermission("campaigns:create_flight")
  async createFlight(@CurrentUser() user: AuthUser, @Param() params: unknown, @Body() body: unknown) {
    const parsed = campaignIdParamSchema.parse(params);
    return this.campaignsService.createFlight(user, parsed.id, body);
  }

  @Post(":id/assign-streamers")
  @RequirePermission("campaigns:assign_streamers")
  async assignStreamers(@CurrentUser() user: AuthUser, @Param() params: unknown, @Body() body: unknown) {
    const parsed = campaignIdParamSchema.parse(params);
    return this.campaignsService.assignStreamers(user, parsed.id, body);
  }
}

```

## apps/api/src/creatives/storage.service.ts

```ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { getEnv } from "../common/env";

@Injectable()
export class StorageService {
  private readonly env = getEnv();
  private readonly client = new S3Client({
    region: this.env.S3_REGION,
    endpoint: this.env.S3_ENDPOINT,
    forcePathStyle: this.env.S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: this.env.S3_ACCESS_KEY,
      secretAccessKey: this.env.S3_SECRET_KEY
    }
  });

  async uploadObject(params: {
    objectKey: string;
    body: Buffer;
    contentType: string;
  }): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.env.S3_BUCKET,
        Key: params.objectKey,
        Body: params.body,
        ContentType: params.contentType,
        ContentLength: params.body.length
      })
    );

    return this.objectUrl(params.objectKey);
  }

  objectUrl(objectKey: string): string {
    const endpoint = this.env.S3_ENDPOINT.replace(/\/$/, "");
    return `${endpoint}/${this.env.S3_BUCKET}/${objectKey}`;
  }
}

```

## apps/api/src/creatives/creatives.controller.ts

```ts
import { randomUUID } from "node:crypto";
import { BadRequestException, Controller, Get, Param, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { RequirePermission } from "../common/permissions.decorator";
import { PrismaService } from "../common/prisma.service";
import { StorageService } from "./storage.service";

const creativeMetadataSchema = z.object({
  campaignId: z.string().uuid(),
  format: z.enum(["image", "gif", "mp4"]),
  durationSec: z.coerce.number().int().min(1).max(120),
  clickUrl: z.string().url(),
  fallbackUrl: z.string().url().optional(),
  approvalStatus: z.enum(["draft", "submitted", "approved", "rejected"]).default("submitted")
});

const creativeIdParamsSchema = z.object({
  id: z.string().uuid()
});

function extensionForMime(contentType: string): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/gif") return "gif";
  if (contentType === "video/mp4") return "mp4";
  return "bin";
}

async function streamToBuffer(stream: NodeJS.ReadableStream, maxBytes: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBytes) {
      throw new BadRequestException(`Creative exceeds ${Math.floor(maxBytes / 1024 / 1024)}MB limit`);
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

function fieldValue(field: unknown): string | undefined {
  if (Array.isArray(field)) {
    const value = field.at(0);
    if (value && typeof value === "object" && "value" in value) {
      return String((value as { value: unknown }).value);
    }
    return undefined;
  }

  if (field && typeof field === "object" && "value" in field) {
    return String((field as { value: unknown }).value);
  }

  return undefined;
}

@Controller("creatives")
export class CreativesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  @Post()
  @RequirePermission("creatives:upload")
  async upload(@Req() req: FastifyRequest) {
    const multipartReq = req as FastifyRequest & {
      file: () => Promise<{
        filename: string;
        mimetype: string;
        file: NodeJS.ReadableStream;
        fields: Record<string, unknown>;
      }>;
    };

    const file = await multipartReq.file();
    if (!file) {
      throw new BadRequestException("Expected multipart file");
    }

    const metadata = creativeMetadataSchema.parse({
      campaignId: fieldValue(file.fields.campaignId),
      format: fieldValue(file.fields.format),
      durationSec: fieldValue(file.fields.durationSec),
      clickUrl: fieldValue(file.fields.clickUrl),
      fallbackUrl: fieldValue(file.fields.fallbackUrl),
      approvalStatus: fieldValue(file.fields.approvalStatus) ?? "submitted"
    });

    if (metadata.format === "mp4" && file.mimetype !== "video/mp4") {
      throw new BadRequestException("Expected video/mp4 for mp4 creative format");
    }

    if (metadata.format === "gif" && file.mimetype !== "image/gif") {
      throw new BadRequestException("Expected image/gif for gif creative format");
    }

    if (metadata.format === "image" && !["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)) {
      throw new BadRequestException("Expected png, jpeg, or webp for image creative format");
    }

    const body = await streamToBuffer(file.file, 50 * 1024 * 1024);
    const objectKey = `creatives/${metadata.campaignId}/${randomUUID()}.${extensionForMime(file.mimetype)}`;

    const assetUrl = await this.storage.uploadObject({
      objectKey,
      body,
      contentType: file.mimetype
    });

    const creative = await this.prisma.creative.create({
      data: {
        campaignId: metadata.campaignId,
        format: metadata.format,
        durationSec: metadata.durationSec,
        clickUrl: metadata.clickUrl,
        fallbackUrl: metadata.fallbackUrl,
        objectKey,
        mimeType: file.mimetype,
        sizeBytes: body.length,
        approvalStatus: metadata.approvalStatus
      }
    });

    return {
      ...creative,
      assetUrl
    };
  }

  @Get(":id")
  @RequirePermission("creatives:read")
  async getById(@Param() params: unknown) {
    const parsed = creativeIdParamsSchema.parse(params);

    const creative = await this.prisma.creative.findUnique({
      where: { id: parsed.id },
      include: {
        campaign: {
          select: { id: true, name: true, advertiser: true }
        }
      }
    });

    if (!creative) {
      throw new BadRequestException("Creative not found");
    }

    return {
      ...creative,
      assetUrl: this.storage.objectUrl(creative.objectKey)
    };
  }
}

```

## apps/api/src/deliveries/delivery-policy.ts

```ts
interface CapInput {
  hourlyDelivered: number;
  sessionDelivered: number;
  campaignHourlyCommands: number;
  capPerStreamerPerHour: number;
  capPerSession: number;
  pacingPerHour: number;
}

export function evaluateDeliveryCaps(input: CapInput): { allowed: boolean; reason?: string } {
  if (input.hourlyDelivered >= input.capPerStreamerPerHour) {
    return { allowed: false, reason: "streamer_hourly_cap_reached" };
  }

  if (input.sessionDelivered >= input.capPerSession) {
    return { allowed: false, reason: "session_cap_reached" };
  }

  if (input.campaignHourlyCommands >= input.pacingPerHour) {
    return { allowed: false, reason: "campaign_pacing_reached" };
  }

  return { allowed: true };
}

```

## apps/api/src/deliveries/deliveries.service.ts

```ts
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { deliveryTriggerSchema } from "@beta/shared";
import { MetricsService } from "../common/metrics.service";
import { PrismaService } from "../common/prisma.service";
import { OverlayGateway } from "../overlay/overlay.gateway";
import { DashboardGateway } from "../overlay/dashboard.gateway";
import { StorageService } from "../creatives/storage.service";
import { EventsService } from "../events/events.service";
import { evaluateDeliveryCaps } from "./delivery-policy";

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly overlayGateway: OverlayGateway,
    private readonly dashboardGateway: DashboardGateway,
    private readonly storageService: StorageService,
    private readonly eventsService: EventsService,
    private readonly metricsService: MetricsService
  ) {}

  async trigger(body: unknown) {
    const parsed = deliveryTriggerSchema.parse(body);

    const channel = await this.prisma.channel.findUnique({
      where: { id: parsed.channelId },
      include: {
        streamerProfile: true
      }
    });

    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    const assignment = await this.prisma.campaignAssignment.findFirst({
      where: {
        channelId: parsed.channelId,
        ...(parsed.campaignId ? { campaignId: parsed.campaignId } : {})
      },
      orderBy: { createdAt: "desc" },
      include: {
        campaign: {
          include: {
            flights: {
              orderBy: { createdAt: "desc" },
              take: 1
            }
          }
        }
      }
    });

    if (!assignment) {
      throw new BadRequestException("No campaign assignment found for channel");
    }

    const campaign = assignment.campaign;
    const flight = campaign.flights.at(0);

    if (!flight) {
      throw new BadRequestException("Campaign has no flight configured");
    }

    const session = await this.prisma.streamSession.findFirst({
      where: {
        channelId: parsed.channelId,
        status: "active"
      },
      orderBy: { startedAt: "desc" }
    });

    if (!session) {
      throw new BadRequestException("No active stream session for channel");
    }

    const creative = parsed.creativeId
      ? await this.prisma.creative.findFirst({
          where: {
            id: parsed.creativeId,
            campaignId: campaign.id,
            approvalStatus: "approved"
          }
        })
      : await this.prisma.creative.findFirst({
          where: {
            campaignId: campaign.id,
            approvalStatus: "approved",
            format: {
              in: flight.allowedFormats
            }
          },
          orderBy: { createdAt: "asc" }
        });

    if (!creative) {
      throw new BadRequestException("No approved creative available for delivery");
    }

    await this.eventsService.recordSystemEvent("ad_candidate_selected", {
      requestId: `sys_${randomUUID()}`,
      streamerId: channel.streamerProfileId,
      channelId: channel.id,
      sessionId: session.id,
      campaignId: campaign.id,
      creativeId: creative.id,
      payload: {
        reason: parsed.creativeId ? "manual" : "first_approved_creative"
      }
    });

    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    const [hourlyDelivered, sessionDelivered, campaignHourlyCommands] = await Promise.all([
      this.prisma.event.count({
        where: {
          type: "ad_completed",
          channelId: channel.id,
          campaignId: campaign.id,
          ts: { gte: lastHour }
        }
      }),
      this.prisma.event.count({
        where: {
          type: "ad_completed",
          sessionId: session.id,
          campaignId: campaign.id
        }
      }),
      this.prisma.event.count({
        where: {
          type: "ad_command_sent",
          campaignId: campaign.id,
          ts: { gte: lastHour }
        }
      })
    ]);

    const decision = evaluateDeliveryCaps({
      hourlyDelivered,
      sessionDelivered,
      campaignHourlyCommands,
      capPerStreamerPerHour: flight.capPerStreamerPerHour,
      capPerSession: flight.capPerSession,
      pacingPerHour: flight.pacingPerHour
    });

    if (!decision.allowed) {
      this.metricsService.deliveryCommandCounter.inc({ result: `blocked_${decision.reason}` });
      throw new BadRequestException(`Delivery blocked by pacing rules: ${decision.reason}`);
    }

    const commandId = randomUUID();
    const sent = await this.overlayGateway.pushAdCommand(channel.id, {
      commandId,
      campaignId: campaign.id,
      creativeId: creative.id,
      durationSec: parsed.durationSec || creative.durationSec,
      assetUrl: this.storageService.objectUrl(creative.objectKey),
      clickUrl: creative.clickUrl,
      animation: "fade"
    });

    if (!sent) {
      this.metricsService.deliveryCommandCounter.inc({ result: "failed_no_overlay" });
      throw new BadRequestException("Overlay is not connected");
    }

    await this.eventsService.recordSystemEvent("ad_command_sent", {
      requestId: commandId,
      streamerId: channel.streamerProfileId,
      channelId: channel.id,
      sessionId: session.id,
      campaignId: campaign.id,
      creativeId: creative.id,
      payload: {
        durationSec: parsed.durationSec || creative.durationSec,
        transport: "websocket"
      }
    });

    this.metricsService.deliveryCommandCounter.inc({ result: "sent" });

    this.dashboardGateway.broadcast("delivery_sent", {
      commandId,
      channelId: channel.id,
      campaignId: campaign.id,
      creativeId: creative.id,
      sessionId: session.id,
      sentAt: new Date().toISOString()
    });

    return {
      ok: true,
      commandId,
      channelId: channel.id,
      campaignId: campaign.id,
      creativeId: creative.id,
      sessionId: session.id
    };
  }
}

```

## apps/api/src/deliveries/deliveries.controller.ts

```ts
import { Body, Controller, Post } from "@nestjs/common";
import { RequirePermission } from "../common/permissions.decorator";
import { DeliveriesService } from "./deliveries.service";

@Controller("deliveries")
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post("trigger")
  @RequirePermission("deliveries:trigger")
  async trigger(@Body() body: unknown) {
    return this.deliveriesService.trigger(body);
  }
}

```

## apps/api/src/reporting/pdf.service.ts

```ts
import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";

interface SummaryRow {
  day: string;
  impressions: number;
  clicks: number;
  minutesOnScreen: number;
}

@Injectable()
export class PdfReportService {
  async renderCampaignSummaryPdf(input: {
    campaignName: string;
    advertiser: string;
    objective: string;
    totals: {
      impressions: number;
      clicks: number;
      ctr: number;
      minutesOnScreen: number;
    };
    rows: SummaryRow[];
  }): Promise<Buffer> {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

    doc.fontSize(22).text("Beta Live Ads Platform", { align: "left" });
    doc.moveDown(0.25);
    doc.fontSize(16).text("Campaign Delivery Report", { align: "left" });
    doc.moveDown();

    doc.fontSize(11).text(`Campaign: ${input.campaignName}`);
    doc.text(`Advertiser: ${input.advertiser}`);
    doc.text(`Objective: ${input.objective}`);
    doc.text(`Generated (UTC): ${new Date().toISOString()}`);
    doc.moveDown();

    doc.fontSize(12).text("Summary", { underline: true });
    doc.fontSize(11).text(`Impressions (ad_completed): ${input.totals.impressions}`);
    doc.text(`Clicks: ${input.totals.clicks}`);
    doc.text(`CTR: ${(input.totals.ctr * 100).toFixed(2)}%`);
    doc.text(`Minutes on screen proxy: ${input.totals.minutesOnScreen.toFixed(2)}`);

    doc.moveDown();
    doc.fontSize(12).text("Daily Timeline", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10).text("Date (UTC)", 50, doc.y, { continued: true, width: 120 });
    doc.text("Impressions", 170, doc.y, { continued: true, width: 90 });
    doc.text("Clicks", 260, doc.y, { continued: true, width: 70 });
    doc.text("Minutes On Screen", 330, doc.y, { width: 160 });

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

    input.rows.forEach((row) => {
      const y = doc.y + 8;
      doc.text(row.day, 50, y, { continued: true, width: 120 });
      doc.text(String(row.impressions), 170, y, { continued: true, width: 90 });
      doc.text(String(row.clicks), 260, y, { continued: true, width: 70 });
      doc.text(row.minutesOnScreen.toFixed(2), 330, y, { width: 160 });
      doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).strokeColor("#e5e7eb").stroke();
      doc.moveDown(0.25);
    });

    doc.end();

    return new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }
}

```

## apps/api/src/reporting/reporting.service.ts

```ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { PdfReportService } from "./pdf.service";

interface DailySummary {
  day: string;
  impressions: number;
  clicks: number;
  minutesOnScreen: number;
}

function toCsv(rows: DailySummary[]) {
  const header = "day,impressions,clicks,minutes_on_screen";
  const body = rows.map((row) => `${row.day},${row.impressions},${row.clicks},${row.minutesOnScreen.toFixed(4)}`);
  return [header, ...body].join("\n");
}

@Injectable()
export class ReportingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfReportService: PdfReportService
  ) {}

  async campaignSummary(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    const metrics = await this.prisma.dailyMetric.findMany({
      where: { campaignId },
      orderBy: { day: "asc" }
    });

    let rows: DailySummary[];

    if (metrics.length > 0) {
      rows = metrics.map((metric) => ({
        day: metric.day.toISOString().slice(0, 10),
        impressions: metric.impressions,
        clicks: metric.clicks,
        minutesOnScreen: Number(metric.minutesOnScreen)
      }));
    } else {
      const [completedEvents, clickEvents] = await Promise.all([
        this.prisma.event.findMany({
          where: {
            campaignId,
            type: "ad_completed"
          },
          select: { ts: true, payload: true }
        }),
        this.prisma.event.findMany({
          where: {
            campaignId,
            type: "ad_click"
          },
          select: { ts: true }
        })
      ]);

      const grouped: Record<string, DailySummary> = {};

      for (const event of completedEvents) {
        const day = event.ts.toISOString().slice(0, 10);
        const durationSec =
          typeof event.payload === "object" && event.payload && "durationSec" in event.payload
            ? Number((event.payload as { durationSec?: unknown }).durationSec)
            : 0;

        if (!grouped[day]) {
          grouped[day] = { day, impressions: 0, clicks: 0, minutesOnScreen: 0 };
        }

        grouped[day].impressions += 1;
        grouped[day].minutesOnScreen += Number.isFinite(durationSec) ? durationSec / 60 : 0;
      }

      for (const event of clickEvents) {
        const day = event.ts.toISOString().slice(0, 10);
        if (!grouped[day]) {
          grouped[day] = { day, impressions: 0, clicks: 0, minutesOnScreen: 0 };
        }
        grouped[day].clicks += 1;
      }

      rows = Object.values(grouped).sort((a, b) => a.day.localeCompare(b.day));
    }

    const totals = rows.reduce(
      (acc, row) => {
        acc.impressions += row.impressions;
        acc.clicks += row.clicks;
        acc.minutesOnScreen += row.minutesOnScreen;
        return acc;
      },
      { impressions: 0, clicks: 0, minutesOnScreen: 0 }
    );

    return {
      campaign,
      rows,
      totals: {
        ...totals,
        ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0
      }
    };
  }

  async exportCsv(campaignId: string) {
    const summary = await this.campaignSummary(campaignId);
    return toCsv(summary.rows);
  }

  async proofTimeline(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    const events = await this.prisma.event.findMany({
      where: {
        campaignId,
        type: {
          in: ["ad_command_sent", "ad_rendered", "ad_completed", "ad_click", "ad_error"]
        }
      },
      orderBy: { ts: "desc" },
      take: 300,
      include: {
        creative: {
          select: {
            id: true,
            objectKey: true,
            format: true
          }
        },
        channel: {
          select: {
            id: true,
            twitchChannelName: true
          }
        }
      }
    });

    return {
      campaignId,
      events: events.map((event) => ({
        id: event.id,
        type: event.type,
        ts: event.ts.toISOString(),
        requestId: event.requestId,
        channel: event.channel,
        creative: event.creative
      }))
    };
  }

  async exportPdf(campaignId: string): Promise<Buffer> {
    const summary = await this.campaignSummary(campaignId);

    return this.pdfReportService.renderCampaignSummaryPdf({
      campaignName: summary.campaign.name,
      advertiser: summary.campaign.advertiser,
      objective: summary.campaign.objective,
      totals: summary.totals,
      rows: summary.rows
    });
  }
}

```

## apps/api/src/reporting/reporting.controller.ts

```ts
import { Controller, Get, Param, Res } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { z } from "zod";
import { RequirePermission } from "../common/permissions.decorator";
import { ReportingService } from "./reporting.service";

const paramsSchema = z.object({
  id: z.string().uuid()
});

@Controller("reports")
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get("campaign/:id/summary")
  @RequirePermission("reports:summary")
  async summary(@Param() params: unknown) {
    const parsed = paramsSchema.parse(params);
    return this.reportingService.campaignSummary(parsed.id);
  }

  @Get("campaign/:id/proof-timeline")
  @RequirePermission("reports:summary")
  async proofTimeline(@Param() params: unknown) {
    const parsed = paramsSchema.parse(params);
    return this.reportingService.proofTimeline(parsed.id);
  }

  @Get("campaign/:id/export.csv")
  @RequirePermission("reports:export_csv")
  async exportCsv(@Param() params: unknown, @Res({ passthrough: true }) res: FastifyReply) {
    const parsed = paramsSchema.parse(params);
    const csv = await this.reportingService.exportCsv(parsed.id);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", `attachment; filename=campaign-${parsed.id}-report.csv`);

    return csv;
  }

  @Get("campaign/:id/export.pdf")
  @RequirePermission("reports:export_pdf")
  async exportPdf(@Param() params: unknown, @Res({ passthrough: true }) res: FastifyReply) {
    const parsed = paramsSchema.parse(params);
    const pdf = await this.reportingService.exportPdf(parsed.id);

    res.header("Content-Type", "application/pdf");
    res.header("Content-Disposition", `attachment; filename=campaign-${parsed.id}-report.pdf`);

    return pdf;
  }
}

```

## apps/api/src/payouts/payouts.service.ts

```ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

function calculatePayoutAmount(rateType: "cpm" | "fixed", rate: number, impressions: number): number {
  if (rateType === "fixed") {
    return Number(rate.toFixed(2));
  }

  return Number(((impressions / 1000) * rate).toFixed(2));
}

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async run(campaignId: string) {
    const assignments = await this.prisma.campaignAssignment.findMany({
      where: { campaignId },
      include: {
        campaign: true,
        channel: true
      }
    });

    const payouts = await this.prisma.$transaction(async (tx) => {
      const result = [];

      for (const assignment of assignments) {
        const impressions = await tx.event.count({
          where: {
            campaignId,
            channelId: assignment.channelId,
            type: "ad_completed"
          }
        });

        const rateType = assignment.fixedFee ? "fixed" : "cpm";
        const rate = Number(assignment.fixedFee ?? assignment.cpmRate ?? 0);
        const amount = calculatePayoutAmount(rateType, rate, impressions);

        const payout = await tx.payout.upsert({
          where: {
            campaignId_channelId: {
              campaignId,
              channelId: assignment.channelId
            }
          },
          update: {
            rateType,
            rate,
            deliveredImpressions: impressions,
            amount,
            status: "pending"
          },
          create: {
            campaignId,
            channelId: assignment.channelId,
            rateType,
            rate,
            deliveredImpressions: impressions,
            amount,
            status: "pending"
          }
        });

        result.push(payout);
      }

      return result;
    });

    return {
      campaignId,
      count: payouts.length,
      payouts
    };
  }

  async markPaid(payoutId: string) {
    const existing = await this.prisma.payout.findUnique({ where: { id: payoutId } });
    if (!existing) {
      throw new NotFoundException("Payout not found");
    }

    return this.prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: "paid",
        paidAt: new Date()
      }
    });
  }
}

export { calculatePayoutAmount };

```

## apps/api/src/payouts/payouts.controller.ts

```ts
import { Controller, Get, Param, Post, Query } from "@nestjs/common";
import { z } from "zod";
import { RequirePermission } from "../common/permissions.decorator";
import { PayoutsService } from "./payouts.service";

const runSchema = z.object({
  campaignId: z.string().uuid()
});

const payoutParamSchema = z.object({
  id: z.string().uuid()
});

@Controller("payouts")
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get("run")
  @RequirePermission("payouts:run")
  async run(@Query() query: unknown) {
    const parsed = runSchema.parse(query);
    return this.payoutsService.run(parsed.campaignId);
  }

  @Post(":id/mark-paid")
  @RequirePermission("payouts:mark_paid")
  async markPaid(@Param() params: unknown) {
    const parsed = payoutParamSchema.parse(params);
    return this.payoutsService.markPaid(parsed.id);
  }
}

```

## apps/api/src/admin/admin.controller.ts

```ts
import { Controller, Get, Query } from "@nestjs/common";
import { z } from "zod";
import { RequirePermission } from "../common/permissions.decorator";
import { PrismaService } from "../common/prisma.service";

const auditQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).default(50)
});

@Controller("admin")
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("audit")
  @RequirePermission("admin:audit")
  async audit(@Query() query: unknown) {
    const parsed = auditQuerySchema.parse(query ?? {});

    return this.prisma.auditLog.findMany({
      take: parsed.limit,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }
}

```

## apps/api/test/delivery-policy.test.ts

```ts
import { describe, expect, it } from "vitest";
import { evaluateDeliveryCaps } from "../src/deliveries/delivery-policy";

describe("evaluateDeliveryCaps", () => {
  it("allows delivery when all caps are under threshold", () => {
    const result = evaluateDeliveryCaps({
      hourlyDelivered: 2,
      sessionDelivered: 3,
      campaignHourlyCommands: 10,
      capPerStreamerPerHour: 6,
      capPerSession: 30,
      pacingPerHour: 20
    });

    expect(result).toEqual({ allowed: true });
  });

  it("blocks delivery when streamer hourly cap is reached", () => {
    const result = evaluateDeliveryCaps({
      hourlyDelivered: 6,
      sessionDelivered: 1,
      campaignHourlyCommands: 1,
      capPerStreamerPerHour: 6,
      capPerSession: 30,
      pacingPerHour: 20
    });

    expect(result).toEqual({ allowed: false, reason: "streamer_hourly_cap_reached" });
  });
});

```

## apps/api/test/payouts-calculation.test.ts

```ts
import { describe, expect, it } from "vitest";
import { calculatePayoutAmount } from "../src/payouts/payouts.service";

describe("calculatePayoutAmount", () => {
  it("calculates CPM payouts using ad_completed impression definition", () => {
    const amount = calculatePayoutAmount("cpm", 15, 2500);
    expect(amount).toBe(37.5);
  });

  it("uses fixed amount when payout model is fixed", () => {
    const amount = calculatePayoutAmount("fixed", 450, 10000);
    expect(amount).toBe(450);
  });
});

```

# Phase 4

Goal: Add BullMQ worker service for campaign and streamer daily metric aggregation.

Files:
- /Users/myraune/Desktop/beta ads/apps/worker/.env.example
- /Users/myraune/Desktop/beta ads/apps/worker/package.json
- /Users/myraune/Desktop/beta ads/apps/worker/tsconfig.json
- /Users/myraune/Desktop/beta ads/apps/worker/src/aggregation.worker.ts
- /Users/myraune/Desktop/beta ads/apps/worker/src/index.ts

How to run locally:
```bash
pnpm --filter @beta/worker dev
```

Minimal tests:
```bash
pnpm --filter @beta/worker test
```

## apps/worker/.env.example

```txt
DATABASE_URL=postgresql://beta:beta@localhost:5432/beta_ads?schema=public
REDIS_URL=redis://localhost:6379
WORKER_CONCURRENCY=5

```

## apps/worker/package.json

```json
{
  "name": "@beta/worker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "lint": "tsc -p tsconfig.json --noEmit",
    "test": "echo 'No worker tests yet'",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@beta/db": "workspace:*",
    "bullmq": "^5.40.0",
    "ioredis": "^5.5.0"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.8.2"
  }
}

```

## apps/worker/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}

```

## apps/worker/src/aggregation.worker.ts

```ts
import { PrismaClient } from "@beta/db";

export async function runAggregation(prisma: PrismaClient) {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

  const events = await prisma.event.findMany({
    where: {
      ts: { gte: since },
      campaignId: { not: null },
      channelId: { not: null },
      type: {
        in: ["ad_completed", "ad_click"]
      }
    },
    select: {
      ts: true,
      type: true,
      campaignId: true,
      channelId: true,
      payload: true
    }
  });

  const grouped = new Map<string, { day: Date; campaignId: string; channelId: string; impressions: number; clicks: number; minutes: number }>();

  for (const event of events) {
    if (!event.campaignId || !event.channelId) {
      continue;
    }

    const dayString = event.ts.toISOString().slice(0, 10);
    const day = new Date(`${dayString}T00:00:00.000Z`);
    const key = `${dayString}:${event.campaignId}:${event.channelId}`;

    const current = grouped.get(key) ?? {
      day,
      campaignId: event.campaignId,
      channelId: event.channelId,
      impressions: 0,
      clicks: 0,
      minutes: 0
    };

    if (event.type === "ad_completed") {
      current.impressions += 1;
      const durationSec =
        typeof event.payload === "object" && event.payload && "durationSec" in event.payload
          ? Number((event.payload as { durationSec?: unknown }).durationSec)
          : 0;
      if (Number.isFinite(durationSec) && durationSec > 0) {
        current.minutes += durationSec / 60;
      }
    }

    if (event.type === "ad_click") {
      current.clicks += 1;
    }

    grouped.set(key, current);
  }

  await prisma.$transaction(
    [...grouped.values()].map((row) =>
      prisma.dailyMetric.upsert({
        where: {
          day_campaignId_channelId: {
            day: row.day,
            campaignId: row.campaignId,
            channelId: row.channelId
          }
        },
        update: {
          impressions: row.impressions,
          clicks: row.clicks,
          minutesOnScreen: row.minutes
        },
        create: {
          day: row.day,
          campaignId: row.campaignId,
          channelId: row.channelId,
          impressions: row.impressions,
          clicks: row.clicks,
          minutesOnScreen: row.minutes
        }
      })
    )
  );

  return {
    aggregatedRows: grouped.size,
    sampledEvents: events.length
  };
}

```

## apps/worker/src/index.ts

```ts
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@beta/db";
import { runAggregation } from "./aggregation.worker";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null
});

const prisma = new PrismaClient();
const queueName = "aggregation";

async function bootstrap() {
  const queue = new Queue(queueName, { connection });

  await queue.add(
    "aggregate-daily",
    {},
    {
      repeat: { every: 60_000 },
      removeOnComplete: 1000,
      removeOnFail: 500
    }
  );

  const worker = new Worker(
    queueName,
    async () => {
      const result = await runAggregation(prisma);
      console.info(JSON.stringify({ level: "info", msg: "aggregation_complete", ...result }));
      return result;
    },
    {
      connection,
      concurrency: Number(process.env.WORKER_CONCURRENCY ?? 5)
    }
  );

  worker.on("failed", (job, err) => {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "aggregation_failed",
        jobId: job?.id,
        error: err.message
      })
    );
  });

  process.on("SIGTERM", async () => {
    await worker.close();
    await queue.close();
    await connection.quit();
    await prisma.$disconnect();
    process.exit(0);
  });

  console.info(JSON.stringify({ level: "info", msg: "worker_started", queue: queueName }));
}

bootstrap().catch(async (error) => {
  console.error(JSON.stringify({ level: "error", msg: "worker_bootstrap_failed", error: String(error) }));
  await connection.quit();
  await prisma.$disconnect();
  process.exit(1);
});

```

# Phase 5

Goal: Deliver the portal and overlay Next.js apps plus shared UI package for operator and streamer workflows.

Files:
- /Users/myraune/Desktop/beta ads/packages/ui/package.json
- /Users/myraune/Desktop/beta ads/packages/ui/tsconfig.json
- /Users/myraune/Desktop/beta ads/packages/ui/src/index.tsx
- /Users/myraune/Desktop/beta ads/apps/portal/.env.example
- /Users/myraune/Desktop/beta ads/apps/portal/package.json
- /Users/myraune/Desktop/beta ads/apps/portal/next.config.mjs
- /Users/myraune/Desktop/beta ads/apps/portal/postcss.config.js
- /Users/myraune/Desktop/beta ads/apps/portal/tailwind.config.ts
- /Users/myraune/Desktop/beta ads/apps/portal/tsconfig.json
- /Users/myraune/Desktop/beta ads/apps/portal/next-env.d.ts
- /Users/myraune/Desktop/beta ads/apps/portal/src/app/globals.css
- /Users/myraune/Desktop/beta ads/apps/portal/src/app/layout.tsx
- /Users/myraune/Desktop/beta ads/apps/portal/src/app/page.tsx
- /Users/myraune/Desktop/beta ads/apps/portal/src/app/agency/page.tsx
- /Users/myraune/Desktop/beta ads/apps/portal/src/app/streamer/page.tsx
- /Users/myraune/Desktop/beta ads/apps/portal/src/app/admin/page.tsx
- /Users/myraune/Desktop/beta ads/apps/portal/src/components/live-feed.tsx
- /Users/myraune/Desktop/beta ads/apps/portal/src/lib/api.ts
- /Users/myraune/Desktop/beta ads/apps/overlay/.env.example
- /Users/myraune/Desktop/beta ads/apps/overlay/package.json
- /Users/myraune/Desktop/beta ads/apps/overlay/next.config.mjs
- /Users/myraune/Desktop/beta ads/apps/overlay/postcss.config.js
- /Users/myraune/Desktop/beta ads/apps/overlay/tailwind.config.ts
- /Users/myraune/Desktop/beta ads/apps/overlay/tsconfig.json
- /Users/myraune/Desktop/beta ads/apps/overlay/next-env.d.ts
- /Users/myraune/Desktop/beta ads/apps/overlay/src/app/globals.css
- /Users/myraune/Desktop/beta ads/apps/overlay/src/app/layout.tsx
- /Users/myraune/Desktop/beta ads/apps/overlay/src/app/page.tsx
- /Users/myraune/Desktop/beta ads/apps/overlay/src/app/overlay/page.tsx
- /Users/myraune/Desktop/beta ads/apps/overlay/src/components/overlay-client.tsx

How to run locally:
```bash
pnpm --filter @beta/portal dev
pnpm --filter @beta/overlay dev
```

Minimal tests:
```bash
pnpm --filter @beta/portal lint
pnpm --filter @beta/overlay lint
```

## packages/ui/package.json

```json
{
  "name": "@beta/ui",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "src/index.tsx",
  "scripts": {
    "dev": "tsc -w -p tsconfig.json",
    "build": "tsc -p tsconfig.json",
    "lint": "tsc -p tsconfig.json --noEmit",
    "test": "echo 'No ui tests'",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "react": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "typescript": "^5.8.2"
  }
}

```

## packages/ui/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}

```

## packages/ui/src/index.tsx

```ts
import { clsx } from "clsx";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function Button(props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { className, children, ...rest } = props;
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
        "bg-slate-900 text-white",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <section className={clsx("rounded-xl border border-slate-200 bg-white p-4 shadow-sm", className)}>{children}</section>;
}

```

## apps/portal/.env.example

```txt
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_WS_URL=http://localhost:4000

```

## apps/portal/package.json

```json
{
  "name": "@beta/portal",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "tsc -p tsconfig.json --noEmit",
    "test": "echo 'No portal tests yet'",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@beta/ui": "workspace:*",
    "next": "14.2.24",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "socket.io-client": "^4.8.1"
  },
  "devDependencies": {
    "@types/node": "^22.13.4",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.2",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.2"
  }
}

```

## apps/portal/next.config.mjs

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;

```

## apps/portal/postcss.config.js

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

```

## apps/portal/tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        signal: "#e94f37",
        mint: "#5adbb5",
        fog: "#f2f4f8"
      },
      boxShadow: {
        float: "0 20px 40px rgba(16,24,32,0.12)"
      }
    }
  },
  plugins: []
};

export default config;

```

## apps/portal/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "allowJs": true,
    "incremental": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "plugins": [
      {
        "name": "next"
      }
    ],
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "isolatedModules": true
  },
  "include": [
    "next-env.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

```

## apps/portal/next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.

```

## apps/portal/src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

body {
  @apply bg-fog text-ink;
}

.dashboard-grid {
  background-image: radial-gradient(circle at 1px 1px, rgba(16, 24, 32, 0.08) 1px, transparent 0);
  background-size: 20px 20px;
}

```

## apps/portal/src/app/layout.tsx

```ts
import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Beta Live Ads Platform",
  description: "Agency, streamer, and admin dashboards for live ad delivery."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${heading.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-fog via-white to-[#e9f7f2]">{children}</body>
    </html>
  );
}

```

## apps/portal/src/app/page.tsx

```ts
import Link from "next/link";

const portals = [
  {
    href: "/agency",
    title: "Agency and Brand Portal",
    summary: "Campaign setup, creative approvals, delivery control, reporting exports"
  },
  {
    href: "/streamer",
    title: "Streamer Portal",
    summary: "Onboarding, channel profile, overlay key rotation, session visibility"
  },
  {
    href: "/admin",
    title: "Admin Portal",
    summary: "Audit timeline, payouts, reliability, and operations"
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12">
      <header className="mb-10">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-ink/70">Beta Live Ads Platform</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Control Live Stream Ads With Proof</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/75">
          This MVP ships a self-owned ad delivery stack with OBS overlay control, strict event ingestion, and campaign level reporting.
        </p>
      </header>

      <section className="dashboard-grid grid gap-4 rounded-3xl border border-ink/10 bg-white/70 p-4 md:grid-cols-3">
        {portals.map((portal) => (
          <Link
            key={portal.href}
            href={portal.href}
            className="group rounded-2xl border border-ink/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-signal hover:shadow-float"
          >
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-ink group-hover:text-signal">{portal.title}</h2>
            <p className="mt-2 text-sm text-ink/75">{portal.summary}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

```

## apps/portal/src/app/agency/page.tsx

```ts
import { LiveFeed } from "@/components/live-feed";
import { fetchCampaigns } from "@/lib/api";

export default async function AgencyPortalPage() {
  const campaigns = (await fetchCampaigns()) ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-6 py-8">
      <header>
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-ink/60">Agency and Brand Portal</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-semibold">Campaign Control Room</h1>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-semibold">Campaigns</h2>
          {campaigns.length === 0 ? (
            <p className="text-sm text-ink/70">No campaigns found. Create one through API endpoint `POST /campaigns`.</p>
          ) : (
            <ul className="space-y-2">
              {campaigns.map((campaign) => (
                <li key={campaign.id} className="rounded-lg border border-ink/10 bg-fog p-3">
                  <p className="font-semibold text-ink">{campaign.name}</p>
                  <p className="text-sm text-ink/75">Advertiser: {campaign.advertiser}</p>
                  <p className="text-xs uppercase tracking-wide text-ink/60">Status: {campaign.status}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <LiveFeed />
      </section>
    </main>
  );
}

```

## apps/portal/src/app/streamer/page.tsx

```ts
export default function StreamerPortalPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-6 py-8">
      <header>
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-ink/60">Streamer Portal</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-semibold">Overlay Onboarding</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">Step 1, Profile</h2>
          <p className="mt-2 text-sm text-ink/70">
            Use `POST /streamers/profile` with Twitch handle, language, categories, average viewers, and pricing tier.
          </p>
        </article>

        <article className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">Step 2, Channel</h2>
          <p className="mt-2 text-sm text-ink/70">
            Use `POST /streamers/channels`, then call `POST /overlay/rotate-key` to generate a fresh OBS overlay URL.
          </p>
        </article>

        <article className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm md:col-span-2">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">OBS Browser Source</h2>
          <p className="mt-2 text-sm text-ink/70">Paste the generated URL into OBS Browser Source. Keep width and height aligned with your scene safe zone.</p>
          <pre className="mt-3 rounded-lg bg-ink p-3 font-[family-name:var(--font-mono)] text-xs text-mint">
{`https://your-overlay-host/overlay?key=<long-random-overlay-key>`}
          </pre>
        </article>
      </section>
    </main>
  );
}

```

## apps/portal/src/app/admin/page.tsx

```ts
import { fetchAudit } from "@/lib/api";

export default async function AdminPortalPage() {
  const audit = (await fetchAudit()) ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-6 py-8">
      <header>
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-ink/60">Admin Portal</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-semibold">Operations and Audit</h1>
      </header>

      <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-semibold">Recent Audit Events</h2>
        {audit.length === 0 ? (
          <p className="text-sm text-ink/70">No audit entries available yet.</p>
        ) : (
          <ul className="space-y-2">
            {audit.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-ink/10 bg-fog p-3 text-sm">
                <p className="font-medium text-ink">{entry.action}</p>
                <p className="text-ink/75">Entity: {entry.entityType}</p>
                <p className="font-[family-name:var(--font-mono)] text-xs text-ink/65">{entry.createdAt}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

```

## apps/portal/src/components/live-feed.tsx

```ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

type FeedEvent = {
  event: string;
  at: string;
  payload: Record<string, unknown>;
};

const WS_BASE = process.env.NEXT_PUBLIC_API_WS_URL ?? "http://localhost:4000";

export function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    const socket = io(`${WS_BASE}/dashboard`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000
    });

    const pushEvent = (event: string, payload: Record<string, unknown>) => {
      setEvents((previous) => [{ event, payload, at: new Date().toISOString() }, ...previous].slice(0, 10));
    };

    socket.on("overlay_status", (payload) => pushEvent("overlay_status", payload));
    socket.on("overlay_heartbeat", (payload) => pushEvent("overlay_heartbeat", payload));
    socket.on("delivery_sent", (payload) => pushEvent("delivery_sent", payload));

    return () => {
      socket.disconnect();
    };
  }, []);

  const hasEvents = useMemo(() => events.length > 0, [events]);

  return (
    <section className="rounded-2xl border border-ink/10 bg-white/90 p-4 shadow-float backdrop-blur">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold">Live Delivery Feed</h3>
        <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-ink">WebSocket</span>
      </header>

      {!hasEvents ? (
        <p className="text-sm text-ink/70">Waiting for overlay and delivery events...</p>
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={`${event.event}-${event.at}`} className="rounded-lg border border-ink/10 bg-fog p-2 text-xs">
              <p className="font-medium text-ink">{event.event}</p>
              <p className="font-[family-name:var(--font-mono)] text-ink/70">{event.at}</p>
              <pre className="mt-1 overflow-x-auto rounded bg-white p-2 text-[11px] text-ink/80">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

```

## apps/portal/src/lib/api.ts

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchCampaigns() {
  return request<Array<{ id: string; name: string; status: string; advertiser: string }>>("/campaigns");
}

export async function fetchAudit() {
  return request<Array<{ id: string; action: string; entityType: string; createdAt: string }>>("/admin/audit?limit=8");
}

```

## apps/overlay/.env.example

```txt
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_WS_URL=http://localhost:4000

```

## apps/overlay/package.json

```json
{
  "name": "@beta/overlay",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "tsc -p tsconfig.json --noEmit",
    "test": "echo 'No overlay tests yet'",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "next": "14.2.24",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "socket.io-client": "^4.8.1"
  },
  "devDependencies": {
    "@types/node": "^22.13.4",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.2",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.2"
  }
}

```

## apps/overlay/next.config.mjs

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;

```

## apps/overlay/postcss.config.js

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

```

## apps/overlay/tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        adFadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        adPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" }
        }
      },
      animation: {
        adFadeIn: "adFadeIn 240ms ease-out",
        adPulse: "adPulse 1.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;

```

## apps/overlay/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "allowJs": true,
    "incremental": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "plugins": [
      {
        "name": "next"
      }
    ],
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "isolatedModules": true
  },
  "include": [
    "next-env.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

```

## apps/overlay/next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.

```

## apps/overlay/src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

```

## apps/overlay/src/app/layout.tsx

```ts
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beta Ads Overlay",
  description: "OBS overlay app for live ad rendering"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

```

## apps/overlay/src/app/page.tsx

```ts
import Link from "next/link";

export default function OverlayHomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <h1 className="text-xl font-semibold">Beta Overlay App</h1>
        <p className="mt-2 text-sm text-slate-300">Use this app through the overlay route with a key parameter.</p>
        <Link href="/overlay?key=demo" className="mt-4 inline-block text-sm text-cyan-300 underline">
          Open demo route
        </Link>
      </div>
    </main>
  );
}

```

## apps/overlay/src/app/overlay/page.tsx

```ts
import { OverlayClient } from "@/components/overlay-client";

export default function OverlayPage({
  searchParams
}: {
  searchParams: {
    key?: string;
  };
}) {
  const key = searchParams.key ?? "";

  return <OverlayClient overlayKey={key} />;
}

```

## apps/overlay/src/components/overlay-client.tsx

```ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type OverlayCommand = {
  commandId: string;
  campaignId: string;
  creativeId: string;
  durationSec: number;
  assetUrl: string;
  clickUrl?: string;
  animation?: "fade" | "slide" | "pulse";
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WS_BASE = process.env.NEXT_PUBLIC_API_WS_URL ?? "http://localhost:4000";

function eventRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`;
}

export function OverlayClient({ overlayKey }: { overlayKey: string }) {
  const socketRef = useRef<Socket | null>(null);
  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [command, setCommand] = useState<OverlayCommand | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const commandRef = useRef<OverlayCommand | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const renderMode = useMemo(() => {
    if (!command) return "none";
    if (command.assetUrl.endsWith(".mp4")) return "video";
    return "image";
  }, [command]);

  useEffect(() => {
    commandRef.current = command;
  }, [command]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (!overlayKey) {
      return;
    }

    const sendEvent = async (type: string, payload: Record<string, unknown> = {}, overrides: Partial<OverlayCommand> = {}) => {
      try {
        await fetch(`${API_BASE}/events/ingest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-overlay-key": overlayKey
          },
          body: JSON.stringify({
            type,
            ts: new Date().toISOString(),
            request_id: eventRequestId(),
            session_id: sessionIdRef.current,
            campaign_id: overrides.campaignId ?? commandRef.current?.campaignId ?? null,
            creative_id: overrides.creativeId ?? commandRef.current?.creativeId ?? null,
            payload
          })
        });
      } catch {
        // silent retry behavior, overlay should never block OBS render loop.
      }
    };

    const socket = io(`${WS_BASE}/overlay`, {
      transports: ["websocket"],
      auth: { key: overlayKey },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 8000,
      timeout: 10000
    });

    socketRef.current = socket;

    socket.on("connect", async () => {
      await sendEvent("overlay_connected", { transport: "socket_io" });
    });

    socket.on("session", (payload: { sessionId: string }) => {
      setSessionId(payload.sessionId);
    });

    socket.on("ad:command", async (incoming: OverlayCommand) => {
      setCommand(incoming);
      await sendEvent("ad_rendered", { durationSec: incoming.durationSec }, incoming);

      if (activeTimerRef.current) {
        clearTimeout(activeTimerRef.current);
      }

      activeTimerRef.current = setTimeout(async () => {
        await sendEvent("ad_completed", { durationSec: incoming.durationSec }, incoming);
        setCommand(null);
      }, incoming.durationSec * 1000);
    });

    socket.on("disconnect", async () => {
      await sendEvent("overlay_disconnected", { reason: "socket_disconnect" });
      setCommand(null);
    });

    const heartbeatId = setInterval(async () => {
      socket.emit("overlay:heartbeat", {
        requestId: eventRequestId(),
        payload: { source: "overlay_client" }
      });
      await sendEvent("overlay_heartbeat", { source: "overlay_client" });
    }, 25_000);

    return () => {
      clearInterval(heartbeatId);
      if (activeTimerRef.current) {
        clearTimeout(activeTimerRef.current);
      }
      socket.disconnect();
    };
  }, [overlayKey]);

  if (!command) {
    return <div className="h-screen w-screen bg-transparent" />;
  }

  const animation = command.animation === "pulse" ? "animate-adPulse" : "animate-adFadeIn";

  return (
    <div className="pointer-events-none fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-transparent">
      <div className="pointer-events-auto absolute bottom-6 right-6 w-[34vw] max-w-[420px] min-w-[220px]">
        <button
          type="button"
          className={`group relative w-full overflow-hidden rounded-xl border border-white/30 bg-black/20 shadow-2xl backdrop-blur ${animation}`}
          onClick={async () => {
            try {
              await fetch(`${API_BASE}/events/ingest`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-overlay-key": overlayKey
                },
                body: JSON.stringify({
                  type: "ad_click",
                  ts: new Date().toISOString(),
                  request_id: eventRequestId(),
                  session_id: sessionId,
                  campaign_id: command.campaignId,
                  creative_id: command.creativeId,
                  payload: { source: "overlay_click" }
                })
              });
            } catch {
              // do not block click behavior if API is temporarily unreachable.
            }

            if (command.clickUrl) {
              window.open(command.clickUrl, "_blank", "noopener,noreferrer");
            }
          }}
        >
          {renderMode === "video" ? (
            <video className="h-full w-full object-cover" autoPlay muted playsInline>
              <source src={command.assetUrl} type="video/mp4" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={command.assetUrl} alt="Sponsored creative" className="h-full w-full object-cover" />
          )}

          <div className="absolute left-3 top-3 rounded bg-black/65 px-2 py-1 text-[10px] uppercase tracking-wide text-white">Sponsored</div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3 text-left text-xs text-white">
            Tap for details
          </div>
        </button>
      </div>
    </div>
  );
}

```

