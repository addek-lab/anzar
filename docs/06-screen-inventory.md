# Screen Inventory

Complete list of all screens required for MVP. Each screen includes: purpose, key elements, states, and mobile notes.

---

## PUBLIC / MARKETING

### SCR-PUB-01: Landing Page
**Purpose:** Convert visitors to sign up (customer or provider)
**Key elements:**
- Hero: headline + CTA "Trouver un artisan" / "أوجد حرفيًا"
- Trust proof: 3 key trust statements (verified providers, capped matches, rated reviews)
- How it works: 3-step visual (Post → Match → Hire)
- Category icons: 6 service categories
- Testimonials: 3 real reviews (initially placeholder)
- Provider CTA: "Vous êtes artisan? Rejoignez-nous"
- Language switcher in nav
- Footer: links, legal, language

**States:** Default only
**Mobile notes:** Hero CTA must be immediately thumb-accessible below fold

---

### SCR-PUB-02: How It Works
**Key elements:** Step-by-step illustrated flow for customers and providers separately

---

### SCR-PUB-03: Category Overview
**Key elements:** All 6 categories with descriptions, example jobs, typical pricing range (qualitative)

---

### SCR-PUB-04: Trust & Verification Page
**Key elements:** Explains verification process, badge meaning, review system

---

### SCR-PUB-05: Provider Landing Page
**Key elements:** Benefits for tradespeople, how leads work, how to sign up, testimonials from providers

---

## AUTH

### SCR-AUTH-01: Language Selection
**Purpose:** First-time language selection
**Key elements:**
- Two large buttons: "Français" / "العربية"
- Anzar logo
- No other clutter

**States:** Default
**Notes:** Shown once; stored in localStorage immediately

---

### SCR-AUTH-02: Phone Login
**Key elements:**
- Anzar logo
- Headline: "Entrez votre numéro de téléphone"
- Phone input (Moroccan format helper: +212)
- "Continuer" CTA
- "En continuant, vous acceptez nos CGU" below

**States:**
- Default
- Loading (OTP sending)
- Error: invalid format
- Error: rate limited ("Trop de tentatives, réessayez dans 5 minutes")

---

### SCR-AUTH-03: OTP Verification
**Key elements:**
- 6-digit OTP input (auto-advance)
- "Renvoyer le code" (enabled after 60s countdown)
- Back to phone edit
- Security note

**States:**
- Default
- Checking
- Error: wrong OTP
- Error: expired OTP
- Locked: too many attempts

---

### SCR-AUTH-04: Account Type Selection
**Key elements:**
- Two cards: Customer / Provider with icon and short description
- "Je cherche un artisan" vs "Je suis artisan"

---

## CUSTOMER APP

### SCR-CUST-01: Customer Home
**Key elements:**
- Welcome message with name
- Large CTA: "Créer une demande"
- My active requests (if any) — summary cards
- Recent notifications
- Help shortcut

**States:**
- First-time empty
- Active requests shown
- No active requests

---

### SCR-CUST-02: Request Creation — Step 1: Category
**Key elements:**
- Progress indicator (1/5)
- Grid of 6 category cards (icon + label FR/AR)
- Selected state highlighted
- "Continuer" CTA (disabled until selection)

---

### SCR-CUST-03: Request Creation — Step 2: Description
**Key elements:**
- Progress indicator (2/5)
- Category reminder chip
- Text area: placeholder "Décrivez le problème..."
- Character counter (min 10 / max 500)
- Back button

---

### SCR-CUST-04: Request Creation — Step 3: Photos
**Key elements:**
- Progress indicator (3/5)
- Photo grid (empty slots)
- Upload button (camera + gallery options)
- Thumbnails with delete option
- "Passer" (skip) link

**States:**
- Empty (no photos yet)
- Uploading (progress overlay on thumbnail)
- Upload error (retry option)
- Full (5 of 5 uploaded)

---

