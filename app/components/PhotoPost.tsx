"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { downloadPhoto } from "../lib/api";
import type { Photo } from "../types";
import { ModalPortal } from "./ModalPortal";
import { PhotoEngagement } from "./PhotoEngagement";

interface PhotoPostProps {
  photos: Photo[];
  selectedId: string | null;
  getUrl: (id: string) => string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
  onUpdateJournal: (id: string, journal: string) => Promise<void>;
}

export function PhotoPost({
  photos,
  selectedId,
  getUrl,
  onClose,
  onNavigate,
  onDelete,
  onUpdateCaption,
  onUpdateJournal,
}: PhotoPostProps) {
  const reduceMotion = useReducedMotion();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editingStory, setEditingStory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const index = photos.findIndex((p) => p.id === selectedId);
  const photo = index >= 0 ? photos[index] : null;
  const url = selectedId ? getUrl(selectedId) : null;
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < photos.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(photos[index - 1].id);
  }, [hasPrev, index, onNavigate, photos]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(photos[index + 1].id);
  }, [hasNext, index, onNavigate, photos]);

  useEffect(() => {
    if (!photo) return;
    setConfirmDelete(false);
    setDownloading(false);
    setEditingStory(!photo.journal);
    scrollRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [photo, reduceMotion]);

  useEffect(() => {
    if (!photo) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [photo, onClose, goPrev, goNext]);

  const date = photo
    ? new Date(photo.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const handleDownload = useCallback(async () => {
    if (!photo || downloading) return;
    setDownloading(true);
    try {
      await downloadPhoto(photo);
    } catch {
      // ignore
    } finally {
      setDownloading(false);
    }
  }, [photo, downloading]);

  return (
    <ModalPortal>
      <AnimatePresence>
        {photo && url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="fixed inset-0 z-[100] bg-[var(--background)]"
            role="dialog"
            aria-modal="true"
            aria-label="Photo story"
          >
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto overscroll-contain"
            >
              <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur-md sm:px-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                  Back
                </button>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  {index + 1} / {photos.length}
                </p>
                <div className="w-14" aria-hidden />
              </header>

              <motion.figure
                layoutId={reduceMotion ? undefined : `photo-${photo.id}`}
                className="relative flex w-full items-center justify-center bg-[var(--surface)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={photo.caption || "Photograph"}
                  className="max-h-[min(70vh,900px)] w-full object-contain"
                  draggable={false}
                />
              </motion.figure>

              <article className="mx-auto max-w-2xl px-6 py-10 pb-32 sm:px-8 sm:py-12">
                <time className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {date}
                </time>

                <input
                  key={`caption-${photo.id}`}
                  type="text"
                  defaultValue={photo.caption || ""}
                  placeholder="Untitled"
                  className="mt-4 w-full border-0 bg-transparent text-left font-display text-3xl italic leading-tight text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:ring-0 sm:text-4xl"
                  onBlur={(e) => {
                    const val = e.target.value;
                    if (val !== (photo.caption || "")) {
                      onUpdateCaption(photo.id, val);
                    }
                  }}
                />

                <div className="mt-8 border-t border-[var(--border)] pt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                      Story
                    </p>
                    {photo.journal && !editingStory && (
                      <button
                        type="button"
                        onClick={() => setEditingStory(true)}
                        className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {editingStory ? (
                    <textarea
                      key={`journal-edit-${photo.id}`}
                      defaultValue={photo.journal || ""}
                      autoFocus
                      placeholder="Write the story behind this photograph…"
                      rows={12}
                      maxLength={5000}
                      className="photo-post-story w-full resize-y rounded-sm border border-[var(--border)] bg-[var(--card)] px-4 py-3 font-sans text-base leading-[1.85] text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] focus:outline-none"
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val !== (photo.journal || "")) {
                          void onUpdateJournal(photo.id, val);
                        }
                        setEditingStory(!val.trim());
                      }}
                    />
                  ) : photo.journal ? (
                    <div className="whitespace-pre-wrap font-sans text-base leading-[1.85] text-[var(--foreground)]">
                      {photo.journal}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingStory(true)}
                      className="font-sans text-base italic text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                    >
                      Add a story…
                    </button>
                  )}
                </div>

                <div className="mt-10 border-t border-[var(--border)] pt-8">
                  <PhotoEngagement photoId={photo.id} variant="post" />
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[var(--border)] pt-8">
                  {confirmDelete ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(photo.id);
                          onClose();
                        }}
                        className="font-mono text-[10px] uppercase tracking-widest text-red-500"
                      >
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={downloading}
                        className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] transition-colors hover:text-[var(--foreground)] disabled:opacity-40"
                      >
                        {downloading ? "Saving…" : "Download"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="font-mono text-[10px] uppercase tracking-widest text-red-400/80 transition-colors hover:text-red-500"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            </div>

            {hasPrev && (
              <button
                type="button"
                onClick={goPrev}
                className="fixed left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/90 text-[var(--muted)] backdrop-blur-sm transition-colors hover:text-[var(--foreground)] sm:left-6"
                aria-label="Previous"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
            )}

            {hasNext && (
              <button
                type="button"
                onClick={goNext}
                className="fixed right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/90 text-[var(--muted)] backdrop-blur-sm transition-colors hover:text-[var(--foreground)] sm:right-6"
                aria-label="Next"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
