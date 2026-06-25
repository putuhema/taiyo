"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { isImageFile } from "../lib/images";
import { ModalPortal } from "./ModalPortal";

interface UploadZoneProps {
  onUpload: (file: File, caption: string, journal?: string) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  hideTrigger?: boolean;
}

export function AddPhotoButton({
  variant = "desktop",
  onClick,
}: {
  variant?: "desktop" | "fab";
  onClick: () => void;
}) {
  if (variant === "fab") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Add photo"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-2xl font-light text-[var(--background)] shadow-[0_4px_24px_rgba(212,132,90,0.45)] transition-transform active:scale-95"
      >
        +
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[var(--foreground)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      <span className="text-[var(--accent)] transition-transform group-hover:rotate-90">
        +
      </span>
      Add Photo
    </button>
  );
}

export function UploadZone({
  onUpload,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
  hideTrigger = false,
}: UploadZoneProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  const [isDragging, setIsDragging] = useState(false);
  const [caption, setCaption] = useState("");
  const [journal, setJournal] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const reduceMotion = useReducedMotion();

  const reset = useCallback(() => {
    setCaption("");
    setJournal("");
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingFile(null);
    setIsDragging(false);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const close = useCallback(() => {
    reset();
    setOpen(false);
  }, [reset, setOpen]);

  const handleFile = useCallback((file: File) => {
    setError(null);

    if (!isImageFile(file)) {
      setError("Please choose an image file (JPG, PNG, HEIC, etc.)");
      return;
    }

    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingFile(file);
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
            break;
          }
        }
      }
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleSubmit = async () => {
    if (!pendingFile) return;
    setIsUploading(true);
    setError(null);
    try {
      await onUpload(pendingFile, caption, journal);
      onSuccess?.();
      close();
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "QuotaExceededError"
          ? "Storage is full. Delete some photos and try again."
          : err instanceof Error
            ? err.message
            : "Failed to save photo. Try again.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when closing
  }, [isOpen]);

  return (
    <>
      {!hideTrigger && (
        <AddPhotoButton variant="desktop" onClick={() => setOpen(true)} />
      )}

      <ModalPortal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              onClick={close}
            >
              <motion.div
                initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-lg rounded-sm border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onPaste={handlePaste}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-2xl italic text-[var(--foreground)]">
                    New photograph
                  </h2>
                  <button
                    type="button"
                    onClick={close}
                    className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    Cancel
                  </button>
                </div>

                <label
                  htmlFor={inputId}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-sm border border-dashed transition-colors ${
                    isDragging
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-[var(--border)] hover:border-[var(--accent)]/50"
                  }`}
                >
                  <input
                    id={inputId}
                    ref={inputRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />

                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-[280px] w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)]">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-[var(--muted)]"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </div>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--muted)]">
                        Drop, paste, or click to browse
                      </p>
                    </div>
                  )}
                </label>

                {error && (
                  <p className="mt-3 font-mono text-[11px] text-red-400">{error}</p>
                )}

                <div className="mt-5">
                  <label
                    htmlFor={`${inputId}-journal`}
                    className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]"
                  >
                    Story
                  </label>
                  <textarea
                    id={`${inputId}-journal`}
                    value={journal}
                    onChange={(e) => setJournal(e.target.value)}
                    placeholder="Write the story behind this moment — it will appear below the photo like a blog post."
                    rows={6}
                    maxLength={5000}
                    className="w-full resize-y rounded-sm border border-[var(--border)] bg-[var(--surface)] px-3 py-3 font-sans text-sm leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor={`${inputId}-caption`}
                    className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]"
                  >
                    Caption <span className="text-[var(--muted)]/50">(optional)</span>
                  </label>
                  <input
                    id={`${inputId}-caption`}
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="A short title for the post"
                    className="w-full border-b border-[var(--border)] bg-transparent py-2 font-display text-base italic text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!pendingFile || isUploading}
                  className="mt-6 w-full rounded-sm bg-[var(--accent)] py-3 font-mono text-[11px] uppercase tracking-widest text-[var(--background)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isUploading ? "Saving..." : "Add to Gallery"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ModalPortal>
    </>
  );
}