### SCR-CUST-05: Request Creation — Step 4: Location
**Key elements:**
- Progress indicator (4/5)
- City: pre-selected "Casablanca" (V1)
- Neighborhood: optional text input with GPS suggestion
- Map placeholder (optional V1.1)

---

### SCR-CUST-06: Request Creation — Step 5: Urgency + Budget
**Key elements:**
- Progress indicator (5/5)
- 3 urgency option cards (icon + label)
- Optional budget input (number, MAD)
- "Soumettre ma demande" CTA

---

### SCR-CUST-07: Request Submitted Confirmation
**Key elements:**
- Success illustration
- "Votre demande a été envoyée"
- Estimated response time
- "Suivre ma demande" CTA → request detail

---

### SCR-CUST-08: Request Detail
**Key elements:**
- Request summary (category, description, photos, location, urgency)
- Status badge (Open / Matched / Hired / Completed / Expired)
- Matched providers section (0–3 cards)
- Provider card: avatar, name, rating, verified badge, response time, "Voir le profil" link

**States:**
- Open: matching in progress
- Matched: show 1–3 provider cards
- No matches: empty state with support CTA
- Hired: hired provider card highlighted
- Completed: completion timestamp + review CTA
- Expired: expired notice

---

### SCR-CUST-09: Provider Profile (Customer View)
**Key elements:**
- Cover photo / avatar
- Name, trade(s), city
- Verified badge (if applicable)
- Rating: stars + count
- Stats: response rate, completed jobs, response time
- Bio
- Work gallery (scrollable)
- Reviews section
- Contact bar (sticky bottom): Chat | Call | WhatsApp

**States:**
- Full profile
- Loading skeleton
- No work photos empty state

---

### SCR-CUST-10: My Requests List
**Key elements:**
- Tabs: Active / Completed / Expired
- Request cards: category icon, description snippet, status badge, date

**States:**
- Empty (first time)
- Active requests
- Filter/search (V1.1)

---

### SCR-CUST-11: Chat Thread (Customer ↔ Provider)
**Key elements:**
- Messages (text bubbles)
- Offer card (special format): price, date, message, Accept / Decline buttons
- Input bar with send button
- Provider name + status in header
- Back to request

**States:**
- Loading
- Empty (first message prompt)
- Offer received (special offer card)
- Offer accepted / declined (locked state)

---

### SCR-CUST-12: Notifications
**Key elements:**
- List of notifications with time
- Types: new match, new message, offer received, job completed, review prompt

---

### SCR-CUST-13: Customer Profile + Settings
**Key elements:**
- Display name, phone (read-only)
- Language selector
- Logout
- Help link
- Delete account (V1.1)

---

### SCR-CUST-14: Rate & Review
**Key elements:**
- Provider summary card
- 5-star selector (required)
- Text area (optional, 300 chars)
- Submit CTA

**States:**
- Default
- Submitting
- Success: "Votre avis a été envoyé"
- Already reviewed: read-only view

---

## PROVIDER APP

### SCR-PRO-01: Provider Onboarding — Step 1: Basic Info
**Key elements:** Full name, WhatsApp number, city

### SCR-PRO-02: Provider Onboarding — Step 2: Trades
**Key elements:** Multi-select from 6 trade cards

### SCR-PRO-03: Provider Onboarding — Step 3: Service Area
**Key elements:** City (Casablanca V1), radius selector (5/10/20km/city-wide)

### SCR-PRO-04: Provider Onboarding — Step 4: Bio
**Key elements:** Text area, examples shown, 300 chars max

### SCR-PRO-05: Provider Onboarding — Step 5: Work Photos
**Key elements:** Photo upload grid, up to 5, optional

### SCR-PRO-06: Provider Onboarding — Step 6: Verification Documents
**Key elements:**
- CIN or business registration upload
- Instructions what is accepted
- Privacy assurance note

### SCR-PRO-07: Provider Onboarding — Step 7: Review + Submit
**Key elements:** Summary of all info, submit CTA

