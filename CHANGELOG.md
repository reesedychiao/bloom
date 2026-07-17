# Changelog

## Phase 3 — Interviews & reminders (2026-07-17)

- Interview prep engine (`src/lib/game/prep.ts`, pure + unit tested): generates the T-5…T-1 checklist backward from the interview date, compresses gracefully when <5 days out, collapses to one "crash prep" task when <2 days out, never schedules in the past; kind-specific practice tasks; mock task pays the mock rate (40).
- Interview tracking on the flower detail screen: schedule form, upcoming list with outcome control, prep checklist whose checkboxes award Sunlight through the existing award path (so streak/quests/level react). Prep quests added to the pool (daily + weekly); `first_interview` achievement.
- .ics export (`src/lib/ics.ts`, tested): VEVENT with 1-day and 1-hour VALARMs, RFC-5545 escaping/CRLF. Manual "Add to calendar" button (no longer auto-downloads on schedule).
- Custom themed `DateTimePicker` (calendar + time from design tokens) replaces the native datetime input, matching the garden in day and night themes.
- Reminder pipeline: `send-reminders` Edge Function (web push via VAPID + Resend email fallback, 9:00-local gating with quiet-hours support, idempotent via `prep_tasks.notified_at`), driven by a pg_cron schedule every 15 min. Cron's shared secret lives in Supabase Vault, never in the repo (0004 reads it via `vault.decrypted_secrets`).
- Service worker switched from generateSW to injectManifest (`src/sw.ts`) to carry push/notificationclick handlers while keeping the same precache/offline behavior. `/settings` route: per-device push subscribe + channel toggles + timezone.
- Migrations 0003 (notified_at, push_subscriptions, notification_settings) and 0004 (pg_cron schedule).

Verified end-to-end: the cron job autonomously dispatched a due crash-prep reminder (email delivered, `notified_at` stamped, subsequent runs correctly skip it). Deferred to Phase 4: quiet-hours UI (columns exist), full settings, achievements wall + bouquet.

## Phase 2 — Gamification (2026-07-17)

- Pure, unit-tested game library (`src/lib/game/`): Sunlight values, level curve (100·L^1.5 rounded to 10) with Gardener ranks + Roman-numeral prestige, watering streak with auto-applied freezes (2/week, Monday replenish, never punishes clock skew), rotating daily/weekly quests, achievement evaluation. 33 tests.
- `awardAction()` orchestrator (`src/lib/api/game.ts`): every earning action writes the ledger, waters the streak, bumps matching quests (+rewards), and checks achievements. Client-orchestrated (not triggers) because the logic is stateful and spec-mandated pure TS; sequential writes are non-atomic but retryable.
- UI: header HUD (Sunlight, level + progress bar, streak with petal glow at 7/30/100), quest trellis card, Sunlight toasts, skippable marigold level-up overlay (all reduced-motion safe). Zustand added for toast/celebration state.
- Compost flow: rejecting opens the lesson-learned dialog (+15 with a note; the note lands on the rejection's timeline event); wilted flowers desaturate. Ghosted: 21+ day idle apps offer one-tap "mark ghosted" (+10 quiet credit). 7+ day idle flowers droop and read "thirsty" on their tag.
- Outreach (+15) / follow-up (+10) quick-log buttons on flower detail; logging tends the flower (resets idle).

Known minor: quest generation is client-side on first open; a same-instant plant on a fresh day could double-generate dailies (single-user risk ≈ nil). Deferred: contacts CRUD, prep-task quest pool (Phase 3), achievements wall + bouquet (Phase 4).


## Phase 1 — Core CRUD + garden (2026-07-16)

- Full schema (`supabase/migrations/0001_init.sql` + `0002_more_species.sql`): all 9 tables, owner-only RLS, and triggers that write `stage_events` and derive `growth_stage` atomically on any status change.
- Pure game logic in `src/lib/game/growth.ts` (status → growth stage, terminal detection), unit tested, mirrored by the SQL trigger.
- Data layer: TanStack Query hooks over typed Supabase CRUD (`src/lib/api/`).
- Screens (react-router): garden with staggered flowerbed (stable per-flower jitter, paper tags, idle sway), plant-a-seed bottom sheet (<20s quick-add, species picker with "surprise me", tailored checkbox), flower detail with vine timeline + stage select, applications list, dev-only `/species` art gallery.
- Planting animation: seed drop with spring + dirt puff (Framer Motion); growth-stage crossfade on detail; all with reduced-motion fallbacks.
- 8 species shipped: sunflower, tulip (terracotta), rose (layered red), daisy, lavender, peony, lily, calla lily — the last two are additions beyond the spec's 8, by request. Poppy and orchid still need art.
- Species accent tints added as tokens (`--tint-*`) with night-garden values.

Deferred: Sunlight awards (the `tailored` flag is stored for retroactive credit), compost/wilt visuals, notes editing on detail, error state on list screen, Zustand (still unneeded).


## Phase 0 — Scaffold & deploy skeleton (2026-07-16)

- Vite + React 19 + TypeScript app, pnpm, deployed-ready for Vercel (SPA rewrite in `vercel.json`).
- Design token system in `src/styles/tokens.css` (palette, semantic colors, night-garden dark overrides) wired into Tailwind v4 via `@theme inline` — no hardcoded colors anywhere.
- Typography: self-hosted Fraunces (display), Nunito Sans (body), JetBrains Mono (data) with a 1.25-ratio type scale.
- PWA: manifest (name "Bloom", parchment theme color), maskable flower icons generated from a hand-authored SVG (`pnpm generate:icons`), Workbox service worker precaching the app shell.
- Supabase magic-link auth: `SignIn` → `useSession` → `AuthGate`; renders a friendly "not connected" state when env keys are absent.
- Empty Garden screen (header shell with placeholder Sunlight/streak HUD, sprout empty state).
- Vitest smoke test; `pnpm test` and `pnpm build` green.

Deferred: router, Zustand/TanStack Query/Framer Motion (added when first used), dark-mode toggle UI (Phase 4), all Phase 1+ features. Note: spec said React 18; React 19 is current stable and fully compatible with this stack.
