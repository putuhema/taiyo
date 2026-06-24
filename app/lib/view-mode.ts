export type ViewMode = "feed" | "grid";

const STORAGE_KEY = "sunset-view-mode";

export function getStoredViewMode(): ViewMode {
  if (typeof window === "undefined") return "feed";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "feed" || stored === "grid" ? stored : "feed";
}

export function setStoredViewMode(mode: ViewMode): void {
  localStorage.setItem(STORAGE_KEY, mode);
}
