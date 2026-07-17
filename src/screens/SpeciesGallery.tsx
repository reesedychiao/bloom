import { useState } from "react";
import { Link } from "react-router";
import { Flower } from "../assets/flowers/Flower";
import { AVAILABLE_SPECIES, SPECIES_LABELS, type GrowthStage } from "../lib/types";

const STAGES: { stage: GrowthStage; label: string }[] = [
  { stage: 0, label: "seed" },
  { stage: 1, label: "sprout" },
  { stage: 2, label: "bud" },
  { stage: 3, label: "bloom" },
];

/** Dev-only art-direction view: every shipped species at every stage. */
export function SpeciesGallery() {
  const [night, setNight] = useState(false);

  function toggleNight() {
    const next = !night;
    setNight(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  }

  return (
    <div className="min-h-dvh bg-canvas px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-ink">Species gallery</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Art direction only — not linked from the app.{" "}
            <Link to="/" className="text-leaf underline">
              Back to garden
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={toggleNight}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft hover:text-ink"
        >
          {night ? "Day garden" : "Night garden"}
        </button>
      </div>

      <div className="flex flex-col gap-10">
        {AVAILABLE_SPECIES.map((species) => (
          <section key={species}>
            <h2 className="mb-2 text-lg capitalize text-ink">{SPECIES_LABELS[species] ?? species}</h2>
            <div className="flex flex-wrap gap-6">
              {STAGES.map(({ stage, label }) => (
                <figure
                  key={stage}
                  className="flex flex-col items-center rounded-xl border border-line bg-surface p-4"
                >
                  <Flower species={species} stage={stage} className="h-36 w-26" />
                  <figcaption className="mt-2 font-mono text-xs text-ink-soft">
                    {stage} · {label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
