# Product Requirements Document (PRD)
# Anzar — Moroccan Home Services Marketplace

**Version:** 1.0 (MVP)
**Status:** Approved for implementation
**Last updated:** March 2026

---

## 1. Product Overview

Anzar is a mobile-first, trust-first vertical service marketplace for the Moroccan home services sector. It connects customers who need home repair and maintenance services with verified, local tradespeople through a structured request-match-hire-rate loop.

The platform is built for Casablanca-first launch with immediate Arabic RTL + French bilingual support.

---

## 2. Problem Statement

### Customer Problem
Finding a reliable home service provider in Morocco is fragmented, trust-deficit, and inefficient. The process today:
1. Ask neighbors or Facebook groups for referrals
2. Call unknown numbers from Avito / Jumia / Facebook ads
3. No vetting, no reviews, no accountability
4. High no-show rate, price inflation after arrival, no recourse

**Pain:** No structured way to find vetted, reviewed, accountable local tradespeople.

### Provider Problem
Small tradespeople and contractors have no affordable digital presence, no way to build a professional reputation, and waste time on unqualified contacts:
1. Facebook pages with inconsistent engagement
2. Avito listings with random contacts, many not serious
3. No reputation portability across platforms
4. No way to differentiate quality from bad operators

**Pain:** No structured way to get pre-qualified, serious job leads and build a verified reputation.

---

## 3. Goals and Success Metrics

### Product Goals
| Goal | Metric | MVP Target (90 days) |
|---|---|---|
| Validate request flow | Request completion rate | ≥ 70% of started requests submitted |
| Validate matching | Match coverage rate | ≥ 80% of requests get ≥ 1 match |
| Validate provider engagement | Provider response rate | ≥ 60% of matched leads get a response |
| Validate hiring loop | Contact-to-hire rate | ≥ 25% |
| Validate quality | Review submission rate | ≥ 40% of completed jobs |
| Validate supply quality | Provider verification approval rate | ≥ 60% of applicants |

### Business Goals
- 150+ active verified providers in Casablanca within 90 days of launch
- 500+ submitted service requests within 90 days
- Qualify for monetization activation (lead credits) within 90–120 days
- Establish recognizable brand in Casablanca home services segment

---

## 4. User Personas

### Persona 1: Fatima — The Overwhelmed Homeowner
- 34, married, two children, Casablanca (Maarif district)
- Works full-time, manages household
- Phone: mid-range Android, uses WhatsApp all day
- Problem: water heater broke, needs a plumber today
- Goal: Find a reliable, not-too-expensive plumber quickly without asking the entire neighborhood
- Behavior: She'll post a request if it takes under 2 minutes. She won't fill a long form.

### Persona 2: Hassan — The Independent Electrician
- 41, Casablanca
- Works alone, 12 years of experience
- Phone: entry-level Android
- Currently: gets jobs through WhatsApp word-of-mouth and occasional Avito
- Goal: Get more consistent, serious job leads without cold calling
- Behavior: He will use the app if it gives him real leads. He won't pay upfront with no proof it works.

### Persona 3: Karim — The Small Painting Contractor
- 28, Casablanca
- Has a team of 3, does apartments and offices
- Phone: mid-range Android, uses Facebook for business
- Goal: Grow his customer base, build a professional image
- Behavior: Willing to invest time in a profile if it generates results. Early adopter type.

### Persona 4: Mehdi — The Admin Operator
- Internal team member, Arabic/French bilingual
- Goal: Verify providers efficiently, moderate quality, prevent fraud
- Behavior: Needs fast workflows, not enterprise-grade tooling

---

## 5. Functional Requirements

### 5.1 Authentication

| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | Phone number + OTP login for all user types | P0 |
| AUTH-02 | OTP expires after 10 minutes | P0 |
| AUTH-03 | Max 3 OTP attempts before cooldown (5 min) | P0 |
| AUTH-04 | Language selection on first launch (persistent) | P0 |
| AUTH-05 | Session persistence via secure token (7-day refresh) | P0 |
| AUTH-06 | Account type selection after first login (customer / provider) | P0 |
| AUTH-07 | Phone number E.164 normalization (+212 for Morocco) | P0 |

### 5.2 Customer Request Creation

