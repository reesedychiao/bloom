import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCompost } from "../../lib/api/hooks";
import type { Application } from "../../lib/types";

/**
 * The compost moment. Rejection copy stays warm and matter-of-fact —
 * compost is fuel, never failure. The lesson note is what earns the
 * Sunlight (+15); skipping it still composts, just without the bonus.
 */
export function CompostDialog({
  app,
  open,
  onClose,
}: {
  app: Application;
  open: boolean;
  onClose: () => void;
}) {
  const [lesson, setLesson] = useState("");
  const compost = useCompost(app);
  const reduceMotion = useReducedMotion();

  function confirm() {
    compost.mutate(lesson, { onSuccess: () => onClose() });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40 bg-soil/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Compost this application"
            className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-6"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onKeyDown={(event) => event.key === "Escape" && onClose()}
          >
            <h2 className="text-xl text-ink">Compost this one</h2>
            <p className="mt-2 text-sm text-ink-soft">
              {app.company} said no. Its season is over — but compost feeds everything you
              plant next. One line: what did this one teach you?
            </p>
            <textarea
              autoFocus
              rows={2}
              value={lesson}
              onChange={(event) => setLesson(event.target.value)}
              placeholder="e.g. Lead with the shipped project, not the coursework"
              className="mt-3 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mist"
            />
            <p className="mt-1 font-mono text-xs text-ink-soft">
              {lesson.trim() ? "+15 ☀ for the lesson" : "no note, no bonus — that's okay too"}
            </p>
            {compost.isError && (
              <p role="alert" className="mt-2 text-sm text-petal">
                {(compost.error as Error).message}
              </p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-line px-4 py-2 text-sm text-ink-soft hover:text-ink"
              >
                Not yet
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={compost.isPending}
                className="flex-1 rounded-lg bg-leaf-deep px-4 py-2 text-sm font-semibold text-parchment hover:opacity-90 disabled:opacity-60"
              >
                {compost.isPending ? "Composting…" : "Compost"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
