import { supabase } from "../lib/supabase";

/** A single quiet sprout for the empty bed — the garden's first resident. */
function Sprout() {
  return (
    <svg
      viewBox="0 0 100 140"
      className="h-28 w-20"
      role="img"
      aria-label="A small sprout in fresh soil"
    >
      <path
        d="M22 122 Q50 112 78 122 Q64 132 50 131 Q36 132 22 122 Z"
        fill="var(--soil)"
        opacity="0.85"
      />
      <path
        d="M50 122 Q49 96 51 78"
        fill="none"
        stroke="var(--leaf)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M51 82 Q30 76 27 56 Q49 58 52 80 Z"
        fill="var(--leaf)"
        stroke="var(--soil)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M51 90 Q68 82 74 66 Q54 66 50 87 Z"
        fill="var(--leaf)"
        stroke="var(--soil)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

export function Garden() {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <h1 className="text-xl text-ink">Bloom</h1>
        <div className="flex items-center gap-4">
          <span
            className="font-mono text-xs text-ink-soft"
            title="Sunlight — earned with every bit of effort"
          >
            ☀ 0
          </span>
          <span
            className="font-mono text-xs text-ink-soft"
            title="Watering streak"
          >
            🌢 0 days
          </span>
          <button
            type="button"
            onClick={() => supabase?.auth.signOut()}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
        <Sprout />
        <h2 className="mt-6 text-2xl text-ink">Your garden is ready.</h2>
        <p className="mt-3 max-w-md text-ink-soft">
          Soon you’ll plant a seed for every application you send, and watch
          it grow. Every bouquet starts with a single seed.
        </p>
      </main>
    </div>
  );
}