### SCR-PRO-08: Pending Verification Screen
**Key elements:**
- Status: "En cours de vérification"
- What happens next explanation
- Estimated time (24–48h)
- How to be notified

**States:**
- Pending
- Approved (redirect to lead inbox)
- Rejected (with reason + resubmit CTA)

---

### SCR-PRO-09: Lead Inbox
**Key elements:**
- New leads (sorted by urgency then date)
- Lead card: category, neighborhood, urgency badge, time received
- Responded leads section

**States:**
- Empty (no new leads)
- New leads available
- All leads responded

---

### SCR-PRO-10: Lead Detail
**Key elements:**
- Category, description, photos (if any)
- Location (neighborhood)
- Urgency badge
- Customer anonymized ("Client à Casablanca")
- "Répondre" CTA → opens offer form
- "Décliner" CTA

**States:**
- Unresponded (respond/decline)
- Responded (offer sent)
- Declined
- Expired (48h+ without customer activity)

---

### SCR-PRO-11: Offer Form
**Key elements:**
- Price input (MAD, number)
- Availability date picker
- Message text area (optional, 300 chars)
- Preview of how offer will appear
- "Envoyer l'offre" CTA

---

### SCR-PRO-12: Active Jobs
**Key elements:**
- Job cards: customer pseudonym, category, status
- Job status: Hired / In Progress / Completed
- Mark In Progress / Mark Complete CTA

---

### SCR-PRO-13: Completed Jobs
**Key elements:**
- List of past jobs with dates and review received

---

### SCR-PRO-14: Chat Thread (Provider ↔ Customer)
**Key elements:** Same as customer chat, provider perspective

---

### SCR-PRO-15: My Profile (Edit)
**Key elements:**
- All editable fields
- Work photo management
- Trade update (triggers no re-verification)
- Document update (triggers re-verification)

---

### SCR-PRO-16: Performance Panel
**Key elements:**
- Response rate (%)
- Average response time
- Completed jobs count
- Average review score
- Active leads count

---

## ADMIN APP

### SCR-ADMIN-01: Admin Login
**Key elements:** Email + password (admin uses different auth than OTP)

### SCR-ADMIN-02: Admin Dashboard
**Key elements:**
- Daily requests created
- Active verified providers
- Pending verification queue count
- Open disputes
- Recent activity feed

### SCR-ADMIN-03: Provider Verification Queue
**Key elements:**
- Table: name, trade, submission date, status
- Filter: pending / approved / rejected
- Click → provider detail

### SCR-ADMIN-04: Provider Detail (Admin View)
**Key elements:**
- All profile data
- Uploaded documents (viewable)
- Verification history
- Approve (with optional note) / Reject (with reason) buttons
- Account actions: suspend / restrict

### SCR-ADMIN-05: User Management
**Key elements:**
- Search by phone, name
- Table: name, type, status, registration date
- Click → user detail
- Actions: suspend, reinstate, flag

### SCR-ADMIN-06: Request Management
**Key elements:**
- Table: category, city, status, date
- Filter/search
- Click → request detail with match results visible

### SCR-ADMIN-07: Review Moderation Queue
**Key elements:**
- Pending reviews (awaiting publication)
- Flagged reviews
- Actions: approve, reject, request edit

### SCR-ADMIN-08: Taxonomy Management
**Key elements:**
- Categories: name (FR/AR), icon, active toggle, sort order
- Synonyms: category + synonym list (FR/AR/Darija)
- Cities + Neighborhoods management

### SCR-ADMIN-09: Disputes + Complaints Queue
**Key elements:**
- List of reported items (users, reviews, messages)
- Reporter info, reported item, notes
- Actions: dismiss, warn, suspend, escalate

### SCR-ADMIN-10: Fraud / Risk Dashboard
**Key elements:**
- Accounts with multiple OTP requests
- Accounts with multiple reports
- Duplicate phone detection
- Unusual review patterns

### SCR-ADMIN-11: Audit Log
**Key elements:**
- Table: timestamp, admin, action, target, notes
- Filterable by action type and date range
