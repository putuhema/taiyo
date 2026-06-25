"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { ModalPortal } from "./ModalPortal";

export interface CommentItem {
  _id: Id<"comments">;
  author: string;
  body: string;
  clientId: string;
  createdAt: number;
}

interface CommentDrawerProps {
  open: boolean;
  onClose: () => void;
  comments: CommentItem[] | undefined;
  commentCount: number;
  clientId: string;
  savedAuthor: string;
  nameInput: string;
  onNameInputChange: (value: string) => void;
  commentBody: string;
  onCommentBodyChange: (value: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onRemove: (commentId: Id<"comments">) => void;
  formatRelativeTime: (timestamp: number) => string;
}

function authorInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function CommentDrawer({
  open,
  onClose,
  comments,
  commentCount,
  clientId,
  savedAuthor,
  nameInput,
  onNameInputChange,
  commentBody,
  onCommentBodyChange,
  submitting,
  onSubmit,
  onRemove,
  formatRelativeTime,
}: CommentDrawerProps) {
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const displayName = savedAuthor || nameInput;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 280);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <ModalPortal>
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close comments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]"
              onClick={handleBackdropClick}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Comments"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", damping: 32, stiffness: 340 }
              }
              drag={reduceMotion ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.35 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) onClose();
              }}
              className="comment-drawer fixed inset-x-0 bottom-0 z-[120] flex h-[75dvh] max-h-[640px] flex-col rounded-t-2xl shadow-[0_-12px_40px_rgba(0,0,0,0.35)]"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="comment-drawer-header shrink-0 border-b px-4 pb-3 pt-3">
                <div className="comment-drawer-handle mx-auto mb-3 h-1 w-10 rounded-full" aria-hidden />
                <div className="relative flex items-center justify-center">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--drawer-muted)]">
                    {commentCount} comment{commentCount !== 1 ? "s" : ""}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-0 flex h-8 w-8 items-center justify-center rounded-full text-[var(--drawer-muted)] transition-colors hover:text-[var(--drawer-text)]"
                    aria-label="Close"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              </header>

              <div className="comment-drawer-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
                {comments === undefined ? (
                  <p className="py-8 text-center font-mono text-[10px] uppercase tracking-widest text-[var(--drawer-muted)]">
                    Loading…
                  </p>
                ) : comments.length === 0 ? (
                  <p className="py-12 text-center font-display text-lg italic text-[var(--drawer-muted)]">
                    Be the first to comment
                  </p>
                ) : (
                  <ul className="flex flex-col gap-5 pb-2">
                    {comments.map((comment) => (
                      <li key={comment._id} className="group flex gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs uppercase text-[var(--drawer-avatar-text)]"
                          style={{ background: "var(--drawer-avatar-bg)" }}
                          aria-hidden
                        >
                          {authorInitial(comment.author)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-[var(--drawer-author)]">
                            {comment.author}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-[var(--drawer-text)]">
                            {comment.body}
                          </p>
                          <div className="mt-1.5 flex items-center gap-3">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--drawer-muted)]">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                            {comment.clientId === clientId && (
                              <button
                                type="button"
                                onClick={() => onRemove(comment._id)}
                                className="font-mono text-[9px] uppercase tracking-widest text-[var(--drawer-muted)] hover:text-red-400"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <form
                onSubmit={onSubmit}
                className="comment-drawer-composer relative z-10 shrink-0 border-t px-4 pb-[max(1.75rem,calc(env(safe-area-inset-bottom)+1rem))] pt-3"
              >
                {!savedAuthor && (
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => onNameInputChange(e.target.value)}
                    placeholder="Your name"
                    maxLength={40}
                    className="comment-drawer-input mb-2 w-full rounded-full px-4 py-2 text-sm focus:outline-none"
                  />
                )}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs uppercase text-[var(--drawer-avatar-text)]"
                    style={{ background: "var(--drawer-avatar-bg)" }}
                    aria-hidden
                  >
                    {authorInitial(displayName || "?")}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={commentBody}
                    onChange={(e) => onCommentBodyChange(e.target.value)}
                    placeholder="Add comment…"
                    maxLength={500}
                    enterKeyHint="send"
                    className="comment-drawer-input min-w-0 flex-1 rounded-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !commentBody.trim() || !(savedAuthor || nameInput.trim())}
                    className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-[var(--drawer-accent)] transition-opacity disabled:opacity-35"
                  >
                    {submitting ? "…" : "Post"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
