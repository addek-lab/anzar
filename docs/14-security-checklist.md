# Security Checklist

## Security Posture

This is a consumer marketplace handling personal data (phone numbers, ID documents, home addresses). The security model must be:
- Correct by default (not opt-in per feature)
- Defense in depth (multiple layers)
- Appropriate to startup scale (not enterprise-overkill)
- Compliant with Morocco's Law 09-08 on personal data protection

---

## Authentication Security

| Check | Implementation | Status |
|---|---|---|
| OTP rate limiting | 3 attempts per phone per 5 min, enforced in Supabase + API middleware | Required |
| OTP expiry | 10 minutes, enforced by Supabase Auth | Required |
| Session tokens | httpOnly cookies (not localStorage) for session JWT | Required |
| Session expiry | 7-day JWT with refresh, silent renewal | Required |
| Phone normalization | E.164 format enforced before any auth call | Required |
| Admin auth separation | Admin uses email/password, NOT phone OTP | Required |
| No username/password for regular users | Correct — OTP only | Required |
| Account lockout on brute-force | After 3 OTP failures, 5-min lockout | Required |
| Session invalidation on suspension | Supabase revokes all sessions on suspension | Required |

---

## Authorization Security

| Check | Implementation |
|---|---|
| Role-based access control | User type checked in middleware for all protected routes |
| Data access RLS | PostgreSQL Row Level Security on all tables |
| Service role key never in client | Only used in server-side API routes and Edge Functions |
| Supabase anon key scoping | Anon key has minimal permissions; RLS enforces user-level access |
| Admin-only endpoints | `/api/v1/admin/*` checked for admin role server-side |
| Provider endpoints require verification | Verified status checked before lead access |
| Cross-user data access prevention | `auth.uid() = owner_id` checks in RLS policies |
| Provider document access | Private bucket, service role only, no public URLs |

---

## Input Validation

| Check | Implementation |
|---|---|
| Zod schema validation | All API route request bodies validated via Zod before processing |
| Description length limits | Min/max enforced in DB constraints AND API validation |
| Phone number format | Validated with libphonenumber before Supabase auth calls |
| Image file type validation | MIME type checked server-side (not just extension) |
| Image size validation | 5MB max enforced in Supabase Storage bucket policy |
| SQL injection | Not applicable — Supabase client uses parameterized queries |
| XSS prevention | React escapes by default; no `dangerouslySetInnerHTML` usage |
| CSRF protection | Next.js App Router server actions have built-in CSRF protection |
| URL parameter injection | All UUIDs and IDs validated as proper format before DB queries |

---

## File Upload Security

| Check | Implementation |
|---|---|
| MIME type validation | Both client (UX) and server-side (security) |
| File extension check | Cross-reference with MIME type |
| File size limit | Enforced in Supabase Storage bucket policies |
| File rename on upload | Use generated UUID filename, never trust original filename |
| Image conversion | Convert to WebP (strips potentially malicious metadata) |
| Virus/malware scanning | Supabase does not provide this natively — V1 accepts risk at MVP scale; add ClamAV integration in V2 |
| Private document bucket | Provider CIN/docs in private bucket, no public URL, service role access only |
| Signed URLs for admin | Admin accesses documents via time-limited signed URLs (1-hour expiry) |

---

## API Security

| Check | Implementation |
|---|---|
| Rate limiting | Vercel Edge rate limiting + application-level per endpoint |
| Auth on all mutations | All POST/PATCH/DELETE require valid session |
| HTTPS only | Enforced via Vercel, HSTS headers |
| CORS configuration | Restrict to known origins (app domain, admin subdomain) |
| No sensitive data in URLs | IDs in path params only (UUIDs), never auth tokens |
| Request size limits | 10MB max request body (Next.js config) |
| Error messages | Never expose internal error details to client; log server-side |
| API response sanitization | Remove fields not intended for the caller (e.g., internal scores) |

---

## Data Privacy

| Check | Implementation |
|---|---|
| Phone number exposure | Phone numbers never returned in API responses to unauthorized parties. Customer phone revealed to provider only after offer acceptance. |
| Provider document privacy | Documents never in public storage |
| User data separation | Customer cannot see other customers' data. Provider cannot see other providers' match scores. |
| Soft deletes | Account deletion marks `deleted_at`, retains data for fraud investigation (30-day retention) |
| Morocco Law 09-08 compliance | No international transfer of personal data without consent; data stored in EU region (Supabase default) — confirm jurisdiction |
| GDPR awareness | While not primary market, GDPR-equivalent practices applied (data minimization, purpose limitation) |
| Admin data access logging | All admin access to user data logged in audit_log |

---

## Infrastructure Security

| Check | Implementation |
|---|---|
| Environment variables | Never hardcoded; managed via Vercel environment variables + Supabase vault |
| Secret rotation capability | All secrets rotatable without code changes |
| `.env` in `.gitignore` | Enforced |
| No secrets in logs | Structured logging never includes auth tokens or PII |
| Dependency scanning | `npm audit` in CI pipeline |
| Dependabot | Enabled on GitHub repo for automatic vulnerability PRs |
| Production database backups | Supabase automated daily backups (Pro plan) |
| Staging/production separation | Separate Supabase projects for each environment |
| Service role key restriction | Service role key only available in server-side runtime, not in browser bundle |

---

## Monitoring and Incident Response

| Check | Implementation |
|---|---|
| Error tracking | Sentry — all server errors captured with context |
| Auth failure monitoring | Supabase Auth logs + custom alert on spike |
| Failed upload attempts spike | Application-level counter alert |
| Admin login monitoring | Separate alert on admin login from new IP |
| Suspicious OTP volume alert | PostHog or Supabase edge function rate monitor |
| Incident response runbook | See `15-devops-infrastructure.md` for on-call basics |

---

## Security Anti-Patterns Explicitly Avoided

1. **No JWT in localStorage** — tokens only in httpOnly cookies
2. **No eval() or Function()** — ESLint rule enforced
3. **No client-side role checks as sole enforcement** — server-side always authoritative
4. **No unvalidated redirects** — all redirects validate against allowlist
5. **No password storage** — OTP-only for regular users
6. **No sensitive config in client-side env vars** — only `NEXT_PUBLIC_` prefixed safe values exposed
7. **No raw SQL from user input** — parameterized queries only
8. **No admin bypass shortcuts** — all admin actions go through same auth middleware

---

## Pre-Launch Security Review Checklist

Before production launch, the following must be confirmed:

- [ ] Supabase RLS policies reviewed by second engineer
- [ ] All API routes tested for unauthorized access (role bypass tests)
- [ ] OTP rate limiting tested
- [ ] File upload tested for type bypass attacks
- [ ] Admin endpoints tested for horizontal privilege escalation
- [ ] Session invalidation on suspension tested
- [ ] All environment variables confirmed in Vercel production
- [ ] Supabase project region confirmed (EU for data residency compliance)
- [ ] Sentry DSN configured and test error received
- [ ] No `console.log(user)` or similar PII leaks in production build
- [ ] CSP headers configured (Content Security Policy)
- [ ] Rate limiting rules activated in production
