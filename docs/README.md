# Anzar — Complete Product and Engineering Planning Package

**Version:** 1.0
**Date:** March 2026
**Status:** Ready for implementation

---

## Document Index

| # | Document | Description |
|---|---|---|
| 00 | [Executive Summary](00-executive-summary.md) | Product vision, positioning, success criteria |
| 01 | [Assumptions and MVP](01-assumptions-and-mvp.md) | Core assumptions, MVP definition and constraints |
| 02 | [Product Requirements (PRD)](02-prd.md) | Full functional and non-functional requirements |
| 03 | [Scope Split: MVP / V1.1 / V2](03-scope-split.md) | Feature roadmap by release phase |
| 04 | [Epics and User Stories](04-epics-and-stories.md) | All user stories with acceptance criteria |
| 05 | [Information Architecture](05-information-architecture.md) | Route structure, navigation, role-based IA |
| 06 | [Screen Inventory](06-screen-inventory.md) | Every screen defined with elements and states |
| 07 | [UX Flows](07-ux-flows.md) | End-to-end user journey descriptions |
| 08 | [Design System Direction](08-design-system.md) | Colors, typography, components, RTL rules |
| 09 | [Technical Architecture](09-technical-architecture.md) | Stack decisions, system diagram, auth, data access |
| 10 | [Database Schema](10-database-schema.md) | Full schema: tables, indexes, constraints, enums |
| 11 | [API Specification](11-api-specification.md) | All endpoints with request/response shapes |
| 12 | [Matching Engine Design](12-matching-engine.md) | Algorithm, scoring model, edge cases |
| 13 | [Trust and Moderation Framework](13-trust-and-moderation.md) | Trust signals, verification, review system, fraud |
| 14 | [Security Checklist](14-security-checklist.md) | Auth, RBAC, upload, API, data privacy, infra |
| 15 | [DevOps and Infrastructure](15-devops-infrastructure.md) | Environments, CI/CD, backups, monitoring, cost |
| 16 | [Testing Strategy](16-testing-strategy.md) | Unit, integration, E2E, RTL, QA, Definition of Done |
| 17 | [Analytics and KPIs](17-analytics-and-kpis.md) | Event taxonomy, funnel metrics, KPI dashboard |
| 18 | [Launch Plan](18-launch-plan.md) | Pre-launch, soft launch, beta, public launch |
| 19 | [Risk Register](19-risk-register.md) | All risks with likelihood, impact, mitigation |
| 20 | [Implementation Order](20-implementation-order.md) | Build sequence, phases, critical path |
| 21 | [Team and Roles](21-team-and-roles.md) | Role descriptions, hiring priorities |
| 22 | [Build Roadmap](22-roadmap.md) | 10-sprint week-by-week task breakdown |
| 23 | [Monetization Strategy](23-monetization.md) | Lead credits, V2 subscriptions, pricing model |
| 24 | [Open Questions](24-open-questions.md) | Decisions needed, with recommendations |

---

## Quick Reference: Key Decisions

| Decision | Choice |
|---|---|
| **Product type** | Structured service marketplace (not classifieds) |
| **Launch market** | Casablanca (Morocco) |
| **Initial categories** | 6: Electrician, Plumbing, Painting, HVAC, Tiling, Handyman |
| **Max providers per request** | 3 |
| **Languages** | French (LTR) + Arabic (RTL) from day one |
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| **Backend/DB** | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| **Deployment** | Vercel |
| **Auth** | Phone/OTP (Supabase + Twilio) |
| **Matching** | Deterministic weighted scoring, synchronous |
| **Chat** | Supabase Realtime (WebSocket) |
| **V1 monetization** | None (free) — activate in V1.1 |
| **V1.1 monetization** | Pay-per-lead credit system for providers |
| **Mobile strategy** | PWA (no native app in V1) |
| **Build timeline** | 10 weeks (2 engineers) |
| **Infrastructure cost** | ~$65–95/month at MVP scale |

---

## How to Use This Package

**Founders:** Start with [00-executive-summary.md](00-executive-summary.md) and [01-assumptions-and-mvp.md](01-assumptions-and-mvp.md).

**Engineers:** Start with [09-technical-architecture.md](09-technical-architecture.md), [10-database-schema.md](10-database-schema.md), [11-api-specification.md](11-api-specification.md), then [20-implementation-order.md](20-implementation-order.md).

**Designers:** Start with [08-design-system.md](08-design-system.md), [06-screen-inventory.md](06-screen-inventory.md), [07-ux-flows.md](07-ux-flows.md).

**PM/TPM:** Start with [02-prd.md](02-prd.md), [04-epics-and-stories.md](04-epics-and-stories.md), [22-roadmap.md](22-roadmap.md).

**DevOps:** Start with [15-devops-infrastructure.md](15-devops-infrastructure.md).

**QA:** Start with [16-testing-strategy.md](16-testing-strategy.md).

**Investors:** Read [00-executive-summary.md](00-executive-summary.md) and [23-monetization.md](23-monetization.md).
