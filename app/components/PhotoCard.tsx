"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { Photo } from "../types";

interface PhotoCardProps {
  photo: Photo;
  url: string;
  index: number;
  onClick: () => void;
}

export function PhotoCard({ photo, url, index, onClick }: PhotoCardProps) {
  const reduceMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.button
      type="button"
      layoutId={reduceMotion ? undefined : `photo-${photo.id}`}
      initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0 : 0.4,
        delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.35),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="photo-grid-item group relative aspect-square w-full overflow-hidden rounded-sm bg-[var(--surface)]"
      onClick={onClick}
      aria-label={photo.caption ? `Open ${photo.caption}` : "Open photograph"}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-[var(--border)]" />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={photo.caption || "Photograph"}
        className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05] group-active:scale-[0.98] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        draggable={false}
      />

      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

      {photo.journal && (
        <span
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/45 text-white/85 backdrop-blur-sm"
          aria-hidden
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
        </span>
      )}
    </motion.button>
  );
}
