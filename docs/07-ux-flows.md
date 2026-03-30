# UX Flow Descriptions

## UX Principles Applied

1. **One primary action per screen** — never make users choose between two equally important actions
2. **Progressive disclosure** — gather information step by step, never dump a long form
3. **Confidence signals throughout** — trust cues, progress indicators, and clear feedback at every step
4. **Thumb-zone priority** — primary CTAs live in the bottom 40% of the screen
5. **Localization-first** — every flow is designed to work in both LTR and RTL without layout reengineering
6. **Fail gracefully** — every error state has a recovery path

---

## FLOW-01: Customer — First-Time Onboarding to First Request

```
App Launch
    ↓
Language Selection (SCR-AUTH-01)
    → User selects "Français" or "العربية"
    → Stored immediately
    ↓
Phone Login (SCR-AUTH-02)
    → Enters phone number
    → Validation: Moroccan format, length
    ↓
OTP Verification (SCR-AUTH-03)
    → 6-digit SMS code
    → Auto-advance on last digit
    ↓
Account Type Selection (SCR-AUTH-04)
    → Selects "Je cherche un artisan"
    ↓
Customer Home (SCR-CUST-01)
    → First-time: prompt "Créer votre première demande"
    ↓
[User taps "Créer une demande"]
    ↓
Request Creation Wizard (SCR-CUST-02 through 06)
    → Category → Description → Photos → Location → Urgency
    ↓
Request Submitted (SCR-CUST-07)
    → Success state
    → "Voir les artisans" CTA → Request Detail
    ↓
Request Detail (SCR-CUST-08)
    → Matches shown within seconds (synchronous matching)
    → Up to 3 provider cards
    ↓
[User taps provider card]
    ↓
Provider Profile (SCR-CUST-09)
    → Reviews trust signals
    ↓
[User taps "Chat"]
    ↓
Chat Thread (SCR-CUST-11)
    → Types message OR waits for provider offer
    ↓
[Provider sends offer]
    ↓
Offer Card appears in chat
    → User taps "Accepter"
    ↓
Job status → Hired
    ↓
[Job completed in real life]
    ↓
[User taps "Marquer comme terminé" on request detail]
    ↓
Rate & Review (SCR-CUST-14)
    → 5-star + optional text
    → Submitted → Success
```

**Total interactions for first request to provider contact: ~12 taps**
**Total time target: < 4 minutes**

---

## FLOW-02: Returning Customer — Post-Request Check-In

```
App opens → Auth check (silent)
    ↓
Customer Home
    → Active request card visible with "2 nouveaux messages"
    ↓
[Taps notification or request card]
    ↓
Request Detail
    → Provider has sent offer
    ↓
Chat Thread
    → Reads offer, accepts
    ↓
Job status: Hired
```

**Total interactions: 4 taps**
**Key principle:** Returning users skip all forms — they land directly in their context

---

## FLOW-03: Provider — First-Time Onboarding

```
App Launch
    ↓
Language Selection
    ↓
Phone Login + OTP
    ↓
Account Type: "Je suis artisan"
    ↓
Onboarding Step 1: Basic Info
    → Name, WhatsApp number, city
    ↓
Onboarding Step 2: Trades
    → Select 1+ from 6 categories
    ↓
Onboarding Step 3: Service Area
    → Service radius selector
    ↓
Onboarding Step 4: Bio (optional but encouraged)
    ↓
Onboarding Step 5: Work Photos (optional)
    ↓
Onboarding Step 6: Verification Documents
    → Upload CIN or business registration
    → Guidance text on what to upload
    ↓
Review + Submit
    ↓
Pending Verification Screen (SCR-PRO-08)
    → "Votre profil est en cours de vérification"
    → Provider cannot receive leads in this state
    → SMS sent when decision made
```

**Drop-off risk points:**
- Document upload (most friction) → mitigate with clear instructions and examples
- Waiting period → set clear expectations ("within 24 hours")

---

## FLOW-04: Provider — Receiving and Responding to a Lead

