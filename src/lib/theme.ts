export type Theme = "light" | "dark";

const KEY = "bloom-theme";

/** Stored preference, else the OS setting. */
export function resolveTheme(): Theme {
  const stored = localStorage.getItem(KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme);
  applyTheme(theme);
}

/** Call once at boot, before first paint, to avoid a flash of the wrong theme. */
export function initTheme(): void {
  applyTheme(resolveTheme());
}
