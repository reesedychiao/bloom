import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useUI } from "../stores/ui";

/** Full-screen but skippable level-up moment: marigold light over the garden. */
export function LevelUpOverlay() {
  const levelUp = useUI((s) => s.levelUp);
  const setLevelUp = useUI((s) => s.setLevelUp);
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {levelUp && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Level up: level ${levelUp.level}, ${levelUp.rank}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-6"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--marigold) 55%, transparent), color-mix(in srgb, var(--soil) 55%, transparent))",
          }}
          onClick={() => setLevelUp(null)}
        >
          <motion.div
            initial={reduceMotion ? {} : { scale: 0.9, y: 12 }}
            animate={reduceMotion ? {} : { scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="rounded-3xl border border-marigold/60 bg-surface px-10 py-8 text-center shadow-xl"
          >
            <p className="font-mono text-xs text-ink-soft">The light shifts…</p>
            <h2 className="mt-2 text-3xl text-ink">Level {levelUp.level}</h2>
            <p className="mt-1 text-lg text-marigold">{levelUp.rank}</p>
            <button
              type="button"
              onClick={() => setLevelUp(null)}
              className="mt-6 rounded-lg bg-leaf px-5 py-2 font-semibold text-parchment hover:opacity-90"
            >
              Keep growing
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
