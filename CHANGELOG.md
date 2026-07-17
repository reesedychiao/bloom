# Changelog

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
