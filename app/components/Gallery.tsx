"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addPhoto,
  deletePhoto,
  getAllPhotos,
  updatePhotoCaption,
} from "../lib/api";
import { getStoredViewMode, setStoredViewMode, type ViewMode } from "../lib/view-mode";
import type { Photo } from "../types";
import { BottomNav } from "./BottomNav";
import { Lightbox } from "./Lightbox";
import { PhotoFeed } from "./PhotoFeed";
import { PhotoGrid } from "./PhotoGrid";
import { ThemeToggle } from "./ThemeToggle";
import { Toast } from "./Toast";
import { UploadZone, AddPhotoButton } from "./UploadZone";
import { ViewToggle } from "./ViewToggle";
import { useTheme } from "../hooks/useTheme";

export function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [feedStartIndex, setFeedStartIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setViewMode(getStoredViewMode());
  }, []);

  const handleViewChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setStoredViewMode(mode);
  }, []);

  const thumbUrls = useMemo(() => {
    const map = new Map<string, string>();
    for (const photo of photos) {
      map.set(photo.id, photo.thumbUrl);
    }
    return map;
  }, [photos]);

  const fullUrls = useMemo(() => {
    const map = new Map<string, string>();
    for (const photo of photos) {
      map.set(photo.id, photo.url);
    }
    return map;
  }, [photos]);

  useEffect(() => {
    getAllPhotos()
      .then((data) => {
        setPhotos(data);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  const handleUpload = useCallback(async (file: File, caption: string) => {
    const photo = await addPhoto(file, caption);
    setPhotos((prev) => [photo, ...prev]);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await deletePhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleUpdateCaption = useCallback(async (id: string, caption: string) => {
    const updated = await updatePhotoCaption(id, caption);
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? updated : p)),
    );
  }, []);

  const handleNavigate = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const isFeed = viewMode === "feed" && photos.length > 0;
  const hasPhotos = photos.length > 0;

  return (
    <div className={`relative ${isFeed ? "h-[100dvh] overflow-hidden" : "min-h-screen"}`}>
      <div className="grain pointer-events-none fixed inset-0 z-0" />

      {!isFeed && (
        <div className="fixed right-4 top-4 z-40 pt-[env(safe-area-inset-top)] sm:right-10 sm:top-8">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      )}

      <header
        className={`z-20 ${
          isFeed
            ? "fixed inset-x-0 top-0 grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2 px-4 pb-6 pt-[calc(env(safe-area-inset-top)+1rem)] sm:px-6"
            : "relative mx-auto flex max-w-7xl flex-col gap-6 px-6 pb-8 pr-16 pt-14 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:pb-12 sm:pr-10 sm:pt-24"
        }`}
        style={
          isFeed
            ? {
                background:
                  "linear-gradient(to bottom, var(--feed-header-from), transparent)",
              }
            : undefined
        }
      >
        {isFeed ? (
          <>
            <div aria-hidden className="h-9 w-9" />
            <motion.h1
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="col-start-2 text-center font-display text-xl italic leading-none text-[var(--foreground)]"
            >
              Taiyō
              <span className="ml-1 font-sans text-[10px] font-light not-italic tracking-wide text-[var(--muted)]">
                by Pumadara
              </span>
            </motion.h1>
            <div className="justify-self-end">
              <ThemeToggle
                theme={theme}
                onToggle={toggleTheme}
                className="!h-9 !w-9"
              />
            </div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-2 hidden font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)] sm:block">
                Personal Collection
              </p>
              <h1 className="font-display text-4xl italic leading-none text-[var(--foreground)] sm:text-7xl">
                Taiyō
                <span className="mt-2 block font-sans text-sm font-light not-italic text-[var(--muted)] sm:mt-3">
                  by Pumadara
                </span>
              </h1>
              <p className="mt-4 hidden max-w-sm font-sans text-sm leading-relaxed text-[var(--muted)] sm:block">
                A quiet place for your photographs. Upload, caption, and grow your eye.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduceMotion ? 0 : 0.3, duration: reduceMotion ? 0 : 0.5 }}
              className="hidden shrink-0 items-center gap-3 sm:flex"
            >
              {hasPhotos && (
                <ViewToggle mode={viewMode} onChange={handleViewChange} />
              )}
              <AddPhotoButton variant="desktop" onClick={() => setUploadOpen(true)} />
            </motion.div>
          </>
        )}
      </header>

      {!loaded ? (
        <main className="relative z-10 flex h-40 items-center justify-center">
          <div className="h-px w-16 animate-pulse bg-[var(--accent)]/40" />
        </main>
      ) : !hasPhotos ? (
        <main className="relative z-10 mx-auto max-w-7xl px-6 pb-32 sm:px-10 sm:pb-24">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.2 }}
            onClick={() => setUploadOpen(true)}
            className="flex w-full cursor-pointer flex-col items-center justify-center py-32 text-center"
          >
            <div className="mb-6 h-px w-12 bg-[var(--border)]" />
            <p className="font-display text-2xl italic text-[var(--muted)]">
              Your gallery is empty
            </p>
            <p className="mt-2 max-w-xs font-sans text-sm text-[var(--muted)]/70">
              Tap Add below to upload your first photograph.
            </p>
          </motion.button>
        </main>
      ) : isFeed ? (
        <PhotoFeed
          photos={photos}
          getUrl={(id) => fullUrls.get(id) ?? null}
          initialIndex={feedStartIndex}
          onSelect={setSelectedId}
        />
      ) : (
        <main className="relative z-10 mx-auto max-w-7xl px-6 pb-32 sm:px-10 sm:pb-24">
          <PhotoGrid
            photos={photos}
            thumbUrls={thumbUrls}
            onSelect={(id) => {
              const idx = photos.findIndex((p) => p.id === id);
              setFeedStartIndex(idx >= 0 ? idx : 0);
              setSelectedId(id);
            }}
          />
        </main>
      )}

      {!isFeed && hasPhotos && (
        <footer className="relative z-10 hidden border-t border-[var(--border)] py-8 text-center sm:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]/50">
            {photos.length} photograph{photos.length !== 1 ? "s" : ""} · stored on vercel blob
          </p>
        </footer>
      )}

      <BottomNav
        mode={viewMode}
        onModeChange={handleViewChange}
        onAdd={() => setUploadOpen(true)}
        hasPhotos={hasPhotos}
      />

      <UploadZone
        hideTrigger
        onUpload={handleUpload}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={() => setToast("Photo added to gallery")}
      />

      <Lightbox
        photos={photos}
        selectedId={selectedId}
        getUrl={(id) => fullUrls.get(id) ?? null}
        onClose={() => setSelectedId(null)}
        onNavigate={handleNavigate}
        onDelete={handleDelete}
        onUpdateCaption={handleUpdateCaption}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
