# API Specification

## API Design Conventions

- **Base URL:** `/api/` (Next.js API routes)
- **Format:** JSON
- **Auth:** Bearer token (Supabase JWT) in Authorization header, OR session cookie (for SSR contexts)
- **Versioning:** `/api/v1/` prefix (added from the start to allow future versioning without breaking changes)
- **Error format:** `{ "error": { "code": string, "message": string, "details"?: any } }`
- **Validation:** Zod schemas on all request bodies
- **HTTP status codes:** Standard — 200, 201, 400, 401, 403, 404, 422, 429, 500

---

## Authentication Endpoints

### POST /api/v1/auth/send-otp
Send OTP to phone number.

**Auth:** None (public)
**Rate limit:** 3 requests per phone per 5 minutes

**Request body:**
```json
{
  "phone": "+212612345678"
}
```

**Response 200:**
```json
{
  "message": "OTP sent",
  "expires_in": 600
}
```

**Errors:**
- `400 INVALID_PHONE` — phone format invalid
- `429 RATE_LIMITED` — too many OTP requests. `retry_after` seconds included.

---

### POST /api/v1/auth/verify-otp
Verify OTP and create session.

**Auth:** None (public)

**Request body:**
```json
{
  "phone": "+212612345678",
  "token": "123456"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "phone": "+212612345678",
    "user_type": null,        // null on first login, before type selection
    "preferred_locale": "fr"
  },
  "is_new_user": true
}
```

**Errors:**
- `400 INVALID_TOKEN` — wrong OTP
- `400 EXPIRED_TOKEN` — OTP expired
- `429 TOO_MANY_ATTEMPTS` — locked out

---

### POST /api/v1/auth/set-user-type
Set account type after first login.

**Auth:** Required (new user with no type)

**Request body:**
```json
{
  "user_type": "customer" | "provider"
}
```

**Response 200:**
```json
{
  "user_type": "customer",
  "redirect_to": "/app/home" | "/pro/onboarding"
}
```

---

### POST /api/v1/auth/logout
Invalidate current session.

**Auth:** Required

**Response 200:** `{ "success": true }`

---

## Request Endpoints (Customer)

### POST /api/v1/requests
Create a new service request.

**Auth:** Required (customer)

**Request body:**
```json
{
  "category_id": 2,
  "description": "Mon robinet de cuisine fuit depuis 2 jours...",
  "city_id": 1,
  "neighborhood": "Maarif",
  "urgency": "urgent",
  "budget_note": "Budget flexible"
}
```

**Response 201:**
```json
{
  "request": {
    "id": "uuid",
    "status": "open",
    "category": { "id": 2, "name": "Plomberie", "icon": "droplets" },
    "description": "...",
    "city": { "id": 1, "name_fr": "Casablanca" },
    "neighborhood": "Maarif",
    "urgency": "urgent",
    "submitted_at": "2026-03-29T10:00:00Z",
    "expires_at": "2026-04-28T10:00:00Z"
  }
}
```

**Validation errors:**
- `400 MISSING_CATEGORY`
- `400 DESCRIPTION_TOO_SHORT` (min 10 chars)
- `400 DESCRIPTION_TOO_LONG` (max 500 chars)
- `400 INVALID_CITY` — city not active
- `400 INVALID_URGENCY`

---

### POST /api/v1/requests/:id/images
Upload an image for a request.

**Auth:** Required (customer, owns request)
**Content-Type:** multipart/form-data

**Request:** form field `image` (file)

**Response 201:**
```json
{
  "image": {
    "id": "uuid",
    "url": "https://cdn.supabase.co/...",
    "sort_order": 1
  }
}
```

**Validation errors:**
- `400 INVALID_FILE_TYPE` — only JPEG, PNG, HEIC
- `400 FILE_TOO_LARGE` — max 5MB
- `400 MAX_IMAGES_REACHED` — 5 image limit
- `404 REQUEST_NOT_FOUND`
- `403 NOT_YOUR_REQUEST`

---

### GET /api/v1/requests/:id
Get request detail with matches.

**Auth:** Required

**Response 200:**
```json
{
  "request": {
    "id": "uuid",
    "status": "matched",
    "category": { ... },
    "description": "...",
    "images": [ { "id": "uuid", "url": "..." } ],
    "urgency": "urgent",
    "neighborhood": "Maarif",
    "submitted_at": "...",
    "matches": [
      {
        "id": "uuid",
        "provider": {
          "id": "uuid",
          "display_name": "Hassan Electricité",
          "avatar_url": "...",
          "is_verified": true,
          "avg_rating": 4.8,
          "review_count": 23,
          "completed_jobs_count": 45,
          "response_time_label": "Répond en < 2h",
          "trades": ["Électricité"]
        },
        "match_score": 87.5,
        "status": "responded"
      }
    ]
  }
}
```

