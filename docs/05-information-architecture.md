# Information Architecture

## Top-Level Areas

```
Anzar
├── Public / Marketing
├── Auth
├── Customer App
├── Provider App
├── Admin App
└── Support App
```

---

## 1. Public / Marketing Area

Accessible without login. Optimized for SEO and conversion.

```
/ (Landing Page)
├── /comment-ca-marche (How it works)
├── /categories (Category overview)
├── /confiance (Trust & verification explanation)
├── /artisans (For providers — lead capture page)
├── /a-propos (About)
└── /aide (Help / FAQ)
    └── /aide/darija (Darija-language FAQ)
```

**Public provider profiles:**
```
/artisan/[slug] — publicly accessible provider profile
```

---

## 2. Auth

```
/auth
├── /auth/login (Phone input)
├── /auth/otp (OTP verification)
├── /auth/type (Customer or Provider selection)
└── /auth/language (Language selection — shown on first visit)
```

---

## 3. Customer App

Protected: requires auth + customer role.

### Navigation Structure (Bottom Nav — Mobile)
```
[Accueil] [Mes demandes] [Messages] [Profil]
```

### Routes
```
/app (redirect to /app/home or /app/requests)
├── /app/home (Home / New request CTA)
│
├── /app/request/new (Request creation wizard)
│   ├── Step 1: Category
│   ├── Step 2: Description
│   ├── Step 3: Photos
│   ├── Step 4: Location
│   ├── Step 5: Urgency + Budget
│   └── Step 6: Review + Submit
│
├── /app/request/[id] (Request detail)
│   ├── Request summary
│   ├── Matched providers list (up to 3)
│   └── Status: Open / Matched / Hired / Completed / Expired
│
├── /app/requests (My requests — list)
│   ├── Active requests
│   └── Past requests
│
├── /app/provider/[id] (Provider profile view — within app context)
│
├── /app/messages (All message threads)
│   └── /app/messages/[requestId]/[providerId] (Chat thread)
│
├── /app/notifications (Notification center)
│
└── /app/profile (Customer profile + settings)
    ├── Edit name / phone
    ├── Language preference
    └── Logout
```

---

## 4. Provider App

Protected: requires auth + provider role.

### Navigation Structure (Bottom Nav — Mobile)
```
[Leads] [Jobs] [Messages] [Profil]
```

### Routes
```
/pro (redirect to /pro/leads)
├── /pro/onboarding (Multi-step — first time only)
│   ├── Step 1: Basic info (name, phone, WhatsApp)
│   ├── Step 2: Trades selection
│   ├── Step 3: City + Service radius
│   ├── Step 4: Bio
│   ├── Step 5: Work photos
│   ├── Step 6: Verification documents
│   └── Step 7: Review + Submit
│
├── /pro/leads (Lead inbox)
│   ├── New leads (unresponded)
│   └── Responded leads
│
├── /pro/leads/[id] (Lead detail)
│   ├── Request summary (category, description, photos, location, urgency)
│   ├── Customer anonymized until response
│   └── Respond / Decline CTA
│
├── /pro/jobs (Active + completed jobs)
│   ├── /pro/jobs/active
│   └── /pro/jobs/completed
│
├── /pro/jobs/[id] (Job detail + status tracker)
│
├── /pro/messages (All message threads)
│   └── /pro/messages/[requestId] (Chat with customer)
│
├── /pro/profile (My profile — edit + preview)
│
├── /pro/performance (Stats: response rate, completed jobs, rating)
│
└── /pro/settings (Account settings)
    ├── Trade update
    ├── Service radius
    ├── Notification preferences
    ├── Language
    └── Logout
```

---

## 5. Admin App

Protected: requires auth + admin role. Separate subdomain or path.

```
/admin
├── /admin/login
│
├── /admin/dashboard (Overview metrics)
│
├── /admin/providers (Provider management)
│   ├── /admin/providers/queue (Verification queue)
│   ├── /admin/providers/[id] (Provider detail + documents)
│   └── /admin/providers/[id]/edit (Manual edit)
│
├── /admin/users (All users — customers + providers)
│   └── /admin/users/[id] (User detail + actions)
│
├── /admin/requests (All service requests)
│   └── /admin/requests/[id] (Request detail)
│
├── /admin/reviews (Review moderation queue)
│   └── /admin/reviews/[id]
│
├── /admin/disputes (Dispute + complaint queue)
│   └── /admin/disputes/[id]
│
├── /admin/taxonomy
│   ├── /admin/taxonomy/categories
│   ├── /admin/taxonomy/synonyms
│   ├── /admin/taxonomy/cities
│   └── /admin/taxonomy/neighborhoods
│
├── /admin/fraud (Fraud / risk signals dashboard)
│
└── /admin/audit (Audit log viewer)
```

---

## 6. Support App

Protected: requires auth + support role.

```
/support
├── /support/queue (Incoming requests + complaints)
├── /support/users/[id] (User lookup)
├── /support/requests/[id] (Request lookup)
└── /support/escalate (Escalation form to admin)
```

---

## Navigation Principles

### Mobile-first rules
1. **Bottom navigation** for primary sections (max 4 items)
2. **Back button** always available in sub-screens
3. **Primary CTA** always reachable with thumb (bottom half of screen)
4. **No hover-dependent interactions**
5. **Progressive disclosure** — don't show all options at once
6. **Sticky CTAs** on long-scroll pages

### Role-based routing
- Middleware checks user role on every protected route
- Customer accessing `/pro/*` → redirected to `/app`
- Provider accessing `/app/*` → redirected to `/pro`
- Non-admin accessing `/admin/*` → 403
- Unauthenticated accessing any protected route → `/auth/login`

### Empty states (all major views)
- My requests: "Vous n'avez pas encore de demandes" + CTA "Créer une demande"
- Lead inbox: "Aucun nouveau lead pour l'instant" + tip to improve profile
- Messages: "Aucun message" + CTA
- Admin queue: "Aucun élément en attente"
