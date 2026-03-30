# Testing Strategy

## Testing Philosophy

Test the behaviors that matter, not lines of code. The goal is confidence that the core transaction loop works — always. Over-testing trivial code is as bad as under-testing critical paths.

**What must never break:**
1. Request creation and submission
2. Matching engine selection logic
3. Offer send and acceptance
4. Provider verification status enforcement
5. Auth (OTP flow, session, role enforcement)
6. RTL rendering of critical screens

---

## Testing Pyramid

```
         ┌─────────────┐
         │   E2E Tests  │  ← Small, targeted, critical paths only
         │   (Playwright)│
         ├─────────────────┤
         │  Integration Tests │  ← API routes + DB logic
         │  (Vitest + Supabase local)
         ├─────────────────────────┤
         │       Unit Tests         │  ← Pure logic (matching engine, validators)
         │         (Vitest)         │
         └─────────────────────────┘
```

**Ratio target:** ~60% unit, ~30% integration, ~10% E2E

---

## Unit Tests (Vitest)

### What to unit test:
- Matching engine scoring functions
- Input validation schemas (Zod)
- i18n utilities
- Date/time formatting helpers
- Utility functions (phone normalization, score calculators)

### Matching Engine Unit Tests

```typescript
// tests/unit/matching.test.ts
describe('Matching Engine Scoring', () => {
  it('returns 0 providers when none match the category', ...)
  it('scores provider with no history at neutral level', ...)
  it('boosts provider with high response rate', ...)
  it('penalizes provider with low response rate', ...)
  it('applies urgency bonus for fast-responding providers on urgent requests', ...)
  it('excludes suspended providers from results', ...)
  it('excludes providers at active lead capacity', ...)
  it('returns maximum 3 providers', ...)
  it('returns fewer than 3 if less eligible', ...)
  it('breaks ties with provider creation date', ...)
})
```

### Validation Schema Tests

```typescript
describe('Request Creation Validation', () => {
  it('rejects description shorter than 10 chars', ...)
  it('rejects description longer than 500 chars', ...)
  it('rejects invalid urgency values', ...)
  it('requires category_id', ...)
  it('accepts valid request body', ...)
})
```

---

## Integration Tests (Vitest + Supabase local)

### What to integration test:
- API route behavior (happy path + error cases)
- Database constraints (unique constraints, FK violations)
- RLS policies (cross-user access attempts)
- Job lifecycle transitions (valid and invalid state changes)

### API Route Tests

```typescript
// tests/integration/api/requests.test.ts
describe('POST /api/v1/requests', () => {
  it('creates a request and triggers matching', ...)
  it('rejects unauthenticated requests', ...)
  it('rejects request with missing category', ...)
  it('rejects request for inactive city', ...)
  it('normalizes description input', ...)
})

describe('POST /api/v1/requests/:id/images', () => {
  it('rejects files over 5MB', ...)
  it('rejects non-image file types', ...)
  it('rejects upload when 5 images already exist', ...)
  it('rejects upload for someone else\'s request', ...)
})
```

### Role-Based Permission Tests

```typescript
describe('Authorization enforcement', () => {
  // Provider cannot access customer-only routes
  it('returns 403 when provider accesses /api/v1/requests (customer route)', ...)

  // Customer cannot access provider-only routes
  it('returns 403 when customer accesses /api/v1/leads', ...)

  // Non-admin cannot access admin routes
  it('returns 403 when provider accesses /api/v1/admin/providers/queue', ...)

  // Unverified provider cannot access leads
  it('returns 403 when pending provider accesses leads', ...)

  // Provider cannot see another provider's match score
  it('hides internal score from provider API response', ...)

  // Customer cannot see another customer's request
  it('returns 404 when customer accesses another customer\'s request', ...)
})
```

### RLS Tests

```typescript
describe('Row Level Security', () => {
  it('customer cannot read other customer requests via direct query', ...)
  it('provider cannot read requests they are not matched to', ...)
  it('provider cannot read private documents of other providers', ...)
})
```

---

## End-to-End Tests (Playwright)

E2E tests cover only critical paths. Keep the suite lean and fast.

### Test Scenarios

