"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { GridSize } from "../lib/grid-layout";
import type { Photo } from "../types";

interface PhotoCardProps {
  photo: Photo;
  url: string;
  index: number;
  size: GridSize;
  onClick: () => void;
}

export function PhotoCard({ photo, url, index, size, onClick }: PhotoCardProps) {
  const reduceMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);

  const date = new Date(photo.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isFeatured = size === "featured";

  return (
    <motion.article
      initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.5),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative h-full min-h-[200px] cursor-pointer overflow-hidden rounded-sm bg-[var(--surface)] ${
        isFeatured ? "ring-1 ring-[var(--accent)]/25" : ""
      }`}
      onClick={onClick}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-[var(--border)]" />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={photo.caption || "Photograph"}
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100" />

      <div className="absolute inset-x-0 bottom-0 translate-y-1 p-4 opacity-100 transition-all duration-500 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
        {photo.caption && (
          <p
            className={`font-display italic leading-snug text-white/95 ${
              isFeatured ? "text-base sm:text-lg" : "text-sm"
            }`}
          >
            {photo.caption}
          </p>
        )}
        <time className="mt-1.5 block font-mono text-[10px] uppercase tracking-widest text-white/50">
          {date}
        </time>
      </div>

      <span className="absolute right-3 top-3 font-mono text-[10px] tracking-widest text-white/0 transition-colors duration-300 group-hover:text-white/40">
        {String(index + 1).padStart(2, "0")}
      </span>
    </motion.article>
  );
}
