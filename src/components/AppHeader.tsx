import { Link, useLocation } from "react-router";
import { supabase } from "../lib/supabase";
import { useStreak, useSunlightTotal } from "../lib/api/hooks";
import { levelProgress } from "../lib/game/levels";

const NAV: { to: string; label: string }[] = [
  { to: "/", label: "Garden" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/bouquet", label: "Bouquet" },
  { to: "/almanac", label: "Almanac" },
  { to: "/applications", label: "List" },
  { to: "/settings", label: "Settings" },
];

/** Garden header HUD: Sunlight, level + rank progress, watering streak. */
export function AppHeader() {
  const { pathname } = useLocation();
  const { data: total = 0 } = useSunlightTotal();
  const { data: streak } = useStreak();
  const progress = levelProgress(total);
  const days = streak?.current_streak ?? 0;
  const glow = days >= 100 ? "streak-glow-100" : days >= 30 ? "streak-glow-30" : days >= 7 ? "streak-glow-7" : "";

  return (
    <header className="border-b border-line px-5 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-ink">Bloom</h1>
        <nav className="flex items-center gap-3">
          <span
            className="font-mono text-sm text-marigold"
            title="Sunlight — earned by tending your search"
          >
            ☀ {total}
          </span>
          <span
            className={`font-mono text-sm text-ink-soft ${glow}`}
            title={`Watering streak — ${streak?.freezes_available ?? 2} rain covers left this week`}
          >
            🌢 {days}
          </span>
          <button
            type="button"
            onClick={() => supabase?.auth.signOut()}
            className="rounded-lg border border-line px-2.5 py-1 text-sm text-ink-soft hover:text-ink"
          >
            Sign out
          </button>
        </nav>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <span className="text-sm text-ink">
          Lv {progress.level} · <span className="text-ink-soft">{progress.rank}</span>
        </span>
        <div
          role="progressbar"
          aria-valuenow={progress.into}
          aria-valuemax={progress.span}
          aria-label="Sunlight toward next level"
          className="h-1.5 max-w-40 flex-1 overflow-hidden rounded-full bg-line"
        >
          <div
            className="h-full rounded-full bg-marigold transition-[width] duration-500"
            style={{ width: `${Math.min(100, (progress.into / progress.span) * 100)}%` }}
          />
        </div>
        <span className="font-mono text-xs text-ink-soft">
          {progress.into}/{progress.span}
        </span>
      </div>
      <nav className="-mx-1 mt-2 flex gap-1 overflow-x-auto" aria-label="Sections">
        {NAV.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-full px-3 py-1 text-sm ${
                active ? "bg-leaf-deep text-parchment" : "text-ink-soft hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