```
Provider receives SMS: "Nouvelle demande: Plomberie à Maarif"
    ↓
Taps link → opens app → auth check
    ↓
Lead Inbox (SCR-PRO-09)
    → New lead highlighted at top
    ↓
Lead Detail (SCR-PRO-10)
    → Reads: description, photos, location, urgency
    → Customer is anonymized at this stage
    ↓
[Decision point]
    → Tap "Répondre" → Offer Form (SCR-PRO-11)
    → Tap "Décliner" → Lead archived, confirm decline reason (optional)
    ↓
Offer Form
    → Enter price (MAD)
    → Select availability date
    → Optional message
    → "Envoyer l'offre"
    ↓
Chat Thread opens
    → Offer sent as special card
    → Customer phone/WhatsApp revealed AFTER offer sent
    ↓
Customer replies / accepts
    ↓
Job status: Hired
    ↓
Provider updates job status: "En cours" → "Terminé"
```

**Key design decision:** Customer phone number is revealed ONLY after provider sends an offer. This prevents free lead harvesting (a major abuse vector on open marketplaces).

---

## FLOW-05: Admin — Provider Verification

```
Admin receives daily queue notification (or checks dashboard)
    ↓
Admin Login (email/password, separate from OTP)
    ↓
Admin Dashboard
    → "3 vérifications en attente"
    ↓
Provider Verification Queue (SCR-ADMIN-03)
    → Sorted by submission date (oldest first)
    ↓
[Admin clicks first pending provider]
    ↓
Provider Detail (SCR-ADMIN-04)
    → Reviews: name, phone, trade, city, bio, photos, documents
    → Opens document image in new tab to verify
    ↓
[Decision: Approve]
    → Click "Approuver"
    → Optional note field
    → Confirm → Provider status: verified
    → Automatic SMS to provider: "Votre profil a été vérifié"
    → Provider enters matching pool
    ↓
OR [Decision: Reject]
    → Click "Rejeter"
    → Select reason from list:
      - "Document illisible"
      - "Document incomplet"
      - "Informations non concordantes"
      - "Profil inapproprié"
      - "Autre" (with note)
    → Provider receives SMS with reason
    → Provider can resubmit
    ↓
Action logged to audit_log
```

**SLA target:** Admin should be able to process 10 verifications in under 20 minutes. The queue is designed for efficiency, not bureaucracy.

---

## FLOW-06: Error States and Recovery

### OTP Failure Recovery
```
OTP entered incorrectly
    ↓
Error: "Code incorrect, 2 tentatives restantes"
    ↓
After 3 failures:
    ↓
Lock screen: "Trop de tentatives. Réessayez dans 5 minutes."
    → Countdown timer shown
    → "Renvoyer le code" button appears after 60 seconds
```

### No Matches Found
```
Request submitted → matching runs → 0 results
    ↓
Request Detail shows:
    "Aucun artisan disponible dans votre zone pour l'instant."
    "Nous cherchons des artisans pour votre région."
    [Notifier moi quand un artisan est disponible] ← toggle
    [Contacter le support] ← opens WhatsApp to ops team
```

### Upload Failure
```
User taps upload → upload fails (network error)
    ↓
Thumbnail shows error state with retry icon
    ↓
Tapping retry icon re-attempts upload
    ↓
If fails 3 times:
    → "Problème d'upload. Continuez sans photo ou réessayez plus tard."
    → Allow continuing without photos
```

### Offline/Network Loss During Request Creation
```
User loses connection mid-wizard
    ↓
Draft auto-saved locally (last 30s auto-save)
    ↓
Network error banner shown at top
    ↓
On reconnection: banner disappears
    ↓
On app re-open: "Vous avez une demande non soumise. Continuer?"
```

---

## FLOW-07: RTL Flow Consistency (Arabic)

When Arabic is selected, ALL flows follow the same structure with these RTL-specific adaptations:

- Progress stepper flows right to left
- Back button appears on right side, forward on left
- Text input alignment is right
- Chat bubbles: sender on right, receiver on left (maintained regardless of locale)
- Number formatting: Arabic-Indic numerals optional (default Western for prices/numbers)
- All icons that imply direction (arrows, chevrons) are mirrored
- Bottom navigation labels right-aligned

**Design rule:** No RTL layout should require a separate component. CSS `logical properties` and `dir="rtl"` inheritance must handle all directional changes.
