# Team Plan and Role Mapping

## Minimum Viable Team (MVP Build)

| Role | Headcount | Type | Responsibility |
|---|---|---|---|
| Product Manager / TPM | 1 | Full-time | Backlog, sprint, acceptance, stakeholder |
| UX/UI Designer | 1 | Full-time | Design system, screen designs, RTL review |
| Full-Stack Engineer (Lead) | 1 | Full-time | Architecture, backend, DB, auth, matching |
| Full-Stack Engineer | 1 | Full-time | Frontend, admin, provider flows |
| DevOps (part-time) | 0.5 | Part-time / contract | CI/CD, Vercel, Supabase, infra setup |
| QA Engineer | 1 | Full-time (from Week 5) | Test planning, E2E tests, RTL QA, pre-launch |
| Operations (Community Lead) | 1 | Full-time | Provider acquisition, verification support, customer support |

**Minimum viable:** 2 engineers + 1 designer + 1 ops = 4 people to ship MVP.

---

## Role Descriptions

### Product Manager / TPM
**Owns:** Product vision, sprint backlog, acceptance criteria, release decisions, stakeholder communication.

**Daily:**
- Sprint stand-up facilitation
- Backlog grooming
- Acceptance of completed stories
- Communication with ops/community team
- Analytics review

**Does NOT do:** Code, design decisions (collaborates on these).

**Must have:** Understanding of marketplace dynamics. French + Arabic is a plus. Strong written communication.

---

### UX/UI Designer

**Owns:** Design system, all screen designs (Figma), interactive prototypes, RTL layout review, accessibility audit.

**Works 1 sprint ahead of engineers** — screens are ready before engineers pick them up.

**Critical skills:**
- Arabic RTL design experience (mandatory)
- Mobile-first design experience
- Figma proficiency
- Basic understanding of Next.js component model (for handoff quality)
- Awareness of Tailwind utility classes (preferred)

**Deliverables per sprint:**
- 4–6 fully designed screens with all states (loading, empty, error)
- Component updates to design system
- i18n-ready designs (no hardcoded strings in mockups)
- RTL variants for every screen

---

### Full-Stack Engineer (Lead)

**Owns:** Architecture decisions, database schema, API design, auth, matching engine, performance, security review.

**Skills required:**
- Next.js 14 (App Router, Server Components, API Routes)
- TypeScript (strict mode)
- PostgreSQL + Supabase
- REST API design
- RLS policies
- Git workflow
- Performance optimization

**Does:** Backend-heavy features, core architecture, code reviews.

---

### Full-Stack Engineer

**Owns:** Frontend screens, admin dashboard, component library implementation, RTL implementation, UI integration.

**Skills required:**
- Next.js 14 frontend
- TypeScript
- Tailwind CSS
- shadcn/ui
- React (hooks, context)
- Basic Supabase client usage
- RTL CSS (logical properties)
- next-intl

**Does:** Customer/provider UI, admin UI, design system implementation, component tests.

---

### Operations / Community Lead

**Owns:** Provider acquisition, provider onboarding support, admin verification assistance, customer support, quality monitoring.

**Must have:**
- Native Moroccan Arabic (Darija + Modern Standard Arabic) + French
- WhatsApp / phone communication skills
- Basic admin dashboard usage
- Understanding of the home services market
- Ability to evaluate provider credibility

**Daily tasks:**
- Process provider applications (assist admin verification)
- Respond to provider support questions (WhatsApp)
- Reach out to inactive providers
- Collect qualitative feedback from providers
- Escalate issues to product team

**This role is critical for marketplace supply quality.** A technically perfect platform fails without a human layer in the early days.

---

## Expanded Team (V1.1 and beyond)

When scaling past initial launch:

| Addition | When | Purpose |
|---|---|---|
| 3rd Full-Stack Engineer | When team throughput becomes bottleneck | Accelerate V1.1 |
| Mobile Engineer (React Native) | V2 native app | iOS/Android apps |
| Data Analyst | After 90 days | KPI deep dives, cohort analysis |
| Marketing Manager | V1.1 | Paid acquisition, content, SEO |
| 2nd Ops (Arabic-speaking) | When provider base > 500 | Scale verification and support |
| Customer Success | V2 | Retention, onboarding quality |

---

## Communication and Collaboration

### Tools
- **Code:** GitHub (private repo)
- **Project management:** Linear (preferred) or Notion for smaller teams
- **Design:** Figma with developer mode enabled
- **Communication:** WhatsApp for Moroccan-market team (fast, practical)
- **Video calls:** Google Meet or Zoom
- **Documentation:** This docs folder + README

### Sprint Rhythm (2-week sprints)

| Day | Activity |
|---|---|
| Monday (Sprint Start) | Sprint planning, backlog refinement |
| Wednesday | Mid-sprint check-in (async or 15-min call) |
| Friday | Optional demo if something big shipped |
| Monday (Sprint End) | Sprint review + retrospective (30 min) |

### Definition of a Story "In Review"
- Code is in a PR
- PR includes: description of change, screenshots (if UI), test evidence
- CI passes
- Designer has reviewed UI against mockup
- PM has reviewed against acceptance criteria

---

## Hiring Priorities

If starting from scratch today, hire in this order:

1. **Full-Stack Engineer (Lead)** — can't build without them
2. **Operations Lead** — can't acquire supply without them
3. **Designer** — can start on system + screens while engineer sets up infra
4. **Full-Stack Engineer #2** — accelerates from week 3
5. **QA** — bring in from week 5 for pre-launch
6. **PM/TPM** — if founder is non-technical, hire earlier; if founder is technical PM, push to later
