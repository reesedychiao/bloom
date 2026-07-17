import { useDroppable } from "@dnd-kit/core";
import type { Application, Status } from "../../lib/types";
import { PipelineCard } from "./PipelineCard";

export function PipelineColumn({
  status,
  label,
  apps,
  activeId,
  canGoBack,
  canGoForward,
  onAdvance,
}: {
  status: Status;
  label: string;
  apps: Application[];
  activeId: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
  onAdvance: (app: Application, direction: 1 | -1) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      aria-label={`${label} — ${apps.length}`}
      className={`flex w-56 shrink-0 flex-col rounded-xl border p-2 transition-colors ${
        isOver ? "border-leaf bg-leaf/5" : "border-line bg-surface"
      }`}
    >
      <h2 className="flex items-center justify-between px-1 py-1.5">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="font-mono text-xs text-ink-soft">{apps.length}</span>
      </h2>
      <ul className="flex flex-1 flex-col gap-2">
        {apps.map((app) => (
          <PipelineCard
            key={app.id}
            app={app}
            dragging={activeId === app.id}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onAdvance={onAdvance}
          />
        ))}
        {apps.length === 0 && (
          <li className="px-1 py-3 text-xs text-mist">Nothing here yet.</li>
        )}
      </ul>
    </section>
  );
}