---

### GET /api/v1/requests
List customer's requests.

**Auth:** Required (customer)
**Query params:** `status` (optional filter), `page`, `limit` (default 20)

**Response 200:**
```json
{
  "requests": [ ... ],
  "total": 12,
  "page": 1
}
```

---

### PATCH /api/v1/requests/:id/status
Update request status (customer).

**Auth:** Required (customer, owns request)

**Request body:**
```json
{
  "status": "completed"
}
```

**Valid transitions:**
- `open/matched` → `cancelled`
- `hired/in_progress` → `completed`

---

## Provider Endpoints

### POST /api/v1/providers/onboarding
Submit provider onboarding.

**Auth:** Required (provider user_type)

**Request body:**
```json
{
  "display_name": "Hassan El Fassi",
  "whatsapp_number": "+212612345678",
  "city_id": 1,
  "service_radius_km": 10,
  "trade_ids": [1, 3],
  "bio": "Électricien avec 12 ans d'expérience...",
  "bio_ar": "كهربائي بخبرة 12 سنة..."
}
```

**Response 201:**
```json
{
  "provider": {
    "id": "uuid",
    "status": "pending",
    "message": "Votre profil est en cours de vérification"
  }
}
```

---

### GET /api/v1/providers/me
Get current provider's profile.

**Auth:** Required (provider)

**Response 200:** Full provider profile object including stats

---

### PATCH /api/v1/providers/me
Update provider profile.

**Auth:** Required (provider)
**Request body:** Partial provider fields (name, bio, whatsapp, service_radius_km, trade_ids)

---

### POST /api/v1/providers/me/photos
Upload work portfolio photo.

**Auth:** Required (provider)
**Content-Type:** multipart/form-data

---

### GET /api/v1/providers/:id/public
Get public provider profile.

**Auth:** None (public endpoint)

**Response 200:**
```json
{
  "provider": {
    "id": "uuid",
    "display_name": "Hassan El Fassi",
    "slug": "hassan-el-fassi-casablanca",
    "avatar_url": "...",
    "is_verified": true,
    "trades": ["Électricité", "Dépannage général"],
    "city": "Casablanca",
    "bio": "...",
    "avg_rating": 4.8,
    "review_count": 23,
    "completed_jobs_count": 45,
    "photos": [ { "url": "..." } ],
    "reviews": [ { "rating": 5, "comment": "...", "published_at": "..." } ],
    "response_time_label": "Répond en < 2h",
    "member_since": "2026-01-15"
  }
}
```

---

## Lead / Match Endpoints (Provider)

### GET /api/v1/leads
Get provider's lead inbox.

**Auth:** Required (provider, verified)

**Response 200:**
```json
{
  "leads": [
    {
      "id": "match_uuid",
      "request": {
        "id": "request_uuid",
        "category": { "name": "Plomberie" },
        "neighborhood": "Maarif",
        "urgency": "urgent",
        "description_preview": "Mon robinet de cuisine fuit...",
        "has_photos": true,
        "submitted_at": "..."
      },
      "status": "pending",
      "notified_at": "..."
    }
  ]
}
```

---

### GET /api/v1/leads/:matchId
Get lead detail (provider accessing a specific match).

**Auth:** Required (provider, matched to this request)

**Response 200:**
```json
{
  "lead": {
    "match_id": "uuid",
    "request": {
      "id": "uuid",
      "category": { ... },
      "description": "Full description",
      "images": [ { "url": "..." } ],
      "neighborhood": "Maarif",
      "city": "Casablanca",
      "urgency": "urgent",
      "budget_note": "Flexible",
      "submitted_at": "..."
    },
    "status": "viewed"
  }
}
```

---

### PATCH /api/v1/leads/:matchId/decline
Decline a lead.

**Auth:** Required (provider)

**Request body:**
```json
{
  "reason": "not_available" | "out_of_area" | "not_my_trade" | "other"
}
```

---

## Offer Endpoints

### POST /api/v1/conversations/:conversationId/offers
Send an offer.

**Auth:** Required (provider in this conversation)

**Request body:**
```json
{
  "price_mad": 350.00,
  "available_date": "2026-04-01",
  "note": "Je peux passer demain matin entre 9h et 12h."
}
```

