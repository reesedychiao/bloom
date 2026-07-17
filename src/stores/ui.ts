import { create } from "zustand";

export interface Toast {
  id: number;
  text: string;
  /** marigold sunlight toast vs neutral notice */
  tone: "sunlight" | "notice";
}

interface UIState {
  toasts: Toast[];
  pushToast: (text: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
  levelUp: { level: number; rank: string } | null;
  setLevelUp: (v: { level: number; rank: string } | null) => void;
}

let nextToastId = 1;

export const useUI = create<UIState>((set) => ({
  toasts: [],
  pushToast: (text, tone = "sunlight") =>
    set((s) => ({ toasts: [...s.toasts, { id: nextToastId++, text, tone }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  levelUp: null,
  setLevelUp: (levelUp) => set({ levelUp }),
}));
