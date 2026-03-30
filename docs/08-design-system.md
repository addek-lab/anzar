# Design System Direction

## Design Philosophy

**Tone:** Trustworthy, modern, warm, professional
**Anti-patterns to avoid:**
- Neon gradients
- Generic SaaS pastel palettes
- Excessive iconography circles
- Over-animation
- AI-template aesthetic
- Dark/dramatic hero sections with particle effects

**Reference points:**
- Trustpilot (trust architecture)
- Airbnb (marketplace warmth)
- Doctolib (French-market professional mobile-first)

The design must feel like a platform that takes quality seriously — not a startup side project.

---

## Color System

### Semantic Token Approach
All colors are defined as semantic tokens, not raw values. Components use tokens, never raw hex.

### Base Palette

```css
/* Brand */
--color-brand-primary: #1A6B4A;     /* Deep Moroccan green — trust, local identity */
--color-brand-secondary: #E8A838;   /* Warm gold/amber — craftsmanship, warmth */

/* Neutrals */
--color-neutral-50:  #FAFAFA;
--color-neutral-100: #F5F5F5;
--color-neutral-200: #E5E5E5;
--color-neutral-300: #D4D4D4;
--color-neutral-400: #A3A3A3;
--color-neutral-500: #737373;
--color-neutral-600: #525252;
--color-neutral-700: #404040;
--color-neutral-800: #262626;
--color-neutral-900: #171717;

/* Semantic */
--color-success: #16A34A;
--color-warning: #D97706;
--color-error:   #DC2626;
--color-info:    #2563EB;

/* Verified badge */
--color-verified: #1A6B4A;          /* Same as brand — verified = platform endorsed */
```

### Semantic Mapping (Light Mode)

```css
--bg-primary:     var(--color-neutral-50);
--bg-secondary:   var(--color-neutral-100);
--bg-elevated:    #FFFFFF;
--bg-overlay:     rgba(0,0,0,0.5);

--text-primary:   var(--color-neutral-900);
--text-secondary: var(--color-neutral-500);
--text-disabled:  var(--color-neutral-300);
--text-inverse:   #FFFFFF;

--border-default: var(--color-neutral-200);
--border-strong:  var(--color-neutral-400);

--interactive-primary:         var(--color-brand-primary);
--interactive-primary-hover:   #155A3E;
--interactive-primary-active:  #0F4530;
--interactive-secondary:       var(--color-neutral-100);
--interactive-secondary-hover: var(--color-neutral-200);
```

### Dark Mode (V1 support, not primary)
Dark mode tokens follow the same semantic structure with inverted neutral values. Primary brand green lightens slightly for dark contexts.

---

## Typography

### Font Stack

**Latin (French, numbers, UI):**
```
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
Reason: Inter is the modern standard for UI — readable at small sizes, free, excellent mobile rendering.

**Arabic:**
```
font-family: 'Cairo', 'Noto Sans Arabic', 'Arial', sans-serif;
```
Reason: Cairo is an excellent modern Arabic font with strong Latin fallback and wide Unicode support. Works well at UI scale. Available on Google Fonts.

### Type Scale (rem-based)

```
--text-xs:   0.75rem  (12px) — labels, captions
--text-sm:   0.875rem (14px) — body small, form hints
--text-base: 1rem     (16px) — body default
--text-lg:   1.125rem (18px) — body large, list items
--text-xl:   1.25rem  (20px) — card titles
--text-2xl:  1.5rem   (24px) — section headings
--text-3xl:  1.875rem (30px) — page headings
--text-4xl:  2.25rem  (36px) — hero headings
```

### Line Heights
```
--leading-tight:  1.25
--leading-normal: 1.5
--leading-relaxed: 1.75  /* Arabic text often needs more line height */
```

**Rule:** Arabic text elements always use `--leading-relaxed` minimum.

---

## Spacing System

8-point grid system.

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
```

**Minimum touch target:** 44x44px (WCAG requirement, enforced via utility class `touch-target`)

---

## Border Radius

```
--radius-sm:   4px   — tags, badges, small inputs
--radius-md:   8px   — cards, buttons
--radius-lg:   12px  — modals, bottom sheets
--radius-xl:   16px  — profile cards
--radius-full: 9999px — avatars, pills
```

---

## Elevation / Shadow

```
--shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.08);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08);
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.10);
```

---

## Core Components

### Button

```
Variants: primary | secondary | ghost | destructive | link
Sizes: sm | md | lg
States: default | hover | active | disabled | loading
```

