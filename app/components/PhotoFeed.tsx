"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "../types";

interface PhotoFeedProps {
  photos: Photo[];
  getUrl: (id: string) => string | null;
  initialIndex?: number;
  onSelect: (id: string) => void;
}

export function PhotoFeed({
  photos,
  getUrl,
  initialIndex = 0,
  onSelect,
}: PhotoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const reduceMotion = useReducedMotion();

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container) return;
      const slide = container.children[index] as HTMLElement | undefined;
      slide?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    },
    [reduceMotion],
  );

  useEffect(() => {
    if (initialIndex > 0) {
      requestAnimationFrame(() => scrollToIndex(initialIndex));
    }
  }, [initialIndex, scrollToIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: [0.6] },
    );

    for (const child of container.children) {
      observer.observe(child);
    }

    return () => observer.disconnect();
  }, [photos]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scrollToIndex(Math.min(activeIndex + 1, photos.length - 1));
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scrollToIndex(Math.max(activeIndex - 1, 0));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, photos.length, scrollToIndex]);

  return (
    <div className="relative h-[100dvh] w-full bg-[var(--feed-bg)]">
      <div
        ref={containerRef}
        className="feed-scroll h-full w-full overflow-y-auto overscroll-y-contain"
      >
        {photos.map((photo, i) => {
          const url = getUrl(photo.id);
          if (!url) return null;

          const date = new Date(photo.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });

          return (
            <section
              key={photo.id}
              data-index={i}
              className="feed-slide relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-[var(--feed-bg)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={photo.caption || "Photograph"}
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />

              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-36 pt-24 sm:pb-28"
                style={{
                  background:
                    "linear-gradient(to top, var(--feed-overlay-from), var(--feed-overlay-via), transparent)",
                }}
              >
                <div className="mx-auto max-w-lg">
                  {photo.caption ? (
                    <p
                      className="font-display text-lg italic leading-snug sm:text-xl"
                      style={{ color: "var(--feed-caption)" }}
                    >
                      {photo.caption}
                    </p>
                  ) : (
                    <p
                      className="font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: "var(--feed-caption-muted)" }}
                    >
                      No caption
                    </p>
                  )}
                  <time
                    className="mt-2 block font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: "var(--feed-date)" }}
                  >
                    {date}
                  </time>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelect(photo.id)}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full font-mono text-[10px] backdrop-blur-sm transition-colors"
                style={{
                  background: "var(--feed-action-bg)",
                  color: "var(--feed-action-text)",
                }}
                aria-label="View details"
              >
                ···
              </button>
            </section>
          );
        })}
      </div>

      <p
        className="pointer-events-none absolute bottom-[5.5rem] left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest sm:bottom-20"
        style={{ color: "var(--feed-counter)" }}
      >
        {activeIndex + 1} / {photos.length}
      </p>
    </div>
  );
}
