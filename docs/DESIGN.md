# DESIGN.md — Design System (Daily Habits App)

Reference for all visual decisions in this project. Read alongside `CLAUDE.md` (component rules) and `PRD-habitos-app.md` (product scope).

---

## 1. Direction

**Premium, minimal, focused.** iOS-like: soft, heavily rounded shapes, generous whitespace, restrained color, no visual noise. The app should feel calm and precise — not playful, not "gamified-loud" despite having gamification mechanics underneath.

- **No emojis anywhere in the UI.** Icons only.
- **Icon library: Hugeicons** (`@hugeicons/react` or equivalent package). Use the **Stroke Rounded** style consistently across the whole app — never mix stroke styles (no solid/bulk icons mixed with stroke ones). Default stroke width ~1.5px, default size 24px (20px in dense contexts like list rows).
- Few colors. One accent color does almost all the work (buttons, active states, progress, streaks). Color is used to draw attention, not to decorate.

---

## 2. Color Palette

**Dark mode first for the MVP.** The app ships dark by default (`<html class="dark">`); a light theme is backlog, not a v1 concern. The palette below is the dark theme — one accent (Vital Green) over a near-black, softened neutral scale.

| Token | Value | Usage |
|---|---|---|
| `background` | `#0A0A0B` | App background (near-black, never pure `#000`) |
| `surface` | `#17171A` | Cards, sheets, nav bar |
| `surface-muted` | `#212126` | Secondary surfaces, input backgrounds |
| `border` | `rgba(255,255,255,0.08)` | Dividers (used sparingly — prefer elevation over borders) |
| `foreground` | `#FAFAFA` | Primary text |
| `foreground-muted` | `#A1A1AA` | Secondary text, captions, timestamps |
| `primary` (Vital Green) | `#22C55E` | Primary actions, active nav item, progress bar, links, water accent, habit completion |
| `primary-foreground` | `#FFFFFF` | Text/icons on top of `primary` |
| `danger` | `#EF4444` | Destructive actions only (delete habit, reset data) — used rarely |

Rules:
- `primary` is the **only** saturated color used for interactive/emphasis elements, including the "completed" state for habits — a checked-off habit uses `primary`, not a separate success color. This keeps the palette to a single accent, as requested.
- `danger` is functional only, never decorative.
- Never use pure black (`#000000`) or pure white surfaces — always the softened tokens above, for a premium feel.
- The onboarding intro uses a large soft **green/emerald gradient glow** over `background`, with a subtle film-grain overlay. Decorative gradients stay within the green accent family — no second accent hue.

### shadcn/Tailwind mapping
Tailwind v4 + shadcn use **oklch** CSS variables in `globals.css` (the `.dark` block, active by default). All shadcn components inherit these automatically:

```css
--background: oklch(0.145 0 0);          /* #0A0A0B */
--foreground: oklch(0.97 0 0);           /* #FAFAFA */
--card: oklch(0.205 0 0);                /* surface */
--card-foreground: oklch(0.97 0 0);
--primary: oklch(0.723 0.219 149.58);    /* Vital Green #22C55E */
--primary-foreground: oklch(1 0 0);      /* #FFFFFF */
--muted: oklch(0.27 0 0);
--muted-foreground: oklch(0.708 0 0);    /* #A1A1AA */
--border: oklch(1 0 0 / 10%);
--ring: oklch(0.723 0.219 149.58);
--destructive: oklch(0.62 0.21 25);
--radius: 1.25rem;
```

> Note on contrast: white text/icons on `#22C55E` have adequate contrast for buttons, icons, and the bold "hero numbers" style (15px+ Medium/SemiBold), but avoid using `primary-foreground` for small regular-weight body text — keep small text on `foreground`/`foreground-muted` over `background`/`surface` instead.

---

## 3. Typography

