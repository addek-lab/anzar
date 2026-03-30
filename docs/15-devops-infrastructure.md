# DevOps and Infrastructure Plan

## Environment Strategy

### Four Environments

| Environment | Purpose | Infrastructure |
|---|---|---|
| `local` | Developer's machine | Supabase local (Docker), Next.js dev server |
| `preview` | Per-PR previews | Vercel preview deployment + staging Supabase |
| `staging` | Pre-production validation | Vercel staging deployment + staging Supabase |
| `production` | Live platform | Vercel production + production Supabase |

### Environment Variable Strategy

```
.env.local          — never committed, developer-specific
.env.example        — committed, documents all required vars (no values)
Vercel environment  — preview/staging/production vars managed in Vercel dashboard
Supabase vault      — database-level secrets (API keys used in Edge Functions)
```

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-side only, never NEXT_PUBLIC_

# SMS / OTP
TWILIO_ACCOUNT_SID=               # or alternative SMS provider
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_ENV=              # 'development' | 'staging' | 'production'

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=           # client-side Sentry
NEXT_PUBLIC_POSTHOG_KEY=

# Email (admin/support only)
RESEND_API_KEY=
```

---

## Infrastructure Components

### Vercel (Frontend + API)

**Plan:** Hobby → Pro (when team > 2 and concurrent deploys needed)

**Configuration:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["cdg1"],           // Paris edge for Morocco latency
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

**Vercel Edge Functions:** Used for middleware (auth checks, rate limiting, locale detection).

### Supabase

**Plan:** Pro ($25/month) — required for:
- Daily automated backups
- 7-day PITR (Point in Time Recovery)
- Higher connection pool limits
- Custom SMTP

**Projects:**
- `anzar-prod` — production
- `anzar-staging` — staging + preview (shared to save cost)

**Supabase Storage Buckets:**
```
request-images    (public)   — customer request photos
provider-photos   (public)   — provider work gallery
avatars           (public)   — user profile photos
documents         (private)  — provider verification documents
```

**Storage CDN:** Enabled via Supabase CDN (Cloudflare-backed). Images served from CDN edge.

---

## Local Development Setup

### Prerequisites
```
Node.js 20+
npm 10+
Docker Desktop (for Supabase local)
Supabase CLI
```

### Setup Steps

```bash
# 1. Clone repo
git clone https://github.com/anzar/platform.git && cd platform

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env.local
# Edit .env.local with local Supabase values

# 4. Start Supabase locally
npx supabase start

# 5. Apply migrations
npx supabase db push

# 6. Seed database
npx supabase db seed