```typescript
// tests/e2e/customer-flow.spec.ts
test('Customer can create a request and see matched providers', async ({ page }) => {
  // 1. Navigate to app
  // 2. Login with test phone + OTP
  // 3. Select "Customer"
  // 4. Click "Create Request"
  // 5. Select Plumbing category
  // 6. Enter description
  // 7. Skip photos
  // 8. Set location (Casablanca)
  // 9. Select urgency
  // 10. Submit
  // 11. Assert: confirmation screen shown
  // 12. Assert: at least 1 provider card visible on request detail
})

// tests/e2e/provider-flow.spec.ts
test('Provider can receive, view, and respond to a lead', async ({ page }) => {
  // Using a pre-seeded verified provider
  // 1. Login as provider
  // 2. Navigate to leads
  // 3. Click on new lead
  // 4. Verify request details visible
  // 5. Click "Respond"
  // 6. Fill offer form
  // 7. Submit
  // 8. Assert: offer appears in conversation
})

// tests/e2e/auth-flow.spec.ts
test('OTP lockout prevents brute force', async ({ page }) => {
  // 1. Enter wrong OTP 3 times
  // 2. Assert: input locked
  // 3. Assert: countdown timer visible
})

// tests/e2e/rtl-rendering.spec.ts
test('Arabic RTL layout renders correctly on request creation', async ({ page }) => {
  // 1. Set language to Arabic
  // 2. Navigate to request creation
  // 3. Assert: dir="rtl" on html element
  // 4. Assert: back button on correct side
  // 5. Assert: no text overflow or broken layout
  // 6. Take screenshot for visual diff comparison
})
```

---

## Localization Tests

```typescript
describe('i18n coverage', () => {
  it('all keys in fr locale have corresponding ar locale key', ...)
  it('no component renders hardcoded French or Arabic strings', ...)
  it('RTL-specific CSS applied when locale is ar', ...)
  it('date formatting respects locale (fr: DD/MM/YYYY, ar: same)', ...)
  it('currency formatting always shows MAD suffix', ...)
})
```

**Tool:** Custom script that parses all locale JSON files and validates key parity.

---

## RTL Visual Tests

```typescript
// Playwright visual snapshots for critical screens in Arabic
test.describe('RTL Visual Regression', () => {
  for (const screen of ['home', 'request-creation', 'provider-profile', 'chat']) {
    test(`${screen} renders correctly in Arabic RTL`, async ({ page }) => {
      await page.setLocale('ar')
      await page.goto(`/test-fixtures/${screen}`)
      await expect(page).toHaveScreenshot(`${screen}-rtl.png`)
    })
  }
})
```

---

## Upload Tests

```typescript
describe('File upload edge cases', () => {
  it('rejects SVG files (security)', ...)
  it('rejects JavaScript files', ...)
  it('rejects files exceeding 5MB', ...)
  it('handles network failure gracefully with retry', ...)
  it('shows progress indicator during upload', ...)
  it('allows re-upload after deletion', ...)
})
```

---

## Abuse / Fraud Scenario Tests

```typescript
describe('Security and abuse prevention', () => {
  it('OTP endpoint rate limits after 3 requests', ...)
  it('cannot create request as unauthenticated user', ...)
  it('cannot submit review twice for same job', ...)
  it('cannot accept an offer on someone else\'s request', ...)
  it('suspended user receives 403 on all API calls', ...)
  it('provider in pending state cannot access leads', ...)
})
```

---

## Mobile Responsiveness Tests

Manual testing protocol (before each release):

| Device Profile | Screen | Check |
|---|---|---|
| Samsung Galaxy A series (360px) | Request creation | No horizontal scroll |
| Samsung Galaxy A series (360px) | Provider profile | Text not truncated unintentionally |
| iPhone SE (375px) | Chat | Keyboard doesn't push content off-screen |
| iPhone SE (375px) | Onboarding | All steps accessible |
| iPad (768px) | Admin queue | Table layout readable |

**Tool:** BrowserStack for real device testing (pre-launch sprint).

---

## Performance Tests

```typescript
describe('Performance benchmarks', () => {
  it('matching engine completes in < 2000ms for 500 providers', ...)
  it('request creation API returns < 500ms', ...)
  it('chat message delivery latency < 1000ms (WebSocket)', ...)
})
```

---

## Definition of Done

A feature is complete when ALL of the following are true:

### Feature Complete
- [ ] All acceptance criteria from user story met
- [ ] Works on mobile (tested at 360px width)
- [ ] Works in both French (LTR) and Arabic (RTL)
- [ ] All error states handled and display correct messages
- [ ] Loading states implemented for async operations
- [ ] Empty states implemented

### Tested
- [ ] Unit tests written for new logic functions
- [ ] Integration tests cover API route happy and error paths
- [ ] Role-based access verified (both allowed and blocked cases)
- [ ] E2E test added if feature is on a critical path

### Accessible
- [ ] Semantic HTML (correct heading hierarchy, labels on inputs)
- [ ] 44x44px minimum touch targets
- [ ] Keyboard navigable
- [ ] Focus states visible
- [ ] Color contrast AA compliant

### Localized
- [ ] All strings in locale files (no hardcoded text)
- [ ] FR and AR translations complete
- [ ] RTL tested (no broken layouts in Arabic)

### Deployable
- [ ] CI pipeline passes
- [ ] No new console errors or warnings
- [ ] No regressions in Lighthouse scores (> 5 point drop requires investigation)
- [ ] Supabase migrations applied and tested on staging
- [ ] Feature flag or graceful error if dependency unavailable

### Observable in Production
- [ ] PostHog event fired for the key action
- [ ] Sentry error context includes relevant IDs (requestId, userId)
- [ ] No PII in logs
