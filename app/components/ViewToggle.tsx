"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ViewToggleProps {
  className?: string;
}

export function ViewToggle({ className = "" }: ViewToggleProps) {
  const pathname = usePathname();
  const isFeed = pathname === "/feed";
  const isGallery = pathname === "/gallery";

  return (
    <div
      className={`inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)]/90 p-1 backdrop-blur-sm ${className}`}
      role="tablist"
      aria-label="View mode"
    >
      <Link
        href="/feed"
        role="tab"
        aria-selected={isFeed}
        className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
          isFeed
            ? "bg-[var(--accent)] text-[var(--background)]"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        Feed
      </Link>
      <Link
        href="/gallery"
        role="tab"
        aria-selected={isGallery}
        className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
          isGallery
            ? "bg-[var(--accent)] text-[var(--background)]"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        Gallery
      </Link>
    </div>
  );
}
