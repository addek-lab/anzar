# Matching Engine Design

## Design Philosophy

The matching engine is the core value-creation mechanism of the platform. It must:
1. Return only relevant, high-quality providers
2. Be fast (< 2 seconds)
3. Be explainable (no black-box ML in V1)
4. Be improvable as data accumulates
5. Protect providers from lead flooding
6. Protect customers from irrelevant or poor-quality matches

**V1 approach:** Deterministic weighted scoring on a filtered candidate pool. No ML. No bidding.

---

## Matching Pipeline

```
Request submitted
    ↓
Step 1: ELIGIBILITY FILTER (hard constraints — binary pass/fail)
    ↓
Step 2: SCORING (weighted sum of quality signals)
    ↓
Step 3: WORKLOAD GUARD (cap active leads per provider)
    ↓
Step 4: SELECT TOP 3
    ↓
Step 5: CREATE MATCH RECORDS
    ↓
Step 6: NOTIFY PROVIDERS
    ↓
Return match IDs to customer
```

---

## Step 1: Eligibility Filter

These are **hard disqualifiers** — a provider that fails any of these is excluded completely:

```sql
SELECT pp.id, pp.quality_score, pp.response_rate, pp.avg_response_hours
FROM provider_profiles pp
JOIN provider_trades pt ON pt.provider_id = pp.id
WHERE
  -- 1. Category match (required)
  pt.category_id = :request_category_id

  -- 2. City match (required)
  AND pp.city_id = :request_city_id

  -- 3. Verification status (required)
  AND pp.status = 'verified'

  -- 4. Account active
  AND pp.user_id IN (SELECT id FROM profiles WHERE is_active = true)

  -- 5. Not at active lead capacity (workload guard)
  AND (
    SELECT COUNT(*) FROM matches m
    WHERE m.provider_id = pp.id
    AND m.status IN ('pending', 'viewed')
  ) < 5
```

Note: Geographic radius matching is simplified in V1 — city-level. Neighborhood/radius matching is a V1.1 enhancement.

---

## Step 2: Scoring Model

Each eligible provider receives a **composite score** from 0–100 based on weighted signals.

### Scoring Formula

```
total_score = (
  response_rate_score   * 0.30  +   -- 30% weight
  quality_score         * 0.25  +   -- 25% weight
  recency_score         * 0.20  +   -- 20% weight
  urgency_bonus         * 0.15  +   -- 15% weight
  completeness_score    * 0.10       -- 10% weight
)
```

### Signal Definitions

#### 1. Response Rate Score (30%)
Measures how reliably the provider responds to leads.

```
response_rate_score = provider.response_rate  (already 0–100)

If response_rate is NULL (new provider, no history):
  response_rate_score = 60  -- new provider boost (encourage early adopters)
```

#### 2. Quality Score (25%)
Composite of rating average and completed jobs.

```
if review_count >= 3:
  quality_score = (avg_rating / 5.0) * 100 * (1 + log(review_count) * 0.1)
  quality_score = min(quality_score, 100)  -- cap at 100

if review_count < 3:
  quality_score = 50  -- neutral pending score
  (gives new providers a fair chance while not over-exposing unproven providers)
```

#### 3. Recency Score (20%)
Measures how recently the provider was active (last login or last response).

```
hours_since_active = NOW() - provider.last_active_at

if hours_since_active <= 24:   recency_score = 100
if hours_since_active <= 72:   recency_score = 75
if hours_since_active <= 168:  recency_score = 50  (1 week)
if hours_since_active <= 720:  recency_score = 25  (30 days)
if hours_since_active > 720:   recency_score = 0
if last_active_at IS NULL:     recency_score = 40  (new provider)
```

#### 4. Urgency Bonus (15%)
Providers who have demonstrated fast response get a boost for urgent requests.

