# 💐 Bloom

**A gamified job-hunt garden.** Every application you send is a seed. Bloom rewards _daily effort_ — applying, reaching out,
prepping — rather than outcomes you can't control, so the job hunt stays motivating.

**Live:** https://bloom-nu-sandy.vercel.app/ · installable as a PWA (Add to Home Screen)

---

## The idea

Each job application is a **flower**. Submitting one **plants a seed**; as it moves
through your pipeline the flower grows seed → sprout → bud → bloom. A flower
reaches full bloom when you land an interview, and every bloom is cut into your bouquet, a permanent trophy case. A
rejection doesn't just vanish: the flower wilts and becomes compost, a small
bonus that "fertilizes" the next planting.

## Features

- **Garden** — a living flowerbed of your active applications at their growth stages, with an idle-nudge when a lead goes quiet.
- **Plant a seed** — sub-20-second quick-add with a species picker (10 hand-drawn flowers) and a "surprise me" default.
- **Gamification** — Sunlight (XP) for every action, Gardener levels/ranks, a watering streak with auto-applied freezes, and rotating daily/weekly quests.
- **Interview prep engine** — scheduling an interview auto-generates a prep checklist (research → practice → mock → logistics), each task worth Sunlight XP.
- **Reminders** — web push + email, dispatched on a schedule; quiet-hours aware.
- **Pipeline** — a kanban board; drag or tap a card to advance a stage and grow its flower.
- **Bouquet & achievements** — your blooms in a vase plus a pressed-flower achievements wall.
- **Almanac** — a weekly dashboard: pipeline funnel, response rate by source, Sunlight over time, average days per stage.
- **Details** — day / night-garden themes, offline support, reduced-motion paths, and keyboard-navigable, AA-contrast UI.

## Tech stack

- **Frontend:** React + TypeScript + Vite, Tailwind v4 (CSS-variable design tokens), Framer Motion, TanStack Query, Zustand, Recharts, React Router.
- **Backend:** Supabase — Postgres with Row-Level Security, magic-link auth, and an Edge Function for reminder dispatch (pg_cron + Resend email + Web Push).
- **PWA:** `vite-plugin-pwa` with a custom service worker (offline app shell + last-known data).
- **Testing:** Vitest — pure game/prep logic and a plant → advance → bloom integration smoke test.

Core game and prep logic lives as pure, unit-tested functions in `src/lib/game/`; the
UI stays thin. All colors and fonts flow from design tokens — no hardcoded styles.

## Running locally

Requires Node 20+ and `pnpm`.

```bash
pnpm install
cp .env.example .env.local   # add your Supabase URL + anon key (and VAPID public key for push)
pnpm dev                     # http://localhost:5173
```

Apply the SQL in `supabase/migrations/` (in order) to a Supabase project via its SQL
editor. Reminder push/email additionally needs the `send-reminders` Edge Function
deployed with its secrets set — see the migration comments.

```bash
pnpm test     # run the test suite
pnpm build    # production build
```

## Project layout

```
src/
  lib/game/     pure, tested game logic (sunlight, levels, streak, quests, prep, growth)
  lib/api/      Supabase data layer + TanStack Query hooks
  assets/flowers/  the 10 species as staged SVG components
  features/     plant, interviews, pipeline, compost, almanac
  screens/      garden, flower detail, pipeline, bouquet, almanac, settings
supabase/       SQL migrations + the reminder Edge Function
```

---

_Personal project - an app built to make the job hunt feel a little more exciting._