| ID | Requirement | Priority |
|---|---|---|
| REQ-01 | Multi-step wizard: category → description → photos → location → urgency → submit | P0 |
| REQ-02 | Category selector with icons and translated labels (FR + AR) | P0 |
| REQ-03 | Text description field, min 10 chars, max 500 chars | P0 |
| REQ-04 | Image upload: up to 5 images, max 5MB each, JPEG/PNG/HEIC | P0 |
| REQ-05 | Images auto-converted to WebP on upload | P0 |
| REQ-06 | Location: city selector (Casablanca in V1), optional neighborhood selector | P0 |
| REQ-07 | Urgency selector: Urgent (today), Soon (this week), Flexible | P0 |
| REQ-08 | Optional budget field (text, not enforced) | P1 |
| REQ-09 | Request draft auto-save every 30s | P1 |
| REQ-10 | Request submission triggers matching engine | P0 |
| REQ-11 | Request confirmation screen with estimated response time | P0 |
| REQ-12 | Customer notified when provider responds to request | P0 |

### 5.3 Matching Engine

| ID | Requirement | Priority |
|---|---|---|
| MATCH-01 | Match runs on request submission | P0 |
| MATCH-02 | Returns up to 3 providers per request | P0 |
| MATCH-03 | Matching criteria: category, city, service radius, active status, verification status, quality score | P0 |
| MATCH-04 | Providers with unverified status never appear in matches | P0 |
| MATCH-05 | Providers with suspended status never appear in matches | P0 |
| MATCH-06 | Match results are stored in matches table | P0 |
| MATCH-07 | Providers are notified of new lead match | P0 |
| MATCH-08 | Admin can manually override match results | P1 |
| MATCH-09 | No provider receives more than 5 active unresponded leads simultaneously | P1 |

### 5.4 Provider Profile

| ID | Requirement | Priority |
|---|---|---|
| PROF-01 | Provider name, photo, trade(s), city/neighborhood | P0 |
| PROF-02 | Verified badge display when verification status = approved | P0 |
| PROF-03 | Review score (1–5 stars, average, count) | P0 |
| PROF-04 | Completed jobs count | P0 |
| PROF-05 | Response rate percentage | P0 |
| PROF-06 | Response time average (e.g., "Responds in < 2 hours") | P0 |
| PROF-07 | Work photo gallery (up to 10 photos) | P0 |
| PROF-08 | Short bio / description | P0 |
| PROF-09 | Service area displayed | P0 |
| PROF-10 | Last active status ("Active today", "Active this week") | P1 |
| PROF-11 | Member since date | P1 |
| PROF-12 | Individual reviews list with text and rating | P0 |
| PROF-13 | Contact buttons: Chat (in-app), Call, WhatsApp | P0 |

### 5.5 Offers and Communication

| ID | Requirement | Priority |
|---|---|---|
| MSG-01 | In-app chat per request-provider pair | P0 |
| MSG-02 | Provider can send structured offer: price, availability date, message | P0 |
| MSG-03 | Customer can view offer details in chat thread | P0 |
| MSG-04 | Customer can accept or reject offer | P0 |
| MSG-05 | WhatsApp link opens pre-filled message to provider's WhatsApp | P0 |
| MSG-06 | Phone call button shows provider phone (gated behind match) | P0 |
| MSG-07 | Chat messages delivered in realtime (WebSocket) | P0 |
| MSG-08 | Unread message count shown in navigation | P0 |
| MSG-09 | Push/browser notification for new messages | P1 |

### 5.6 Job Lifecycle

| ID | Requirement | Priority |
|---|---|---|
| JOB-01 | Customer can mark a provider as "selected" | P0 |
| JOB-02 | Customer can mark job as "completed" | P0 |
| JOB-03 | Provider can mark job as "in progress" | P0 |
| JOB-04 | Provider can mark job as "completed" | P0 |
| JOB-05 | Both sides see current job status | P0 |
| JOB-06 | Request expires if no activity for 30 days | P0 |
| JOB-07 | Completed job prompts rating from both sides | P0 |

### 5.7 Rating and Review

