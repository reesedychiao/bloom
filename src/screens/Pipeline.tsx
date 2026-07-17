import { useState } from "react";
import { Link } from "react-router";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useApplications, useMoveApplication } from "../lib/api/hooks";
import { isTerminal } from "../lib/game/growth";
import { STATUS_LABELS, type Application, type Status } from "../lib/types";
import { PipelineColumn } from "../features/pipeline/PipelineColumn";

// Forward pipeline only — rejection/withdrawal/ghosting leave the board and
// route through the compost flow on the flower's detail page.
export const PIPELINE_COLUMNS: Status[] = [
  "planted",
  "outreach",
  "screening",
  "interviewing",
  "offer",
  "accepted",
];

export function Pipeline() {
  const { data: applications } = useApplications();
  const move = useMoveApplication();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const board = (applications ?? []).filter((a) => !isTerminal(a.status));
  const byStatus = (status: Status) => board.filter((a) => a.status === status);

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const overStatus = event.over?.id as Status | undefined;
    const app = board.find((a) => a.id === event.active.id);
    if (!app || !overStatus || app.status === overStatus) return;
    move.mutate({ app, status: overStatus });
  }

  function advance(app: Application, direction: 1 | -1) {
    const index = PIPELINE_COLUMNS.indexOf(app.status);
    const next = PIPELINE_COLUMNS[index + direction];
    if (next) move.mutate({ app, status: next });
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">
          ← Garden
        </Link>
        <h1 className="text-lg text-ink">Pipeline</h1>
      </header>

      <main className="px-4 py-5">
        <p className="mb-4 text-sm text-ink-soft">
          Drag a card between stages, or use the arrows. Moving a flower forward grows it.
        </p>
        <DndContext
          sensors={sensors}
          onDragStart={(e) => setActiveId(e.active.id as string)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="flex gap-3 overflow-x-auto pb-6">
            {PIPELINE_COLUMNS.map((status) => (
              <PipelineColumn
                key={status}
                status={status}
                label={STATUS_LABELS[status]}
                apps={byStatus(status)}
                activeId={activeId}
                canGoBack={PIPELINE_COLUMNS.indexOf(status) > 0}
                canGoForward={PIPELINE_COLUMNS.indexOf(status) < PIPELINE_COLUMNS.length - 1}
                onAdvance={advance}
              />
            ))}
          </div>
        </DndContext>
      </main>
    </div>
  );
}
