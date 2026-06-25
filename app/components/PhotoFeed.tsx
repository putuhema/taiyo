"use client";

import { useCallback, useState } from "react";
import { downloadPhoto } from "../lib/api";
import type { Photo } from "../types";
import { PhotoEngagement } from "./PhotoEngagement";

interface PhotoFeedProps {
  photos: Photo[];
  getUrl: (id: string) => string | null;
  onSelect: (id: string) => void;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function PhotoFeed({ photos, getUrl, onSelect }: PhotoFeedProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = useCallback(
    async (photo: Photo) => {
      if (downloadingId) return;
      setDownloadingId(photo.id);
      try {
        await downloadPhoto(photo);
      } catch {
        // ignore
      } finally {
        setDownloadingId(null);
      }
    },
    [downloadingId],
  );

  return (
    <div className="mx-auto w-full max-w-[470px] pb-28 pt-1">
      {photos.map((photo) => {
        const url = getUrl(photo.id);
        if (!url) return null;

        return (
          <article
            key={photo.id}
            className="mb-2 border-b border-[var(--border)] bg-[var(--background)] last:mb-0"
          >
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] font-display text-sm italic text-[var(--accent)]">
                T
              </div>
              <button
                type="button"
                onClick={() => onSelect(photo.id)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate font-sans text-sm font-medium text-[var(--foreground)]">
                  taiyo
                </span>
              </button>
              <time
                className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]"
                dateTime={new Date(photo.createdAt).toISOString()}
              >
                {formatShortDate(photo.createdAt)}
              </time>
            </div>

            <button
              type="button"
              onClick={() => onSelect(photo.id)}
              className="block w-full cursor-pointer border-0 bg-[var(--surface)] p-0"
              aria-label={photo.caption || "Open post"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={photo.caption || "Photograph"}
                className="aspect-square w-full object-cover"
                draggable={false}
              />
            </button>

            <div className="px-3 pb-4 pt-2">
              <div className="flex items-center gap-3">
                <PhotoEngagement photoId={photo.id} variant="inline" />
                <button
                  type="button"
                  onClick={() => handleDownload(photo)}
                  disabled={downloadingId === photo.id}
                  className="ml-auto flex h-9 w-9 items-center justify-center text-[var(--foreground)] transition-opacity hover:opacity-70 disabled:opacity-40"
                  aria-label={downloadingId === photo.id ? "Saving photo" : "Download photo"}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden
                  >
                    <path d="M12 3v12" />
                    <path d="M7 11l5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>
                </button>
              </div>

              {photo.caption && (
                <button
                  type="button"
                  onClick={() => onSelect(photo.id)}
                  className="mt-2 block w-full text-left"
                >
                  <p className="text-sm leading-snug text-[var(--foreground)]">
                    <span className="mr-1.5 font-medium">taiyo</span>
                    <span className="text-[var(--foreground)]/90">{photo.caption}</span>
                  </p>
                </button>
              )}

              <time
                className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]"
                dateTime={new Date(photo.createdAt).toISOString()}
              >
                {formatDate(photo.createdAt)}
              </time>
            </div>
          </article>
        );
      })}
    </div>
  );
}
