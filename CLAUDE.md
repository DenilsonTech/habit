@AGENTS.md


# CLAUDE.md — Project Rules (Daily Habits App)

This file defines how Claude Code should work in this repository. Read before making any changes. The full product context lives in `docs/PRD-habitos-app.md` — this file only covers **technical execution rules**.

---

## 1. Stack (fixed, do not change without explicit request)
- Next.js (App Router), TypeScript, Tailwind
- shadcn/ui for components
- Prisma + Neon Postgres
- Web Push (VAPID) + GitHub Actions (cron every 5 min) for reminders
- Deploy: Vercel (Hobby plan)
- No authentication — identity via anonymous `device_id`

---

## 2. Components — shadcn/ui required

- **Never build a UI component from scratch** (button, input, dialog, card, tabs, switch, sheet, toast, etc.) if a shadcn/ui equivalent exists. Install the shadcn component first (`npx shadcn@latest add <component>`), then adapt it.
- Before creating any new component, **check if something reusable already exists** in `src/components/` (both shadcn's `ui/` components and existing domain components, e.g. `HabitCard`, `WaterProgress`). Do not duplicate — if a similar component already exists, extend it (extra props, variants) instead of creating a copy.
- Domain components (non-shadcn) live in `src/components/` outside the `ui/` folder, which is reserved exclusively for shadcn-generated components.
- If a custom component with no shadcn equivalent is truly needed, build it **on top of shadcn/Radix primitives** whenever possible, not from scratch in plain HTML.
- Before adding a new prop or variant to an existing component, check whether that need is better solved by composing existing components instead.

---

## 3. Package management

- **Never edit `package.json` or `package-lock.json` manually.** All dependency installs, removals, or updates go through the terminal:
  - `npm install <package>`
  - `npm install -D <package>` (dev dependencies)
  - `npm uninstall <package>`
  - `npm update <package>`
- If a specific version needs to be pinned, do it via `npm install <package>@<version>`, never by writing the version number directly into the file.
- shadcn components are installed exclusively via `npx shadcn@latest add <component>` — never copy-pasted manually from elsewhere.

---

## 4. Database — Prisma

- **Always use `prisma db push`**, never `prisma migrate dev` or `prisma migrate deploy` on this project. Do not create a `prisma/migrations` folder.
- Schema lives in `prisma/schema.prisma`, reflecting the data model defined in the PRD (`devices`, `profiles`, `habits`, `water_config`, `daily_logs`, `streaks`, `pontuacao`, `push_subscriptions`, `reminder_dispatch_log`).
- Any schema change → edit `schema.prisma` → run `npx prisma db push` → run `npx prisma generate` (usually automatic after push, confirm it ran).
- Do not write raw SQL to alter table structure; schema changes always go through Prisma.
- Complex queries (e.g. the time-window matching in `/api/cron/check-reminders`) can use `prisma.$queryRaw`, but table structure itself is always managed via the Prisma schema/client.

---

## 5. Mobile & tablet first

- **All layouts are designed for mobile first, then adapted for tablet.** Use Tailwind mobile-first (base classes = mobile, `sm:`/`md:`/`lg:` only to adapt upward).
- The bottom nav (Home / Progress / Add / Profile) is the primary navigation pattern — do not replace it with a sidebar or top nav, even on tablet.
- Always design/test against a viewport starting at ~360px wide. Nothing should clip or require horizontal scrolling at that size.
- Minimum tap target of 44x44px on any clickable element (buttons, bottom nav items, habit checkboxes).
- Do not assume hover as the primary interaction — hover is a bonus, never the only path to an action.

---

## 6. Code structure and organization

- Next.js App Router: page routes in `src/app/`, API routes in `src/app/api/`.
- Business logic (streak calculation, routine parser, reminder matching) lives in `src/lib/`, never inline inside a `route.ts` or a component — routes and components call functions from `src/lib/`.
- Shared types in `src/lib/types.ts` (or dedicated files inside `src/lib/` if it grows).
- One file, one responsibility — avoid generic "utils" files that accumulate unrelated logic.

---

## 7. Language and copy

- All UI text is in **Portuguese (Mozambican/European)** — no mixing in English on user-facing labels.
- Variable, function, and file names in code follow standard English convention, but strings visible in the interface are in Portuguese.
- Direct, active-voice copy: a button says what it does ("Guardar hábito", not "Submeter"). Error messages explain what happened and how to fix it, without apologizing.

---

## 8. API / Backend

- Backend lives inside the same Next.js project (Route Handlers in `src/app/api/`). Never create a separate backend service/repo.
- Every route that writes data requires a valid `device_id` (verify it exists in the `devices` table before writing).
- `/api/cron/check-reminders` always validates the `Authorization: Bearer ${CRON_SECRET}` header before processing anything — reject with 401 if missing/invalid.
- Never expose `VAPID_PRIVATE_KEY`, the Postgres connection string, or `CRON_SECRET` to the client. Only `NEXT_PUBLIC_VAPID_PUBLIC_KEY` can be public.

---

## 9. PWA / Service Worker

- Service worker written manually at `public/sw.js` — **do not install `next-pwa`** (confirmed incompatibility with the Next.js version used in this project).
- `manifest.json` in `public/`, linked from `layout.tsx`.
- Always test the full push flow (subscribe → notification → click) after any change to the service worker.

---

## 10. General execution rules

- Before any schema, dependency, or architecture change that falls outside what's defined here or in the PRD, stop and ask — do not assume.
- Do not introduce state management libraries (Redux, Zustand, etc.) without proven need — for the MVP, `useState`/`useEffect` + fetch to the API routes is enough.
- Do not add authentication, user accounts, or any login flow — explicitly out of scope.
- Small, descriptive commits, one purpose per commit.
