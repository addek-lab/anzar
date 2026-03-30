# Open Questions and Decisions Needed

## Priority: Must Decide Before Build Starts

### OQ-01: SMS / OTP Provider
**Question:** Which SMS provider to use for Moroccan numbers?
**Options:**
- **Twilio** — global, well-documented, works in Morocco, ~$0.05/SMS
- **Infobip** — stronger MENA coverage, local routing agreements
- **Orange Business / local carrier** — potentially better delivery rates in Morocco

**Recommendation:** Start with Twilio (Supabase Auth native integration). If delivery rate < 90%, switch to Infobip.

**Decision needed from:** Technical team
**Deadline:** Before Sprint 1

---

### OQ-02: Legal Entity
**Question:** Does Anzar need a registered Moroccan legal entity before launch?
**Why it matters:** Privacy policy, CGU, tax obligations, future payment processing

**Recommendation:** At minimum, register as an auto-entrepreneur (personne physique) or create a SARL before public launch. Consult a Moroccan lawyer.

**Decision needed from:** Founders
**Deadline:** Before public launch (can soft launch without)

---

### OQ-03: Data Residency
**Question:** Where should user data be stored — EU region or a local/MENA region?
**Morocco Law 09-08 note:** International transfer of personal data requires user consent if not within Morocco.

**Recommendation:** Supabase EU West (Paris region) is acceptable if privacy policy discloses EU storage. Confirm with legal counsel. Paris region also gives the best latency to Morocco.

**Decision needed from:** Founders + legal
**Deadline:** Before public launch

---

### OQ-04: WhatsApp Business Integration Depth
**Question:** Should the platform use WhatsApp Business API for notifications, or just deep-link to WhatsApp?

**Current plan (deep link):** Provider's WhatsApp number opens `wa.me/+212...` — simple, no API needed.
**Future option (Business API):** Platform sends automated WhatsApp notifications. Requires Meta Business verification.

**Recommendation:** Start with deep links (V1). Business API adds meta verification overhead. Revisit in V1.1.

**Decision needed from:** PM
**Deadline:** Sprint 5 (before chat/contact feature build)

---

## Priority: Must Decide in Sprint 1–2

### OQ-05: Neighborhood Data Source
**Question:** Where do we get Casablanca neighborhood data (Arabic + French names)?
**Options:**
- Manual entry (we type them in)
- OpenStreetMap data extraction
- Geocoding API (Google Maps)

**Recommendation:** Manual entry of the top 30–40 Casablanca neighborhoods in the seed file. This gives full control over names and Arabic translations. Total work: 2 hours.

---

### OQ-06: Budget Field Type
**Question:** Should the budget field be a number input (MAD) or a range selector (Low/Medium/High) or a text field?

**Recommendation:** Free-text field in V1 ("Budget flexible", "~500 MAD", etc.). A number creates anchoring effects that may harm conversion. Revisit with data.

---

### OQ-07: Provider Trade Limit
**Question:** Should a provider be able to claim all 6 trades, or should there be a limit?

**Recommendation:** Allow up to 3 trades maximum. Providers who claim all trades look untrustworthy and dilute their specialization score. Admin can override if a genuine multi-trade business applies.

---

## Priority: Must Decide Before Launch

### OQ-08: Review Auto-Approval Timing
**Question:** How long before unmoderated reviews are auto-published?

**Option A:** 24 hours auto-approve
**Option B:** 48 hours auto-approve
**Option C:** All reviews require explicit admin approval

**Recommendation:** 48 hours auto-approve for V1. Admin team is small — they need time to review. At higher volume, move to ML-assisted auto-approval.

---

### OQ-09: Request Expiry Duration
**Question:** When does a request expire with no activity?

**Current assumption:** 30 days
**Consideration:** Some requests (renovation planning) may have a longer natural timeline. But keeping expired requests in the UI creates confusion.

**Recommendation:** 30 days for urgent/soon urgency, 60 days for flexible urgency. Auto-expire sends a notification at day 25/55: "Votre demande expire bientôt."

---

### OQ-10: Customer Anonymization Level
**Question:** What information about the customer is visible to a provider BEFORE they send an offer?

**Current plan:** Customer is anonymized (no name, no phone, only "Client à [neighborhood]")
**After offer accepted:** Customer's WhatsApp/phone revealed

**Question:** Should we reveal the customer's first name at the lead detail stage?
**Recommendation:** Yes — show first name only (not phone, not full name) at lead detail stage. Makes the interaction feel more human and increases response rate. Phone revealed after offer acceptance only.

---

### OQ-11: Duplicate Request Prevention
**Question:** Should we prevent a customer from submitting the same category request twice within X hours?

**Recommendation:** Soft warning only ("Vous avez déjà une demande de plomberie active. Continuer quand même?"). Do not hard-block — the customer may have two separate plumbing issues.

---

## Long-Term Open Questions (V2+)

### OQ-12: Payment Processing Partner
**Question:** Which payment gateway to use for Morocco in V2?
**Options:**
- **CMI (Centre Monétique Interbancaire)** — local, requires bank account and legal entity in Morocco
- **Stripe** — not officially available in Morocco but accessible via third-party workarounds
- **PayPal** — limited functionality in Morocco
- **HPS / Maroc Telecommerce** — Moroccan payment processing specialist

**Recommendation:** CMI is the correct long-term answer for a Moroccan-registered business. Research CMI's API and requirements in V2 planning phase.

---

### OQ-13: Native App Strategy
**Question:** React Native, Flutter, or web-only PWA forever?

**Recommendation:** PWA for V1 and V1.1. If:
- Daily active users exceed 5,000
- Push notification opt-in rate on PWA is < 30%
- Customers request "install the app" more than 3x/week

...then invest in React Native (code-share with existing Next.js team easier than Flutter).

---

### OQ-14: Provider Certification / Licensing Verification
**Question:** Should we verify professional credentials (electrician license, plumber certification) in V2?

**Context:** Morocco has a system of artisan cards (Carte d'Artisan) issued by the Office de la Formation Professionnelle. Verification of these cards would significantly increase platform trust.

**Recommendation:** Build towards this in V2. V1 verifies identity (CIN) only. Artisan card verification adds a premium trust tier.