| ID | Requirement | Priority |
|---|---|---|
| RATE-01 | Customer rates provider 1–5 stars after job completion | P0 |
| RATE-02 | Customer writes optional text review | P0 |
| RATE-03 | Provider rates customer 1–5 stars (internal, not shown publicly) | P1 |
| RATE-04 | Reviews moderated before publishing | P1 |
| RATE-05 | Reviews cannot be edited after 24 hours | P0 |
| RATE-06 | Provider can report review for moderation | P0 |
| RATE-07 | Review score updates provider quality score in real time | P0 |

### 5.8 Provider Onboarding

| ID | Requirement | Priority |
|---|---|---|
| ON-01 | Multi-step onboarding: name → phone → trade(s) → city → service radius → bio → photos → submit | P0 |
| ON-02 | Provider can select multiple trades | P0 |
| ON-03 | Service radius selection: 5km, 10km, 20km, city-wide | P0 |
| ON-04 | Upload national ID photo (CIN) or business document | P0 |
| ON-05 | Upload up to 5 work portfolio photos | P0 |
| ON-06 | Profile status: pending → admin review | P0 |
| ON-07 | Provider notified of verification decision (approved/rejected + reason) | P0 |
| ON-08 | Provider can resubmit after rejection with corrections | P0 |

### 5.9 Admin Functions

| ID | Requirement | Priority |
|---|---|---|
| ADMIN-01 | Admin login (separate from provider/customer) | P0 |
| ADMIN-02 | Provider verification queue: list, filter, review documents | P0 |
| ADMIN-03 | Approve / reject provider with reason | P0 |
| ADMIN-04 | View all service requests | P0 |
| ADMIN-05 | View all users (search by phone, name) | P0 |
| ADMIN-06 | Suspend / restrict / reinstate account | P0 |
| ADMIN-07 | Review flagged content (images, reviews, messages) | P0 |
| ADMIN-08 | Manage categories (add, rename, activate/deactivate) | P0 |
| ADMIN-09 | Manage category synonyms (for search) | P0 |
| ADMIN-10 | Manage cities and neighborhoods | P0 |
| ADMIN-11 | View dispute/complaint queue | P0 |
| ADMIN-12 | Audit log of all admin actions | P0 |
| ADMIN-13 | Basic dashboard: request volume, provider stats, active users | P1 |

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Time to Interactive (TTI): < 3 seconds on 4G mid-range Android
- Request creation flow: completable in < 60 seconds
- API response time: < 500ms for non-matching endpoints
- Matching engine: < 2 seconds synchronous execution
- Image upload: progress indicator, no blocking UI

### 6.2 Reliability
- Uptime target: 99.5% (MVP, managed platform)
- No data loss on request draft
- Graceful degradation when realtime connection drops

### 6.3 Security
- All API endpoints require authentication except public provider profiles
- Admin routes require admin role claim in JWT
- OTP rate limiting: 3 attempts then 5-minute lockout
- File upload validation: type, size, malware scan via Supabase Storage policies
- No PII exposed in API responses beyond what the recipient is authorized to see
- All database access via Row Level Security (Supabase RLS)

### 6.4 Localization
- All UI strings externalized in i18n JSON files
- French (LTR) and Arabic (RTL) fully supported
- `dir="rtl"` applied at HTML/body level based on locale
- Date/time formatting respects locale
- No hardcoded Arabic or French strings in components

### 6.5 Accessibility
- WCAG 2.1 AA minimum
- Semantic HTML throughout
- Focus states visible
- 44x44px minimum touch targets
- Color contrast ratio ≥ 4.5:1 for normal text

---

## 7. Product Constraints

1. **No payment processing in V1** — the platform does not handle money
2. **No native app in V1** — PWA + Next.js only
3. **6 categories maximum in V1** — do not expand without product review
4. **Casablanca only in V1** — location filtering enforced at request creation
5. **Max 3 matches per request** — hardcoded cap, overridable by admin in edge cases
6. **No anonymous requests** — auth required to create a request

---

## 8. Open Questions (See also: 24-open-questions.md)

1. What OTP provider to use for Morocco? (Twilio vs. local provider like Bayna or Infobip)
2. Will Supabase realtime perform adequately for chat at 1,000+ concurrent users without upgrade?
3. Should WhatsApp number be required at provider registration? (Assumption: yes)
4. What is the SLA for admin verification response? (Assumption: 24 hours)
5. Is neighborhood-level location needed in V1 for Casablanca? (Assumption: optional free-text)
