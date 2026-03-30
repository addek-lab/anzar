# Scope Split: MVP / V1.1 / V2

## MVP (Weeks 1–10)
**Theme:** Prove the loop. Make the core transaction work.

### Delivered in MVP
| Feature | Notes |
|---|---|
| Phone/OTP auth | Both user types |
| Customer request creation wizard | 5-step, < 60 seconds |
| Image uploads (up to 5 per request) | WebP conversion |
| Deterministic matching engine | Up to 3 providers |
| Provider profile pages | All trust signals |
| In-app chat + offer thread | Realtime, Supabase |
| WhatsApp + call contact buttons | Links, not integration |
| Job lifecycle status tracking | 6 states |
| Customer rating + review | Post-completion |
| Provider onboarding flow | Multi-step |
| Provider verification queue (admin) | Manual review |
| Admin dashboard: core moderation | Verify, suspend, moderate |
| Categories management (admin) | 6 initial categories |
| Synonym management (admin) | For search layer |
| French + Arabic RTL | Full i18n from day one |
| Casablanca-only location | City-level + optional neighborhood |
| Request notifications | In-app + SMS fallback |
| PWA manifest + mobile optimization | No native app |
| Basic error tracking + logging | Sentry + Vercel logs |

---

## V1.1 (Weeks 11–18)
**Theme:** Monetize, expand, and improve quality.

### Delivered in V1.1
| Feature | Notes |
|---|---|
| Lead credit system for providers | Purchase packs, deduct on lead claim |
| Provider subscription tiers | Basic (free, limited leads) / Pro (paid) |
| Rabat city expansion | Second market launch |
| Admin: city + neighborhood management | Configurable |
| Push notifications (PWA) | Service worker |
| Provider performance dashboard | Response rate, lead stats |
| Admin fraud/risk dashboard | Duplicate detection signals |
| Review moderation workflow | Queue + approve/reject |
| Customer request history | Repeatable requests |
| Provider favorites / save | Customer-side |
| Admin analytics dashboard | Volume, funnel, provider quality |
| Structured dispute resolution queue | Admin-managed |
| Profile completeness score for providers | Nudges to improve |
| PostHog analytics events | Full funnel tracking |
| Improved search with synonym matching | FR + AR + Darija synonyms |
| Email optional for admin/support users | Not required for customers |
| Support queue (internal) | Basic ticketing |
| Onboarding improvements | Guided walkthroughs |

---

## V2 (Weeks 19–32+)
**Theme:** Scale, deepen, and defend.

### Delivered in V2
| Feature | Notes |
|---|---|
| Native iOS app | React Native or separate |
| Native Android app | Priority market |
| Payment processing + escrow | Pending legal/regulatory review |
| ML-assisted matching | Historical conversion data required |
| AI job description assistance | Help customers describe issues |
| Video support in work gallery | Provider profiles |
| Instant booking / appointment scheduling | For specific categories |
| Provider business tools | Invoice generator, job calendar |
| Multi-city expansion (Marrakech, Fes, Tangier) | Post-product-market fit |
| API for partner integrations | B2B / proptech potential |
| Referral system | Both sides |
| Customer loyalty program | Repeat usage |
| Advanced fraud ML | Behavioral signals |
| Darija NLP layer | Synonym expansion automation |
| B2B / property manager accounts | Bulk request management |
| Provider team accounts | Multiple members per account |
| Verified work certification badges | Trade-specific credentials |
| Seasonal demand campaigns | Admin-triggered promotions |
