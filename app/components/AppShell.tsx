"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../hooks/useTheme";
import { AddPhotoButton } from "./UploadZone";
import { BottomNav } from "./BottomNav";
import { usePhotos } from "./PhotosProvider";
import { ThemeToggle } from "./ThemeToggle";
import { ViewToggle } from "./ViewToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFeed = pathname === "/feed";
  const isGallery = pathname === "/gallery";
  const { photos, loaded, hasPhotos, setUploadOpen } = usePhotos();
  const reduceMotion = useReducedMotion();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen">
      <div className="grain pointer-events-none fixed inset-0 z-0" />

      {!isFeed && (
        <div className="fixed right-4 top-4 z-40 pt-[env(safe-area-inset-top)] sm:right-10 sm:top-8">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      )}

      {isFeed && hasPhotos && (
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
          <div className="mx-auto grid max-w-[470px] grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:max-w-none sm:grid-cols-[1fr_auto_1fr] sm:px-6">
            <div className="hidden sm:block" />
            <Link href="/feed" className="col-start-2 text-center sm:col-start-2">
              <h1 className="font-display text-xl italic leading-none text-[var(--foreground)]">
                Taiyō
                <span className="ml-1 font-sans text-[10px] font-light not-italic tracking-wide text-[var(--muted)]">
                  by Pumadara
                </span>
              </h1>
            </Link>
            <div className="flex items-center justify-end gap-2">
              <div className="hidden sm:block">
                <ViewToggle />
              </div>
              <ThemeToggle theme={theme} onToggle={toggleTheme} className="!h-9 !w-9" />
            </div>
          </div>
        </header>
      )}

      {isGallery && hasPhotos && (
        <header className="relative mx-auto flex max-w-[935px] flex-col gap-6 px-4 pb-6 pr-16 pt-14 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:pb-8 sm:pr-10 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] font-display text-3xl italic text-[var(--accent)] sm:h-24 sm:w-24 sm:text-4xl">
                T
              </div>
              <div>
                <h1 className="font-display text-2xl italic leading-none text-[var(--foreground)] sm:text-3xl">
                  taiyo
                </h1>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]">
                  {photos.length} post{photos.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <p className="max-w-sm font-sans text-sm leading-relaxed text-[var(--muted)]">
              A quiet place for your photographs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.3, duration: reduceMotion ? 0 : 0.5 }}
            className="hidden shrink-0 items-center gap-3 sm:flex"
          >
            <ViewToggle />
            <AddPhotoButton variant="desktop" onClick={() => setUploadOpen(true)} />
          </motion.div>
        </header>
      )}

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
      ) : (
        <main className="relative z-10">{children}</main>
      )}

      {isGallery && hasPhotos && (
        <footer className="relative z-10 hidden border-t border-[var(--border)] py-8 text-center sm:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]/50">
            stored on vercel blob
          </p>
        </footer>
      )}

      <BottomNav onAdd={() => setUploadOpen(true)} hasPhotos={hasPhotos} />
    </div>
  );
}