**Font: [Inter](https://fonts.google.com/specimen/Inter)** (Google Fonts, variable font). Chosen specifically for the "focus" feel requested — it's neutral, highly legible at small sizes, and reads as precise rather than decorative. Single family for the whole app; differentiation comes from weight, not from mixing fonts.

| Role | Weight | Size (mobile base) | Notes |
|---|---|---|---|
| Screen title | 600 (SemiBold) | 22px | Tight letter-spacing (-0.02em) |
| Section header | 600 | 17px | |
| Body | 400 (Regular) | 15px | |
| Body emphasis / labels | 500 (Medium) | 15px | Buttons, nav labels |
| Caption / meta | 400 | 13px | `foreground-muted` color |
| Big numbers (streak count, water ml, points) | 700 (Bold) | 28-34px | Tabular numerals, tight tracking — these are the "hero" numbers of the app |

Load via `next/font/google` (not a `<link>` tag), so it's self-hosted and optimized automatically by Next.js.

---

## 4. Shape & Radius (iOS-like)

Heavily rounded, consistent radius scale — this is a defining trait of the look:

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 10px | Small chips, badges |
| `radius-md` | 14px | Inputs, small buttons |
| `radius-lg` | 20px | Cards, habit rows, sheets |
| `radius-full` | 9999px | Primary buttons (pill-shaped), bottom nav active pill, avatar/icon containers |

- Cards and habit rows: `radius-lg`, no visible border by default — separation comes from a soft shadow, not a hard line.
- Primary buttons: full pill shape (`radius-full`), generous horizontal padding.
- Bottom nav: rounded top corners (`radius-lg` on the top two corners), floating slightly above the screen edge with a soft shadow rather than a hard top border.

---

## 5. Elevation

Minimal, soft shadows only — no hard drop shadows, no borders as a substitute for elevation.

```css
--shadow-sm: 0 1px 2px rgba(21, 21, 26, 0.04);
--shadow-md: 0 4px 16px rgba(21, 21, 26, 0.06);
--shadow-lg: 0 8px 30px rgba(21, 21, 26, 0.08);
```

- Cards/habit rows: `shadow-sm`.
- Bottom nav, modals/sheets: `shadow-md`.
- Nothing in the app should ever use `shadow-lg` except a modal actively in focus.

---

## 6. Spacing

Base unit: 4px. Use Tailwind's default scale, but standardize on these for consistency:

- Screen horizontal padding: 20px
- Gap between cards/list items: 12px
- Card internal padding: 16-20px
- Bottom nav height: 64px + safe-area-inset-bottom

---

## 7. Iconography Rules (Hugeicons)

- One style only: **Stroke Rounded**.
- One weight only: default stroke weight from the library — do not mix thin/bold variants.
- Icons always inherit color via `currentColor` — never hardcode an icon color separate from the text/token system.
- Icon-only buttons (e.g. bottom nav, water quick-add) always sit inside a `radius-full` touch target of at least 44x44px, even if the icon itself is smaller.
- Never use emoji as a substitute or alongside icons, in any part of the UI — including notification text, empty states, and onboarding copy.

---

## 8. Motion (light touch)

- Keep animations subtle and fast (150-200ms, ease-out). This is a "calm, premium" app, not a playful one.
- Use motion only for: checking off a habit (small scale/opacity confirmation), water progress bar filling, bottom nav active pill sliding between tabs, streak badge unlock.
- No bouncy/spring effects, no confetti, no celebratory animations beyond a subtle one for streak milestones.

---

## 9. Summary for implementation

- Google Font: **Inter**, via `next/font/google`.
- Icons: **Hugeicons**, Stroke Rounded style only, no emojis anywhere.
- One accent color (`primary` / Vital Green `#22C55E`), neutral grayscale everything else — including the "completed" state, which reuses `primary` instead of a separate success color.
- Heavily rounded corners throughout (cards 20px, buttons pill-shaped).
- Soft shadows instead of borders for separation.
- All of the above expressed as shadcn/Tailwind CSS variables so every shadcn component picks it up automatically — no per-component color overrides.
