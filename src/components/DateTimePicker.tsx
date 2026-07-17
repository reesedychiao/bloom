import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * A calendar + time picker drawn entirely from the design tokens, so date
 * selection matches the garden in both day and night themes instead of
 * falling back to the browser's native (un-themeable) popup.
 *
 * Value + onChange use a local "YYYY-MM-DDTHH:mm" string, the same shape a
 * native datetime-local input produces, so callers are unaffected.
 */

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function parseValue(value: string): { date: Date | null; hour: number; minute: number } {
  if (!value) return { date: null, hour: 9, minute: 0 };
  const [datePart, timePart] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = (timePart ?? "09:00").split(":").map(Number);
  return { date: new Date(y, m - 1, d), hour: hh, minute: mm };
}

/** Monday-first day-of-week (0 = Monday). */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function DateTimePicker({
  value,
  onChange,
  required,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { date: selected, hour, minute } = parseValue(value);
  const [viewMonth, setViewMonth] = useState(() => selected ?? new Date());

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function emit(next: { date?: Date | null; hour?: number; minute?: number }) {
    const d = next.date ?? selected;
    if (!d) return;
    const h = next.hour ?? hour;
    const mnt = next.minute ?? minute;
    onChange(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad(mnt)}`);
  }

  const label = selected
    ? `${selected.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · ${pad(hour)}:${pad(minute)}`
    : "Pick a date & time";

  // build the calendar grid for the viewed month
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const leadingBlanks = mondayIndex(first);
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();
  function isToday(day: number): boolean {
    return (
      today.getFullYear() === viewMonth.getFullYear() &&
      today.getMonth() === viewMonth.getMonth() &&
      today.getDate() === day
    );
  }
  function isSelected(day: number): boolean {
    return (
      !!selected &&
      selected.getFullYear() === viewMonth.getFullYear() &&
      selected.getMonth() === viewMonth.getMonth() &&
      selected.getDate() === day
    );
  }

  function shiftMonth(delta: number) {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm ${
          selected ? "border-line text-ink" : "border-line text-mist"
        } bg-canvas hover:border-mist`}
      >
        <span>{label}</span>
        <span aria-hidden="true" className="text-ink-soft">📅</span>
      </button>
      {/* keep the form's required-field semantics without a native date input */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value={value}
          onChange={() => {}}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Choose date and time"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-72 rounded-xl border border-line bg-surface p-3 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
                className="rounded-md px-2 py-1 text-ink-soft hover:bg-canvas hover:text-ink"
              >
                ‹
              </button>
              <span className="text-sm font-semibold text-ink">
                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </span>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
                className="rounded-md px-2 py-1 text-ink-soft hover:bg-canvas hover:text-ink"
              >
                ›
              </button>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-0.5 text-center">
              {WEEKDAYS.map((w) => (
                <span key={w} className="py-1 font-mono text-[10px] uppercase text-mist">
                  {w}
                </span>
              ))}
              {cells.map((day, i) =>
                day === null ? (
                  <span key={`blank-${i}`} />
                ) : (
                  <button
                    key={day}
                    type="button"
                    onClick={() => emit({ date: new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day) })}
                    aria-pressed={isSelected(day)}
                    className={`rounded-md py-1.5 text-sm transition-colors ${
                      isSelected(day)
                        ? "bg-leaf-deep font-semibold text-parchment"
                        : isToday(day)
                          ? "text-ink ring-1 ring-marigold ring-inset hover:bg-canvas"
                          : "text-ink hover:bg-canvas"
                    }`}
                  >
                    {day}
                  </button>
                ),
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
              <span className="text-sm text-ink-soft">Time</span>
              <select
                aria-label="Hour"
                value={hour}
                onChange={(e) => emit({ hour: Number(e.target.value) })}
                className="rounded-md border border-line bg-canvas px-2 py-1 font-mono text-sm text-ink"
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {pad(h)}
                  </option>
                ))}
              </select>
              <span className="font-mono text-ink-soft">:</span>
              <select
                aria-label="Minute"
                value={minute}
                onChange={(e) => emit({ minute: Number(e.target.value) })}
                className="rounded-md border border-line bg-canvas px-2 py-1 font-mono text-sm text-ink"
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <option key={m} value={m}>
                    {pad(m)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto rounded-md bg-leaf-deep px-3 py-1 text-sm font-semibold text-parchment hover:opacity-90"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