Rules:
- `lg` is the default for all mobile CTAs
- Loading state shows spinner inside button, text hidden (prevent layout shift)
- Disabled state has 40% opacity, cursor not-allowed
- Full-width on mobile (`w-full` default in mobile contexts)

### Input / Form Fields

```
States: default | focused | filled | error | disabled
```

Rules:
- Error state: red border + error message below (not tooltip)
- Label always above input (not placeholder-as-label — accessibility)
- Placeholder: supplementary, not the label
- Min height: 44px

### Card

```
Variants: default | elevated | outlined | interactive
```

Interactive cards have hover lift effect (on desktop) and tap feedback (mobile).

### Badge / Tag

```
Variants: neutral | success | warning | error | brand | verified
```

Verified badge: green filled with checkmark icon — used on provider profile and match card.

### Status Badge (Job/Request Status)

| Status | Color | Label (FR) | Label (AR) |
|---|---|---|---|
| Open | Blue | En attente | في الانتظار |
| Matched | Amber | Artisans trouvés | تم إيجاد حرفيين |
| Hired | Green | Artisan sélectionné | تم اختيار حرفي |
| In Progress | Blue | En cours | قيد التنفيذ |
| Completed | Green | Terminé | مكتمل |
| Expired | Neutral | Expiré | منتهي الصلاحية |

### Avatar

```
Sizes: xs (24px) | sm (32px) | md (40px) | lg (56px) | xl (80px)
States: with image | initials fallback | loading skeleton
```

### Star Rating

```
Variants: display (read-only) | interactive (input)
Sizes: sm | md | lg
```

### Bottom Sheet (Mobile)

Used for: action sheets, filter panels, confirmation dialogs on mobile. Replaces modal on screens < 768px.

### Skeleton Loading

All cards and list items have skeleton variants. Skeleton uses pulse animation at 2s interval. Colors: neutral-200 / neutral-100 alternating.

---

## Layout System

### Mobile (< 768px) — Primary
- Single column
- Max content width: 100% with 16px horizontal padding
- Bottom navigation: fixed, 56px height, z-index top
- Safe area insets respected (iOS/Android notch and home indicator)

### Tablet (768–1024px)
- Two-column possible for lists + detail views
- Bottom nav → sidebar nav

### Desktop (> 1024px)
- Admin and support apps primarily used on desktop
- Max content width: 1280px centered
- Sidebar navigation

### RTL Layout Handling

```css
/* All spacing and directional utilities use logical properties */
margin-inline-start (instead of margin-left)
padding-inline-end (instead of padding-right)
border-inline-start (instead of border-left)
```

Tailwind CSS v3.3+ has logical property utilities built in. Use them exclusively.

---

## Iconography

**Library:** Lucide React (consistent, MIT licensed, thin stroke style)
**Arabic directional icons:** Arrow, chevron, and navigation icons are auto-mirrored via CSS `transform: scaleX(-1)` when `dir="rtl"` is active.

Do NOT use:
- Multiple icon libraries in the same app
- Colorful icon circles for categories (use simple line icons with brand color tint)
- Animated icons (except loading spinner and success checkmark)

### Category Icons
Each of the 6 categories has a dedicated icon from Lucide:
- Electrician: `Zap`
- Plumbing: `Droplets`
- Painting: `Paintbrush`
- HVAC: `Thermometer`
- Tiling: `Grid2x2`
- Handyman: `Wrench`

---

## Animation Principles

- **Duration:** 150ms for micro-interactions, 300ms for page transitions, 500ms for celebrations
- **Easing:** ease-out for enter, ease-in for exit
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` wraps all animations
- **No decorative animations** — every animation has a function (feedback, state change, navigation)

---

## i18n Implementation Requirements

### File Structure
```
/locales
  /fr
    common.json
    auth.json
    request.json
    provider.json
    admin.json
    errors.json
  /ar
    (same files)
```

### Rules
- No string in any component file
- All strings keyed: `namespace.key` pattern
- Pluralization handled via i18n library (next-intl recommended)
- Number formatting: `Intl.NumberFormat` with locale
- Date formatting: `Intl.DateTimeFormat` with locale
- Currency: always MAD suffix, no symbol assumptions

### Arabic Typography Rules
- Use CSS `text-align: start` (not `right`) for body text to work with both LTR/RTL
- Arabic numerals in prices use Western digits (0–9) for clarity — confirmed by Moroccan UX convention
- Arabic text in descriptions uses `hyphens: none` (Arabic doesn't use hyphenation)
