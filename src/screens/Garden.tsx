import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useApplications } from "../lib/api/hooks";
import { isTerminal } from "../lib/game/growth";
import { daysBetween, localDateString } from "../lib/game/dates";
import { STATUS_LABELS, type Application } from "../lib/types";
import { Flower } from "../assets/flowers/Flower";
import { SproutStage } from "../assets/flowers/shared";
import { PlantSheet } from "../features/plant/PlantSheet";
import { AppHeader } from "../components/AppHeader";
import { QuestTrellis } from "../components/QuestTrellis";

/** Stable pseudo-random jitter per application so the bed feels organic
 *  but never reshuffles between renders. */
function jitter(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  const rand = (n: number) => {
    const x = Math.sin(h + n) * 10_000;
    return x - Math.floor(x);
  };
  return {
    rotate: rand(1) * 9 - 4.5,
    dy: rand(2) * 14,
    scale: 0.9 + rand(3) * 0.18,
    swayDelay: rand(4) * 5,
  };
}

export function Garden() {
  const { data: applications, isLoading, isError, error } = useApplications();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [justPlantedId, setJustPlantedId] = useState<string | null>(null);

  // composted/ghosted flowers leave the bed; the bouquet & almanac (Phase 4) remember them
  const growing = (applications ?? []).filter((a) => !isTerminal(a.status));

  return (
    <div className="min-h-dvh bg-canvas">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-4">
        <QuestTrellis />
        {isError ? (
          <p role="alert" className="mx-auto max-w-md rounded-lg border border-line bg-surface p-4 text-sm text-ink-soft">
            The garden couldn’t be reached: {(error as Error).message}
          </p>
        ) : growing.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center py-16 text-center">
            <svg viewBox="0 0 100 140" className="h-28 w-20" role="img" aria-label="A small sprout">
              <SproutStage />
            </svg>
            <h2 className="mt-6 text-2xl text-ink">Your garden is ready.</h2>
            <p className="mt-3 max-w-md text-ink-soft">
              Plant a seed for every application you send, and watch it grow. Every bouquet
              starts with a single seed.
            </p>
          </div>
        ) : (
          <ul className="mt-6 flex flex-wrap items-end justify-center gap-x-1 gap-y-6 pb-24">
            {growing.map((app) => (
              <GardenFlower
                key={app.id}
                app={app}
                justPlanted={app.id === justPlantedId}
              />
            ))}
          </ul>
        )}
      </main>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-6 right-6 z-30 rounded-full bg-leaf-deep px-5 py-3 font-semibold text-parchment shadow-lg transition-transform hover:scale-105"
      >
        Plant a seed
      </button>

      <PlantSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onPlanted={setJustPlantedId}
      />
    </div>
  );
}

function GardenFlower({ app, justPlanted }: { app: Application; justPlanted: boolean }) {
  const navigate = useNavigate();
  const j = jitter(app.id);
  // spec §5.5: leads idle 7+ days droop a little and ask for water
  const idleDays = daysBetween(app.last_activity_at.slice(0, 10), localDateString());
  const thirsty = idleDays >= 7;

  return (
    <li
      className="group relative"
      style={{ transform: `translateY(${-j.dy}px)` }}
    >
      <PlantDrop animate={justPlanted}>
        <button
          type="button"
          onClick={() => navigate(`/flower/${app.id}`)}
          aria-label={`${app.company}, ${app.role} — ${STATUS_LABELS[app.status]}${thirsty ? ", getting thirsty" : ""}`}
          className="block transition-transform duration-300 group-hover:-translate-y-1.5"
          style={{
            transform: `rotate(${j.rotate + (thirsty ? 4 : 0)}deg) scale(${j.scale})`,
            filter: thirsty ? "saturate(0.6)" : undefined,
          }}
        >
          <div className="flower-sway" style={{ animationDelay: `${j.swayDelay}s` }}>
            <Flower species={app.species} stage={app.growth_stage} className="h-32 w-23" />
          </div>
        </button>
      </PlantDrop>

      {/* paper tag on hover/focus; dream companies get a golden shimmer */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-full z-10 w-max max-w-44 -translate-x-1/2 -translate-y-3 -rotate-2 overflow-hidden rounded-sm border bg-surface px-2.5 py-1.5 text-left opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 ${
          app.is_dream ? "border-marigold/60" : "border-line"
        }`}
      >
        {app.is_dream && (
          <span className="dream-shimmer absolute inset-0" aria-hidden="true" />
        )}
        <p className="truncate text-sm font-semibold text-ink">
          {app.is_dream && "★ "}
          {app.company}
        </p>
        <p className="truncate text-xs text-ink-soft">{app.role}</p>
        <p className="mt-0.5 font-mono text-xs text-leaf">
          {STATUS_LABELS[app.status]}
          {thirsty && <span className="text-mist"> · thirsty 🌢</span>}
        </p>
      </div>
    </li>
  );
}

/** The planting moment: seed drops in with a spring and a puff of dirt.
 *  Reduced motion: a simple fade. */
function PlantDrop({ animate, children }: { animate: boolean; children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (!animate) return <>{children}</>;
  if (reduceMotion) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ y: -48, scale: 0.45, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 430, damping: 17, mass: 0.9 }}
      >
        {children}
      </motion.div>
      <DirtPuff />
    </div>
  );
}

function DirtPuff() {
  const bits = [
    { x: -20, y: -8, delay: 0.1 },
    { x: 16, y: -12, delay: 0.14 },
    { x: -10, y: -18, delay: 0.18 },
    { x: 22, y: -5, delay: 0.22 },
    { x: 2, y: -22, delay: 0.16 },
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
      {bits.map((bit, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-soil"
          initial={{ x: 0, y: 0, opacity: 0.85 }}
          animate={{ x: bit.x, y: bit.y, opacity: 0 }}
          transition={{ duration: 0.55, delay: bit.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
