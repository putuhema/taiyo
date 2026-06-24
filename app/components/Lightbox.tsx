"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "../types";
import { ModalPortal } from "./ModalPortal";

interface LightboxProps {
  photos: Photo[];
  selectedId: string | null;
  getUrl: (id: string) => string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
}

const SWIPE_THRESHOLD = 80;

export function Lightbox({
  photos,
  selectedId,
  getUrl,
  onClose,
  onNavigate,
  onDelete,
  onUpdateCaption,
}: LightboxProps) {
  const reduceMotion = useReducedMotion();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [slideDir, setSlideDir] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  const index = photos.findIndex((p) => p.id === selectedId);
  const photo = index >= 0 ? photos[index] : null;
  const url = selectedId ? getUrl(selectedId) : null;
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < photos.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) {
      setSlideDir(-1);
      onNavigate(photos[index - 1].id);
    }
  }, [hasPrev, index, onNavigate, photos]);

  const goNext = useCallback(() => {
    if (hasNext) {
      setSlideDir(1);
      onNavigate(photos[index + 1].id);
    }
  }, [hasNext, index, onNavigate, photos]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    },
    [onClose, goPrev, goNext],
  );

  useEffect(() => {
    if (!photo) return;
    setConfirmDelete(false);
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [photo, handleKeyDown]);

  const date = photo
    ? new Date(photo.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const slideVariants = {
    enter: (dir: number) => ({
      x: reduceMotion ? 0 : dir > 0 ? 40 : -40,
      opacity: reduceMotion ? 1 : 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: reduceMotion ? 0 : dir > 0 ? -40 : 40,
      opacity: reduceMotion ? 1 : 0,
    }),
  };

  return (
    <ModalPortal>
      <AnimatePresence>
        {photo && url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            {hasPrev && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white sm:left-4"
                aria-label="Previous photo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
            )}

            {hasNext && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white sm:right-4"
                aria-label="Next photo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            )}

            <motion.div
              ref={dialogRef}
              tabIndex={-1}
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex max-h-full w-full max-w-5xl flex-col gap-4 outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {index + 1} / {photos.length}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="font-mono text-xs uppercase tracking-widest text-white/50 transition-colors hover:text-white"
                  aria-label="Close"
                >
                  Close
                </button>
              </div>

              <div className="relative overflow-hidden rounded-sm">
                <AnimatePresence mode="wait" custom={slideDir}>
                  <motion.div
                    key={photo.id}
                    custom={slideDir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                    drag={reduceMotion ? false : "x"}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -SWIPE_THRESHOLD) goNext();
                      else if (info.offset.x > SWIPE_THRESHOLD) goPrev();
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={photo.caption || "Photograph"}
                      className="max-h-[70vh] w-full object-contain select-none"
                      draggable={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <time className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                {date}
              </time>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex-1">
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Caption
                  </label>
                  <input
                    key={photo.id}
                    type="text"
                    defaultValue={photo.caption || ""}
                    placeholder="Add a caption..."
                    className="w-full border-b border-white/20 bg-transparent py-2 font-display text-lg italic text-white/90 placeholder:text-white/30 focus:border-[var(--accent)] focus:outline-none"
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val !== (photo.caption || "")) {
                        onUpdateCaption(photo.id, val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
                  />
                </div>

                {confirmDelete ? (
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(photo.id);
                        onClose();
                      }}
                      className="font-mono text-[10px] uppercase tracking-widest text-red-400"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white/70"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-red-400/70 transition-colors hover:text-red-400"
                  >
                    Delete
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
