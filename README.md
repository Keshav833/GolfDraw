# ⛳ GolfDraw — Golf Performance, Prizes & Charity Platform

A subscription-based web platform combining golf score tracking, monthly prize draws, and charitable giving. Built with Next.js, Supabase, and Stripe.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Key Workflows](#key-workflows)
- [Admin Guide](#admin-guide)
- [Deployment](#deployment)
- [Scalability & Security](#scalability--security)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

GolfDraw lets golfers track their scores, participate in monthly prize draws, and automatically contribute a portion of their subscription to a charity of their choice. Admins configure and run draws, verify winners, and manage the full platform from a dedicated dashboard.

---

## Features

### Subscription System
- Monthly and yearly plans via Stripe
- Lifecycle states: `active`, `past_due`, `inactive`, `cancelled`
- Access control gated by subscription status
- Billing portal for self-service plan management

### Score Management
- Users submit golf scores (range: 1–45)
- Rolling window: only the last 5 scores are retained per user
- New scores automatically replace the oldest
- Displayed in reverse chronological order

### Draw & Reward System
- Monthly draws with two modes:
  - **Random** — cryptographic lottery with stored seed for auditability
  - **Algorithmic** — score-weighted draw bias (configurable)
- Match categories: **3-match**, **4-match**, **5-match (jackpot)**
- Jackpot rolls over if no 5-match winner is found
- Simulation mode lets admins preview results before publishing

### Prize Pool
| Category | Pool Share | Rollover |
|----------|-----------|---------|
| 5-match (jackpot) | 40% | ✅ Yes |
| 4-match | 35% | ❌ No |
| 3-match | 25% | ❌ No |

Winners in each category split the pool equally.

### Charity System
- Users select a charity at signup from a curated directory
- Minimum 10% of subscription revenue is allocated to the user's chosen charity
- Users can optionally increase their contribution percentage
- Charity profiles include descriptions, categories, and country filters

### Winner Verification
- Winners upload proof (score screenshot)
- Admin approval/rejection workflow
- Payment states: `pending` → `approved` → `paid`

### User Dashboard
- Subscription status and billing management
- Score submission and history
- Charity selection and allocation overview
- Draw participation history and winnings

### Admin Dashboard
- User and subscription management
- Draw configuration, simulation, and publishing
- Winner verification queue
- Analytics and reporting

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| State management | TanStack Query (React Query) |
| Backend | Next.js API Routes (REST) |
| Database | Supabase (PostgreSQL) with Row-Level Security |
| Auth | Supabase Auth (JWT) |
| Payments | Stripe (Subscriptions + Webhooks) |
| File storage | Supabase Storage / Cloudflare R2 |
| Background jobs | pg_cron + Supabase Edge Functions |
| Email | Resend (transactional) |
| Deployment | Vercel (frontend) + Supabase Cloud (backend) |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Client (Next.js PWA)               │
│     User Dashboard · Admin Dashboard            │
└────────────────────┬────────────────────────────┘
                     │ HTTPS / REST
┌────────────────────▼────────────────────────────┐
│          API Gateway (Next.js API Routes)        │
│     Auth middleware · Rate limiting · Routing    │
└──┬─────────┬────────┬──────────┬────────────────┘
   │         │        │          │
   ▼         ▼        ▼          ▼
 Auth   Subscription Score    Draw Engine
 Svc      Svc        Svc     (sim + publish)
                              │
                    ┌─────────▼──────────┐
                    │ Supabase (Postgres) │
                    │ Auth · Storage · RLS│
                    └─────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
           Stripe          Resend         pg_cron
         (payments)        (email)        (jobs)
```

See the [architecture document](./docs/architecture.md) for a full breakdown of components, data flows, and scalability notes.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account
- A [Resend](https://resend.com) account (or any SMTP provider)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/golfdraw.git
cd golfdraw

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

Fill in all required environment variables (see [Environment Variables](#environment-variables)), then:

```bash
# Push the database schema
npx supabase db push

# Run database seed (optional — loads sample charities and plans)
npm run db:seed

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Stripe Webhooks (local development)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward events to your local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret printed by the CLI into `STRIPE_WEBHOOK_SECRET` in your `.env.local`.

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ADMIN_SECRET=a-long-random-secret-for-admin-seeding
```

---

## Project Structure

```
golfdraw/
├── app/
│   ├── (auth)/               # Login, register, password reset
│   ├── (user)/
│   │   ├── dashboard/        # User overview
│   │   ├── scores/           # Score input and history
│   │   ├── charity/          # Charity selection
│   │   ├── draws/            # Draw history and winnings
│   │   └── account/          # Subscription and billing
│   ├── (admin)/
│   │   ├── users/            # User management
│   │   ├── draws/            # Draw configuration and execution
│   │   ├── winners/          # Verification queue
│   │   ├── charities/        # Charity directory management
│   │   └── analytics/        # Reports and charts
│   └── api/
│       ├── auth/             # Auth helpers
│       ├── scores/           # Score CRUD
│       ├── draws/            # Draw engine endpoints
│       ├── subscriptions/    # Plan management
│       ├── charities/        # Charity directory
│       ├── winners/          # Verification workflow
│       └── webhooks/
│           └── stripe/       # Stripe webhook handler
├── components/
│   ├── ui/                   # shadcn/ui wrappers
│   ├── subscription/         # PlanCard, StatusBadge
│   ├── scores/               # ScoreInput, ScoreHistory
│   ├── draw/                 # DrawCard, MatchBadge
│   └── charity/              # CharityCard, AllocationBar
├── lib/
│   ├── api/                  # Typed fetch wrappers
│   ├── auth/                 # Supabase auth helpers, middleware
│   ├── stripe/               # Checkout and billing helpers
│   └── draw/                 # Draw algorithm (pure functions)
├── supabase/
│   ├── migrations/           # SQL migration files
│   └── seed.sql              # Sample data
├── docs/
│   └── architecture.md       # Full system architecture
└── .env.example
```

---

## Database Schema

### Core tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles, charity selection, contribution % |
| `subscriptions` | Subscription state linked to Stripe |
| `scores` | Golf scores (max 5 per user, enforced by trigger) |
| `charities` | Charity directory |
| `draws` | Draw configuration and status |
| `draw_results` | Winners per draw, payment status |
| `winner_verifications` | Proof uploads and admin review |
| `prize_pool_ledger` | Append-only accounting of prize pool contributions |

### Key constraints

- A Postgres trigger on `scores` enforces the 5-score rolling window — the oldest score is deleted automatically when a 6th is inserted.
- Row-Level Security (RLS) is enabled on all tables. Users can only access their own records.
- `prize_pool_ledger` is append-only — rows are never updated or deleted, giving a full audit trail.
- `draws.config` is a JSONB column storing draw-specific parameters (RNG seed, number range, match thresholds) to allow rule changes without schema migrations.

---

## Key Workflows

### Score submission

1. User submits a score (validated: integer, 1–45)
2. Score inserted into `scores` with a timestamp
3. Postgres trigger fires — if the user has more than 5 scores, the oldest is deleted
4. API returns the updated 5-score list

### Monthly draw

1. Admin configures the draw (mode, prize pool snapshot)
2. System captures a snapshot of all eligible users (active subscriptions) and their current scores
3. Draw number is generated (cryptographic RNG; seed stored for auditability)
4. Admin runs simulation — results computed but **not persisted**
5. Admin reviews simulation output, then publishes
6. `draw_results` rows are written; winners are notified by email
7. If no 5-match winner, the jackpot amount carries forward to the next draw

### Winner verification

1. Winner receives an email with a time-limited upload link
2. Winner uploads a screenshot of their score card to Supabase Storage
3. `winner_verifications` record is created with `status = pending`
4. Admin reviews the upload in the verification queue
5. Admin approves or rejects (with an optional note)
6. On approval, payment state transitions to `approved` → `paid`

### Subscription lifecycle

```
Signup → Stripe Checkout → webhook: checkout.session.completed
  → subscription created (status: active)
  → prize pool ledger entry written
  → charity allocation recorded

Payment failure → webhook: invoice.payment_failed
  → status: past_due → grace period → status: inactive (access locked)

Cancellation → webhook: customer.subscription.deleted
  → status: cancelled
  → user can re-subscribe at any time
```

---

## Admin Guide

### Running a draw

1. Navigate to **Admin → Draws → New Draw**
2. Select the month, draw mode (Random or Algorithmic), and confirm the prize pool total
3. Click **Simulate** to preview results without publishing
4. Review the match breakdown (3-match / 4-match / 5-match counts and prize amounts)
5. Click **Publish** to commit results and trigger winner notifications
6. If no 5-match winner is found, the jackpot rolls forward automatically

### Verifying winners

1. Navigate to **Admin → Winners** — the queue is sorted by prize amount descending
2. Click a record to view the uploaded proof image
3. Click **Approve** or **Reject** (with a note if rejecting)
4. Approved records are flagged for payment processing

### Managing charities

- Add new charities via **Admin → Charities → Add Charity**
- Toggle `is_active` to show or hide a charity from the user-facing directory
- Users' existing charity selections are not affected when a charity is deactivated

---

## Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in the Vercel project settings under **Settings → Environment Variables**.

### Supabase

Database migrations are managed with the Supabase CLI:

```bash
# Apply all pending migrations to production
npx supabase db push --db-url $SUPABASE_DB_URL
```

### pg_cron (scheduled draw trigger)

The monthly draw can be triggered automatically via `pg_cron`. Enable the extension in your Supabase project and run:

```sql
-- Trigger draw job on the 1st of each month at 09:00 UTC
SELECT cron.schedule(
  'monthly-draw-trigger',
  '0 9 1 * *',
  $$SELECT net.http_post(
    url := 'https://your-app.vercel.app/api/draws/trigger',
    headers := '{"Authorization": "Bearer <ADMIN_SECRET>"}'::jsonb
  )$$
);
```

---

## Scalability & Security

### Scalability

- **Single-region to start** — Supabase scales vertically before you need read replicas
- **Draw computation** is a pure function over a user snapshot; handles tens of thousands of users in seconds
- **Upgrade path**: extract the draw engine to an Edge Function, add a read replica for analytics queries, introduce Inngest for durable job workflows
- **Multi-country ready** — `country` fields on `users` and `charities` are included from day one

### Security

- **JWT authentication** with short-lived tokens (1 hour); refresh handled client-side
- **Row-Level Security** enforced at the database layer — API bugs cannot leak cross-user data
- **Stripe webhook verification** — `Stripe-Signature` header validated on every event
- **Presigned upload URLs** expire in 15 minutes; proof files are stored privately
- **Cryptographic RNG** (`crypto.randomInt`) used for draw number generation — never `Math.random`
- **Rate limiting** on score submission, auth endpoints, and file uploads

---

## Roadmap

- [ ] Algorithmic draw mode (score-weighted)
- [ ] Mobile app (React Native, shared business logic)
- [ ] Automated winner payouts via Stripe Payouts API (post-KYC)
- [ ] Multi-country support (localised plans and currencies)
- [ ] Analytics dashboard (revenue, charity allocation, draw history charts)
- [ ] Public draw results page (shareable, no login required)
- [ ] Referral program

---

## Contributing

Pull requests are welcome. For significant changes, please open an issue first to discuss what you'd like to change.

```bash
# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

Please ensure all tests pass and the linter reports no errors before submitting a PR.

---

## License

[MIT](./LICENSE)
