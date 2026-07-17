import { useNavigate } from "react-router";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { Flower } from "../../assets/flowers/Flower";
import type { Application } from "../../lib/types";

export function PipelineCard({
  app,
  dragging,
  canGoBack,
  canGoForward,
  onAdvance,
}: {
  app: Application;
  dragging: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onAdvance: (app: Application, direction: 1 | -1) => void;
}) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: app.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: dragging ? 0.4 : 1 }}
      className="rounded-lg border border-line bg-canvas p-2"
    >
      <div className="flex items-center gap-2">
        {/* drag handle — grabbable area, keyboard-activatable */}
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none rounded active:cursor-grabbing"
          aria-label={`Drag ${app.company}`}
          {...listeners}
          {...attributes}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={app.growth_stage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="block"
            >
              <Flower species={app.species} stage={app.growth_stage} className="h-12 w-9" />
            </motion.span>
          </AnimatePresence>
        </button>

        <button
          type="button"
          onClick={() => navigate(`/flower/${app.id}`)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-sm font-semibold text-ink">{app.company}</p>
          <p className="truncate text-xs text-ink-soft">{app.role}</p>
        </button>
      </div>

      <div className="mt-1.5 flex justify-between">
        <button
          type="button"
          disabled={!canGoBack}
          onClick={() => onAdvance(app, -1)}
          aria-label={`Move ${app.company} back a stage`}
          className="rounded px-2 py-0.5 text-sm text-ink-soft hover:text-ink disabled:opacity-30"
        >
          ←
        </button>
        <button
          type="button"
          disabled={!canGoForward}
          onClick={() => onAdvance(app, 1)}
          aria-label={`Advance ${app.company} a stage`}
          className="rounded px-2 py-0.5 text-sm text-leaf hover:text-ink disabled:opacity-30"
        >
          →
        </button>
      </div>
    </li>
  );
}