**Response 201:**
```json
{
  "offer": {
    "id": "uuid",
    "price_mad": 350.00,
    "available_date": "2026-04-01",
    "note": "...",
    "status": "pending",
    "created_at": "..."
  }
}
```

**Side effects:**
- Creates a message of type `offer` in the conversation
- Notifies customer of new offer

---

### PATCH /api/v1/offers/:offerId/accept
Customer accepts an offer.

**Auth:** Required (customer who owns the request)

**Side effects:**
- Offer status → `accepted`
- Other offers in same conversation → `superseded`
- Request status → `hired`
- Job record created
- Match status for selected provider → `selected`
- Other match statuses → `not_selected`
- Customer phone revealed to provider in conversation

---

### PATCH /api/v1/offers/:offerId/decline
Customer declines an offer.

**Auth:** Required (customer)

---

## Message Endpoints

### GET /api/v1/conversations/:id/messages
Get messages for a conversation.

**Auth:** Required (participant in conversation)
**Query params:** `before` (cursor for pagination), `limit` (default 50)

**Response 200:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "sender_name": "Hassan",
      "message_type": "text",
      "content": "Bonjour, je suis disponible demain.",
      "is_read": true,
      "created_at": "..."
    },
    {
      "id": "uuid",
      "sender_id": "uuid",
      "message_type": "offer",
      "offer": { "price_mad": 350, "available_date": "2026-04-01", "status": "pending" },
      "created_at": "..."
    }
  ],
  "has_more": false
}
```

---

### POST /api/v1/conversations/:id/messages
Send a text message.

**Auth:** Required (conversation participant)

**Request body:**
```json
{
  "content": "Bonjour, pouvez-vous venir demain?"
}
```

---

## Review Endpoints

### POST /api/v1/jobs/:jobId/review
Submit a review.

**Auth:** Required (customer who owns the job)

**Request body:**
```json
{
  "rating": 5,
  "comment": "Excellent travail, très professionnel."
}
```

**Response 201:**
```json
{
  "review": {
    "id": "uuid",
    "status": "pending",
    "message": "Votre avis sera publié après modération."
  }
}
```

---

## Admin Endpoints

All `/api/v1/admin/*` endpoints require admin role.

### GET /api/v1/admin/providers/queue
Get pending verification queue.

**Query params:** `status` (default: 'pending'), `page`, `limit`

---

### POST /api/v1/admin/providers/:providerId/verify
Approve or reject provider.

**Request body:**
```json
{
  "decision": "approved" | "rejected",
  "reason": "document_unreadable",  // required if rejected
  "notes": "Optional admin note"
}
```

**Side effects:**
- Provider status updated
- SMS notification sent to provider
- admin_action logged

---

### POST /api/v1/admin/users/:userId/suspend
Suspend a user account.

**Request body:**
```json
{
  "reason": "fraud" | "spam" | "abusive_behavior" | "other",
  "notes": "Details..."
}
```

---

### GET /api/v1/admin/reviews/queue
Get pending or flagged reviews.

---

### PATCH /api/v1/admin/reviews/:reviewId/moderate
Approve or reject a review.

**Request body:**
```json
{
  "decision": "approved" | "rejected",
  "reason": "inappropriate_content"
}
```

---

## Search / Taxonomy Endpoints

### GET /api/v1/categories
List active categories with translations.

**Query params:** `locale` (default: 'fr')

**Response 200:**
```json
{
  "categories": [
    {
      "id": 1,
      "slug": "electrician",
      "icon": "zap",
      "name": "Électricité",
      "description": "Installation, réparation électrique"
    }
  ]
}
```

---

### GET /api/v1/search/categories
Search categories by term (supports synonyms).

**Query params:** `q` (search term)

**Response 200:**
```json
{
  "results": [
    { "id": 2, "name": "Plomberie", "matched_term": "sbak" }
  ]
}
```

---

## Error Response Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| UNAUTHORIZED | 401 | No valid session |
| FORBIDDEN | 403 | Authenticated but wrong role |
| NOT_FOUND | 404 | Resource doesn't exist |
| INVALID_PHONE | 400 | Phone format invalid |
| RATE_LIMITED | 429 | Too many requests |
| VALIDATION_ERROR | 422 | Body schema validation failed |
| PROVIDER_NOT_VERIFIED | 403 | Provider accessing match features before verification |
| REQUEST_EXPIRED | 400 | Action on expired request |
| ALREADY_REVIEWED | 400 | Duplicate review attempt |
| MAX_IMAGES_REACHED | 400 | Image limit hit |
| ACCOUNT_SUSPENDED | 403 | Suspended account login attempt |
