# Epics and User Stories

## Epic Structure

| Epic | ID | Description |
|---|---|---|
| Authentication | EPIC-01 | Phone/OTP auth, session, account type |
| Request Creation | EPIC-02 | Customer request wizard and submission |
| Matching | EPIC-03 | Engine, notifications, match display |
| Provider Profiles | EPIC-04 | Profile creation, display, trust signals |
| Communication | EPIC-05 | Chat, offers, call/WhatsApp |
| Job Lifecycle | EPIC-06 | Status transitions, tracking |
| Reviews | EPIC-07 | Rating, review, moderation |
| Provider Onboarding | EPIC-08 | Registration, verification submission |
| Admin Core | EPIC-09 | Verification, moderation, user mgmt |
| Localization | EPIC-10 | i18n, RTL, language selector |
| Infrastructure | EPIC-11 | Deployment, monitoring, CI/CD |

---

## EPIC-01: Authentication

### STORY-01-01
**As a** new user
**I want to** enter my phone number and receive an OTP
**So that** I can create an account without a password

**Acceptance Criteria:**
- [ ] Phone input accepts Moroccan format (0612345678) and normalizes to E.164 (+212612345678)
- [ ] OTP SMS delivered within 30 seconds
- [ ] OTP expires after 10 minutes
- [ ] Invalid OTP shows clear error message in selected language
- [ ] After 3 failed attempts, input is locked for 5 minutes with countdown timer

### STORY-01-02
**As a** new user after OTP verification
**I want to** choose whether I am a customer or a service provider
**So that** I land on the right onboarding experience

**Acceptance Criteria:**
- [ ] Two clear options presented: "Je cherche un artisan" / "أبحث عن حرفي" (Customer) and "Je suis artisan" / "أنا حرفي" (Provider)
- [ ] Selection persists in user profile
- [ ] Customer lands on request creation or home
- [ ] Provider lands on onboarding wizard

### STORY-01-03
**As a** returning user
**I want to** be remembered on my device
**So that** I don't have to log in every time

**Acceptance Criteria:**
- [ ] Session valid for 7 days with refresh
- [ ] Refresh happens silently in background
- [ ] If session expires, user is redirected to login with message "Session expirée"
- [ ] Works on mobile browser after closing tab

### STORY-01-04
**As a** user
**I want to** select my preferred language (French or Arabic) on first launch
**So that** the app is displayed in my language

**Acceptance Criteria:**
- [ ] Language selection screen shown before or during first login
- [ ] Selection persists in localStorage and user profile
- [ ] Switching language re-renders app with correct direction (LTR/RTL)
- [ ] Language can be changed later in settings

---

## EPIC-02: Request Creation

### STORY-02-01
**As a** customer
**I want to** select a service category from a visual list
**So that** the platform knows what kind of help I need

**Acceptance Criteria:**
- [ ] 6 categories displayed as cards with icon + translated label
- [ ] Icons are clear and universally understood
- [ ] Selected state is visually obvious
- [ ] Only one category selectable in V1

### STORY-02-02
**As a** customer
**I want to** describe my problem in my own words
**So that** providers understand what the job is

**Acceptance Criteria:**
- [ ] Text area with 10–500 character limit
- [ ] Character count shown
- [ ] Placeholder text in selected language (helpful example)
- [ ] Field validates before advancing to next step

### STORY-02-03
**As a** customer
**I want to** upload photos of the problem
**So that** providers can assess the work before responding

**Acceptance Criteria:**
- [ ] Up to 5 images
- [ ] Accepted: JPEG, PNG, HEIC
- [ ] Max 5MB per image
- [ ] Preview shown after upload
- [ ] Progress indicator during upload
- [ ] Images converted to WebP server-side
- [ ] Upload error handled gracefully with retry option
- [ ] Photo upload is optional (skip allowed)

### STORY-02-04
**As a** customer
**I want to** specify my location
**So that** only nearby providers are matched

**Acceptance Criteria:**
- [ ] City defaults to Casablanca (V1 only)
- [ ] Neighborhood is optional free-text in V1
- [ ] Optional: use device GPS to auto-fill neighborhood (with permission)
- [ ] Location can be manually entered

### STORY-02-05
**As a** customer
**I want to** indicate how urgently I need the service
**So that** providers know my timeline

**Acceptance Criteria:**
- [ ] 3 options: Urgent (today), Bientôt (this week), Flexible
- [ ] Displayed in both languages based on locale
- [ ] Selection required before submitting

### STORY-02-06
**As a** customer
**I want to** submit my request and see a confirmation
**So that** I know it was received and providers will be notified

**Acceptance Criteria:**
- [ ] Submit button active only when required fields complete
- [ ] Loading state shown during submission
- [ ] Confirmation screen shows: request summary, "Vous recevrez une réponse sous 2h" / "ستتلقى ردًا خلال ساعتين"
- [ ] Push/SMS notification sent when first provider responds

---

## EPIC-03: Matching

### STORY-03-01
**As a** customer
**I want to** see up to 3 matched providers for my request
**So that** I can compare and choose the best option

**Acceptance Criteria:**
- [ ] List shows 1–3 providers (fewer if < 3 available)
- [ ] Each card shows: name, avatar, rating, verified badge, completed jobs, response time estimate
- [ ] Providers ranked by match score (highest first)
- [ ] If 0 providers match, empty state with explanation and admin contact option
- [ ] List accessible within 2 seconds of match completion