```
if request.urgency = 'urgent':
  if avg_response_hours <= 2:    urgency_score = 100
  if avg_response_hours <= 6:    urgency_score = 75
  if avg_response_hours <= 24:   urgency_score = 50
  if avg_response_hours > 24:    urgency_score = 25
  if avg_response_hours IS NULL: urgency_score = 60  (new provider)

if request.urgency != 'urgent':
  urgency_score = 50  (neutral — urgency bonus is flat for non-urgent)
```

#### 5. Completeness Score (10%)
Providers with complete, rich profiles get a small boost.

```
completeness_score = 0
+ 20 if bio is not null and len(bio) > 50
+ 20 if avatar is uploaded
+ 30 if has >= 3 work photos
+ 30 if whatsapp_number is set
```

---

## Step 3: Workload Guard

Before finalizing selection, verify each scored provider has not already been overwhelmed:

```
MAX_ACTIVE_UNRESPONDED_LEADS = 5

For each candidate in scored list:
  active_unresponded = count of matches WHERE provider_id = candidate.id
    AND status IN ('pending', 'viewed')
    AND created_at > NOW() - INTERVAL '72 hours'

  if active_unresponded >= MAX_ACTIVE_UNRESPONDED_LEADS:
    EXCLUDE from results
```

This prevents drowning active providers while ensuring we don't show customers providers who can't respond promptly.

---

## Step 4: Select Top 3

```
Sort eligible, scored, uncapped providers by total_score DESC
Take top 3
```

If fewer than 3 providers pass eligibility: return however many pass.
If 0 providers pass: return empty match list + set request status to `open` (with "seeking" flag).

---

## Step 5: Create Match Records

```sql
INSERT INTO matches (request_id, provider_id, match_score, status)
VALUES
  (:request_id, :provider_1_id, :score_1, 'pending'),
  (:request_id, :provider_2_id, :score_2, 'pending'),
  (:request_id, :provider_3_id, :score_3, 'pending');

UPDATE service_requests
SET status = 'matched'
WHERE id = :request_id;
```

---

## Step 6: Notify Providers

For each match created:
1. Create `notification` record of type `new_lead`
2. Send SMS via Twilio: "Nouvelle demande: [Category] à [Neighborhood]. Voir les détails: [short_link]"
3. Supabase Realtime pushes in-app notification to provider if online

---

## Edge Cases

### No matches found
```
Result: 0 matches
Request status remains: 'open' with a 'seeking' sub-status flag
Customer sees: "Nous cherchons des artisans pour votre demande"
Admin notified: daily digest of "0 match" requests for manual intervention
```

### Provider becomes unverified after matching
```
On provider suspension/restriction:
  All pending matches for that provider → status: 'declined' (system)
  Request re-enters matching pool if < 3 valid matches remain
  (Handled by a daily re-matching job for unresolved requests — V1.1)
```

### Tie-breaking
```
When two providers have equal total_score:
  Use created_at of provider_profile ASC (earlier verified provider first)
  This rewards early adopters
```

---

## Admin Override

Admins can manually:
1. Add a specific provider to a request's match pool (even if < top 3)
2. Remove a provider from a match
3. Re-trigger matching for a request

All admin match actions are logged in `admin_actions`.

---

## Performance Notes

**V1 scale estimate:** Casablanca launch → ~500 providers, ~50 requests/day
**Query performance:** With indexes, the eligibility query over 500 providers executes in < 100ms. Scoring in application layer over 20–50 eligible candidates is < 50ms.

**Total matching time target:** < 500ms for eligibility + scoring + record creation.

---

## Future Extensibility (V2+)

| Enhancement | Trigger |
|---|---|
| Geographic proximity scoring | When neighborhoods are structured in DB |
| ML score augmentation | When 1,000+ completed jobs collected |
| Category-level specialty weighting | When category depth increases |
| Real-time availability signals | When providers can set daily availability |
| Bid-based lead pricing | When monetization data suggests it |
| Provider language preference matching | When bilingual demand segments identified |
