import { Link } from "react-router";
import { useBouquet, useUnlockedAchievements } from "../lib/api/hooks";
import { ACHIEVEMENTS } from "../lib/game/achievements";
import { Flower } from "../assets/flowers/Flower";
import type { Application } from "../lib/types";

export function Bouquet() {
  const { data: blooms } = useBouquet();
  const { data: unlocked } = useUnlockedAchievements();

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">
          ← Garden
        </Link>
        <h1 className="text-lg text-ink">Bouquet</h1>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <section>
          <h2 className="font-display text-2xl text-ink">Your vase</h2>
          {blooms.length === 0 ? (
            <p className="mt-3 text-ink-soft">
              Your vase is waiting. Every bouquet starts with a single seed — and every
              interview you earn becomes a bloom here.
            </p>
          ) : (
            <Vase blooms={blooms} />
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-ink">Pressed flowers</h2>
          <p className="mt-1 text-sm text-ink-soft">Milestones, framed as you reach them.</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ACHIEVEMENTS.map((achievement) => {
              const earned = unlocked?.has(achievement.key) ?? false;
              return (
                <li
                  key={achievement.key}
                  className={`rounded-xl border p-4 text-center ${
                    earned ? "border-marigold/60 bg-surface" : "border-line bg-canvas opacity-55"
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                      earned ? "bg-marigold/20" : "bg-line"
                    }`}
                  >
                    {earned ? "🌸" : "🌱"}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink">{achievement.title}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">{achievement.description}</p>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}

/** Cut blooms arranged as if gathered in a vase on a shelf. */
function Vase({ blooms }: { blooms: Application[] }) {
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-end justify-center gap-x-1 gap-y-2 rounded-t-xl border border-line border-b-0 bg-surface px-4 pt-6">
        {blooms.map((app, i) => (
          <Link
            key={app.id}
            to={`/flower/${app.id}`}
            title={`${app.company} — ${app.role}`}
            aria-label={`${app.company}, ${app.role}`}
            className="block transition-transform hover:-translate-y-1"
            style={{ transform: `rotate(${((i % 5) - 2) * 3}deg)` }}
          >
            <Flower species={app.species} stage={3} className="h-24 w-16" />
          </Link>
        ))}
      </div>
      {/* the vase */}
      <div
        aria-hidden="true"
        className="mx-auto h-16 w-40 rounded-b-[3rem] border border-line bg-mist/25"
        style={{ clipPath: "polygon(12% 0, 88% 0, 74% 100%, 26% 100%)" }}
      />
      <p className="mt-3 text-center font-mono text-xs text-ink-soft">
        {blooms.length} {blooms.length === 1 ? "bloom" : "blooms"} gathered
      </p>
    </div>
  );
}
