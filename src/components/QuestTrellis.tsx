import { motion, useReducedMotion } from "framer-motion";
import { useTodayQuests } from "../lib/api/hooks";
import { QUEST_HINTS } from "../lib/game/quests";
import type { Quest } from "../lib/types";

const LINE = 32; // px — ruled-line pitch; list rows must match to sit on the lines

/** Today's quests as a torn-off notepad page: ruled lines, handwritten
 *  entries, and a satisfying cross-out when a task completes. */
export function QuestTrellis() {
  const { data: quests } = useTodayQuests();
  if (!quests || quests.length === 0) return null;

  const ordered = [
    ...quests.filter((q) => q.kind === "daily"),
    ...quests.filter((q) => q.kind === "weekly"),
  ];

  return (
    <section
      aria-label="Today's quests"
      className="mx-auto mt-4 max-w-md rounded-lg border border-line bg-surface shadow-sm"
    >
      {/* margin line down the left, like a jotter */}
      <div className="relative overflow-hidden rounded-lg pl-9 pr-4 pb-3">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-6 w-px"
          style={{ background: "color-mix(in srgb, var(--petal) 45%, transparent)" }}
        />
        <h2 className="flex h-10 items-end font-script text-xl text-ink-soft">Today</h2>
        <ul
          style={{
            backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${LINE - 1}px, var(--border) ${LINE - 1}px, var(--border) ${LINE}px)`,
          }}
        >
          {ordered.map((quest) => (
            <QuestLine key={quest.id} quest={quest} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function QuestLine({ quest }: { quest: Quest }) {
  const reduceMotion = useReducedMotion();
  const done = quest.completed_at !== null;

  return (
    <li
      title={QUEST_HINTS[quest.title]}
      className="flex items-center gap-2"
      style={{ height: LINE }}
    >
      <span className={`relative font-script text-lg ${done ? "text-ink-soft" : "text-ink"}`}>
        {quest.title}
        {quest.kind === "weekly" && (
          <span className="ml-1.5 font-mono text-xs text-ink-soft">wk</span>
        )}
        {/* the hand-drawn cross-out */}
        {done && (
          <motion.span
            aria-hidden="true"
            initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="absolute -left-1 -right-1 top-[58%] h-[2px] origin-left rounded-full"
            style={{ background: "color-mix(in srgb, var(--petal) 80%, var(--soil))" }}
          />
        )}
      </span>
      <span className="ml-auto font-mono text-xs text-ink-soft">
        {quest.target > 1 ? `${Math.min(quest.progress, quest.target)}/${quest.target} · ` : ""}
        +{quest.reward} ☀
      </span>
    </li>
  );
}