### STORY-03-02
**As a** matched provider
**I want to** receive a notification for a new lead
**So that** I can respond quickly

**Acceptance Criteria:**
- [ ] In-app notification created immediately on match
- [ ] SMS notification sent as fallback
- [ ] Notification shows: category, neighborhood, urgency
- [ ] Tapping notification opens lead detail screen

---

## EPIC-04: Provider Profiles

### STORY-04-01
**As a** customer
**I want to** view a provider's full profile
**So that** I can decide whether to trust them with my job

**Acceptance Criteria:**
- [ ] Profile shows all trust signals (see PRD PROF-01 through PROF-13)
- [ ] Work gallery is scrollable carousel
- [ ] Reviews section shows last 5 reviews with option to expand
- [ ] Contact buttons (chat, call, WhatsApp) are clearly visible
- [ ] Page is shareable URL

### STORY-04-02
**As a** provider
**I want to** edit my profile at any time
**So that** I can keep my information accurate and attractive

**Acceptance Criteria:**
- [ ] Provider can edit: name, bio, trades, service radius, work photos, WhatsApp number
- [ ] Changes to documents require re-verification
- [ ] Photo additions to gallery don't require re-verification
- [ ] Edited profile saved immediately

---

## EPIC-05: Communication

### STORY-05-01
**As a** customer
**I want to** chat with a matched provider inside the app
**So that** I can discuss the job and receive an offer

**Acceptance Criteria:**
- [ ] Chat thread visible to both parties
- [ ] Messages delivered in < 1 second via WebSocket
- [ ] Unread indicator shown in navigation
- [ ] Chat persists across sessions

### STORY-05-02
**As a** provider
**I want to** send a structured offer to a customer
**So that** they can see my price and availability clearly

**Acceptance Criteria:**
- [ ] Offer form: price (number, MAD), available date (date picker), message (text)
- [ ] Offer displayed as a distinct card in the chat thread
- [ ] Customer sees "Accept" and "Decline" buttons on offer card
- [ ] Once accepted, offer is locked and job moves to "Hired" state

---

## EPIC-06: Job Lifecycle

### STORY-06-01
**As a** customer
**I want to** mark a provider as selected
**So that** they know I chose them and we can proceed

**Acceptance Criteria:**
- [ ] "Select this provider" button visible in provider chat/offer thread
- [ ] On selection: job status changes to "Hired", other matched providers notified (optional V1.1)
- [ ] Both parties see "Provider selected" status

### STORY-06-02
**As a** customer or provider
**I want to** mark the job as completed
**So that** the platform can trigger the rating flow

**Acceptance Criteria:**
- [ ] Both sides can trigger "mark complete"
- [ ] If one side marks complete and the other hasn't within 48h, system auto-completes
- [ ] Rating prompt shown after completion

---

## EPIC-07: Reviews

### STORY-07-01
**As a** customer
**I want to** leave a rating and review after a job is completed
**So that** I can help future customers make decisions

**Acceptance Criteria:**
- [ ] 1–5 star selector required
- [ ] Text review optional, max 300 characters
- [ ] Review submitted once only
- [ ] Review queued for moderation before publishing
- [ ] Confirmation shown after submission

---

## EPIC-08: Provider Onboarding

### STORY-08-01
**As a** new provider
**I want to** complete my profile and submit for verification
**So that** I can start receiving leads

**Acceptance Criteria:**
- [ ] Onboarding can be completed in one session or resumed later
- [ ] All required fields validated before final submit
- [ ] Documents uploaded securely (CIN or business registration)
- [ ] Submission triggers admin verification queue
- [ ] Provider sees "Pending verification" status screen
- [ ] Notification sent when verified or rejected

---

## EPIC-09: Admin Core

### STORY-09-01
**As an** admin
**I want to** review and verify new provider applications
**So that** only qualified tradespeople are active on the platform

**Acceptance Criteria:**
- [ ] Queue sorted by submission date (oldest first)
- [ ] Admin can view all uploaded documents
- [ ] Approve button triggers: status → verified, notification sent to provider
- [ ] Reject button requires reason selection from list + optional note
- [ ] Admin action logged in audit_log table

### STORY-09-02
**As an** admin
**I want to** suspend a user account
**So that** I can immediately stop abusive or fraudulent behavior

**Acceptance Criteria:**
- [ ] Suspend requires reason (dropdown + note)
- [ ] Suspended user cannot log in (receives "account suspended" message)
- [ ] Suspended provider disappears from all match pools immediately
- [ ] All admin actions logged with timestamp and admin ID

---

## EPIC-10: Localization

### STORY-10-01
**As a** user
**I want to** use the app in Arabic with correct right-to-left layout
**So that** the interface is natural and readable for me

**Acceptance Criteria:**
- [ ] `dir="rtl"` applied to HTML element when Arabic is selected
- [ ] All text, icons, and layout elements flip correctly
- [ ] Navigation icons and back/forward arrows flip
- [ ] No broken layouts or overflowing text in RTL mode
- [ ] Forms, buttons, and inputs behave correctly in RTL
- [ ] All Arabic text uses appropriate font (Noto Naskh Arabic or Cairo)

---

## EPIC-11: Infrastructure

### STORY-11-01
**As a** developer
**I want to** have preview deployments for every pull request
**So that** changes can be reviewed before merging

**Acceptance Criteria:**
- [ ] Vercel preview URL generated automatically for each PR
- [ ] Preview URL posted to PR as comment
- [ ] Preview environment connects to staging Supabase project
- [ ] Migration preview available in PR description
