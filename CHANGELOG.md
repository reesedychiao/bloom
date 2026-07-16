# Changelog

## Phase 0 — Scaffold & deploy skeleton (2026-07-16)

- Vite + React 19 + TypeScript app, pnpm, deployed-ready for Vercel (SPA rewrite in `vercel.json`).
- Design token system in `src/styles/tokens.css` (palette, semantic colors, night-garden dark overrides) wired into Tailwind v4 via `@theme inline` — no hardcoded colors anywhere.
- Typography: self-hosted Fraunces (display), Nunito Sans (body), JetBrains Mono (data) with a 1.25-ratio type scale.
- PWA: manifest (name "Bloom", parchment theme color), maskable flower icons generated from a hand-authored SVG (`pnpm generate:icons`), Workbox service worker precaching the app shell.
- Supabase magic-link auth: `SignIn` → `useSession` → `AuthGate`; renders a friendly "not connected" state when env keys are absent.
- Empty Garden screen (header shell with placeholder Sunlight/streak HUD, sprout empty state).
- Vitest smoke test; `pnpm test` and `pnpm build` green.

Deferred: router, Zustand/TanStack Query/Framer Motion (added when first used), dark-mode toggle UI (Phase 4), all Phase 1+ features. Note: spec said React 18; React 19 is current stable and fully compatible with this stack.
