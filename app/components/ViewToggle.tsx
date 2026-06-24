"use client";

import type { ViewMode } from "../lib/view-mode";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ mode, onChange, className = "" }: ViewToggleProps) {
  return (
    <div
      className={`inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)]/90 p-1 backdrop-blur-sm ${className}`}
      role="tablist"
      aria-label="View mode"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "feed"}
        onClick={() => onChange("feed")}
        className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
          mode === "feed"
            ? "bg-[var(--accent)] text-[var(--background)]"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        Feed
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "grid"}
        onClick={() => onChange("grid")}
        className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
          mode === "grid"
            ? "bg-[var(--accent)] text-[var(--background)]"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        Grid
      </button>
    </div>
  );
}
