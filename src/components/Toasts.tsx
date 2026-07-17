import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useUI, type Toast } from "../stores/ui";

function ToastCard({ toast }: { toast: Toast }) {
  const dismissToast = useUI((s) => s.dismissToast);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.id), 3200);
    return () => clearTimeout(timer);
  }, [toast.id, dismissToast]);

  return (
    <motion.button
      type="button"
      onClick={() => dismissToast(toast.id)}
      layout={!reduceMotion}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`pointer-events-auto rounded-xl border px-4 py-2.5 text-sm shadow-md ${
        toast.tone === "sunlight"
          ? "border-marigold/50 bg-surface text-ink"
          : "border-line bg-surface text-ink-soft"
      }`}
    >
      {toast.text}
    </motion.button>
  );
}

/** Bottom-center toast stack; tap to dismiss. */
export function Toasts() {
  const toasts = useUI((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