# 7. Start dev server
npm run dev
```

### Supabase Local URLs (generated)
```
API:        http://localhost:54321
Studio:     http://localhost:54323
Storage:    http://localhost:54321/storage/v1
```

---

## CI/CD Pipeline

### Tool: GitHub Actions

### Branches Strategy

```
main        — production-ready code (protected, requires PR + review)
develop     — integration branch
feature/*   — individual feature branches
fix/*       — bug fix branches
hotfix/*    — urgent production fixes (merge to main directly)
```

### Branch Protection Rules (main)
- Required: 1 approving review
- Required: all CI checks pass
- Required: up-to-date with main
- No force push
- No direct push

### CI Pipeline (on every PR)

```yaml
# .github/workflows/ci.yml
name: CI

on: [pull_request]

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run build

  migrations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase db diff --check   # validate migrations don't conflict
```

### CD Pipeline (on merge to main)

```yaml
# .github/workflows/deploy.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 1. Run database migrations
      - uses: supabase/setup-cli@v1
      - run: supabase db push --linked   # pushes to production Supabase

      # 2. Deploy to Vercel (auto-triggered by Vercel GitHub integration)
      # (Vercel handles this automatically on push to main)

      # 3. Notify team
      - name: Notify deployment
        run: echo "Deployment triggered"
        # Add Slack/email notification if needed
```

### Preview Deployments
- Vercel automatically creates preview URLs for every PR
- Preview uses staging Supabase project
- Preview URL posted as PR comment by Vercel GitHub integration

---

## Database Migration Workflow

```bash
# Create new migration
npx supabase migration new add_provider_availability

# Edit the migration file
# supabase/migrations/TIMESTAMP_add_provider_availability.sql

# Test locally
npx supabase db reset  # resets and re-applies all migrations + seed

# Review diff
npx supabase db diff

# Push to staging
npx supabase db push --project-ref <staging-ref>

# After PR merged to main:
# CI/CD pipeline pushes to production automatically
```

**Rules:**
- Never edit applied migration files
- Every migration must be reversible in V1 (include rollback SQL in comments)
- Migrations must not break existing functionality (additive only during active development)

---

## Backup Strategy

### Database Backups
- **Supabase Pro:** Automated daily backups, 7-day PITR
- **Additional:** Monthly manual dump stored in separate S3 bucket (Supabase CLI `pg_dump`)
- **Backup verification:** Monthly restore test to verify backup integrity

### Media Backups
- Supabase Storage: replication handled by Supabase
- Critical documents (provider ID scans): stored in separate private bucket with versioning

---

## Logging Strategy

### Structured Logging
All server-side logs use structured JSON:
```json
{
  "level": "info",
  "timestamp": "2026-03-29T10:00:00Z",
  "message": "Request submitted",
  "requestId": "uuid",
  "userId": "uuid",
  "category": "plumbing",
  "city": "casablanca"
}
```

**Never log:** auth tokens, phone numbers, document contents, passwords.

### Log Destinations
- **Vercel logs:** API route logs (30-day retention on Pro)
- **Supabase logs:** Database query logs (7-day retention)
- **Sentry:** Error events with stack traces (60-day retention free tier)

---

## Monitoring and Alerting

### Uptime Monitoring
- **Tool:** Better Uptime or UptimeRobot (free tier)
- **Monitors:** Production URL (`/api/v1/health`), Admin URL
- **Alert channel:** WhatsApp group for team (most responsive for Moroccan team)
- **Incident page:** Simple status page via Better Uptime

### Error Monitoring
- **Sentry:** Server-side errors in API routes
- **Alert threshold:** > 5 new unique errors in 10 minutes → Slack/WhatsApp alert

### Performance Monitoring
- **Vercel Analytics:** Core Web Vitals (LCP, CLS, FID) per route
- **Alert:** If LCP degrades > 20% from baseline

### Business Metrics Monitoring
- **PostHog dashboards:** Request funnel, provider response rate
- **Alert:** If daily request creation rate drops > 50% from 7-day average (suggests outage or UX regression)

### Health Check Endpoint

```typescript
// /api/v1/health
export async function GET() {
  const dbCheck = await supabase.from('categories').select('id').limit(1)
  return Response.json({
    status: dbCheck.error ? 'degraded' : 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)
  })
}
```

---

## Infrastructure Cost Estimate (Monthly, MVP)

| Service | Plan | Cost |
|---|---|---|
| Vercel | Pro | $20/month |
| Supabase | Pro | $25/month |
| Twilio SMS | Pay per SMS (OTP + notifications) | ~$20–50/month at MVP scale |
| Sentry | Free tier | $0 |
| PostHog | Free tier (< 1M events) | $0 |
| Better Uptime | Free tier | $0 |
| Resend (email) | Free tier | $0 |
| **Total** | | **~$65–95/month** |

This is well within the "< $200/month" constraint.

---

## Rollback Strategy

### Application Rollback
Vercel allows instant rollback to any previous deployment in the dashboard (one-click).

### Database Rollback
- **Minor migration:** Create a new migration that reverses the change
- **Major incident:** Restore from Supabase PITR backup
- **PITR window:** 7 days (Supabase Pro)

### Rollback Decision Tree
```
Incident detected
    ↓
Is it a code bug or a data corruption?
    ├── Code bug → Vercel rollback (< 2 minutes)
    ├── Code bug + data issue → Vercel rollback + patch migration
    └── Data corruption → PITR restore (requires downtime, rare)
```

---

## Incident Response Basics

### Severity Levels

| Level | Definition | Response Time | Escalation |
|---|---|---|---|
| P1 | Platform down (all users) | < 30 min | Immediate team alert |
| P2 | Core flow broken (requests, matching) | < 2 hours | Team alert |
| P3 | Feature degraded (chat slow, notifications delayed) | < 24 hours | Next business day |
| P4 | Minor bug (cosmetic, edge case) | < 1 week | Normal sprint |

### P1 Response Steps
1. Alert team via WhatsApp
2. Check Vercel status + Supabase status pages
3. Review Sentry for error spike
4. If code regression: rollback deployment
5. If DB issue: assess PITR need
6. Post status update on status page
7. Communicate to users if > 30 min downtime (in-app message or social)
8. Post-mortem within 48 hours of resolution

---

## Release Checklist

Before every production release:

**Code:**
- [ ] PR reviewed and approved
- [ ] All CI checks passing
- [ ] No new Sentry errors in staging
- [ ] Performance regression check (Vercel Analytics baseline)
- [ ] i18n: all new strings have French and Arabic translations
- [ ] RTL: new screens tested in Arabic mode

**Database:**
- [ ] Migration tested on staging
- [ ] Migration rollback script ready
- [ ] No breaking schema changes in same deploy as code change that depends on them (deploy migration first)

**Monitoring:**
- [ ] Any new event types added to PostHog tracking
- [ ] Sentry alerts configured for new critical paths

**Sign-off:**
- [ ] Product sign-off (PM)
- [ ] Technical sign-off (lead engineer)
