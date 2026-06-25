"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { getAuthorName, getClientId, setAuthorName } from "../lib/client-id";
import { CommentDrawer } from "./CommentDrawer";

interface PhotoEngagementProps {
  photoId: string;
  variant: "lightbox" | "feed" | "inline" | "post";
  trailing?: React.ReactNode;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.floor(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function PhotoEngagementInner({ photoId, variant, trailing }: PhotoEngagementProps) {
  const [clientId, setClientId] = useState("");
  const [savedAuthor, setSavedAuthor] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setClientId(getClientId());
    const saved = getAuthorName();
    setSavedAuthor(saved);
    setNameInput(saved);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const likes = useQuery(api.likes.getByPhoto, clientId ? { photoId, clientId } : "skip");
  const comments = useQuery(api.comments.listByPhoto, { photoId });
  const toggleLike = useMutation(api.likes.toggle);
  const addComment = useMutation(api.comments.add);
  const removeComment = useMutation(api.comments.remove);

  const handleToggleLike = useCallback(async () => {
    if (!clientId) return;
    await toggleLike({ photoId, clientId });
  }, [clientId, photoId, toggleLike]);

  const handleSubmitComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!clientId || !commentBody.trim()) return;

      const author = (savedAuthor || nameInput).trim();
      if (!author) return;

      setSubmitting(true);
      try {
        setAuthorName(author);
        setSavedAuthor(author);
        await addComment({
          photoId,
          author,
          body: commentBody.trim(),
          clientId,
        });
        setCommentBody("");
      } finally {
        setSubmitting(false);
      }
    },
    [addComment, savedAuthor, nameInput, clientId, commentBody, photoId],
  );

  const handleRemoveComment = useCallback(
    async (commentId: Id<"comments">) => {
      if (!clientId) return;
      await removeComment({ commentId, clientId });
    },
    [clientId, removeComment],
  );

  const likeCount = likes?.count ?? 0;
  const liked = likes?.liked ?? false;
  const commentCount = comments?.length ?? 0;
  const isFeed = variant === "feed";
  const isInline = variant === "inline";
  const isPost = variant === "post";

  const railButtonClass = isFeed
    ? "flex flex-col items-center gap-1 text-[var(--feed-action-text)] transition-transform active:scale-95"
    : isInline
      ? "flex h-9 w-9 items-center justify-center text-[var(--foreground)] transition-opacity hover:opacity-70"
      : isPost
        ? "flex items-center gap-2 text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        : "flex items-center gap-2 text-white/50 transition-colors hover:text-white";

  const countClass = isFeed
    ? "font-mono text-[10px] font-medium tabular-nums text-[var(--feed-caption)]"
    : isInline
      ? "sr-only"
      : isPost
        ? "font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]"
        : "font-mono text-[10px] uppercase tracking-widest text-white/50";

  const likeLabel =
    likeCount === 1 ? "1 like" : `${formatCount(likeCount)} likes`;

  const commentLabel =
    commentCount === 1
      ? "View 1 comment"
      : `View all ${formatCount(commentCount)} comments`;

  const actions = (
    <>
      <button
        type="button"
        onClick={handleToggleLike}
        disabled={!clientId || likes === undefined}
        className={`${railButtonClass} disabled:opacity-40`}
        aria-label={liked ? "Unlike photo" : "Like photo"}
      >
        <span
          className={`flex items-center justify-center rounded-full backdrop-blur-md ${
            isFeed ? "h-11 w-11" : ""
          } ${liked ? "text-red-500" : ""}`}
          style={isFeed ? { background: "var(--feed-action-bg)" } : undefined}
        >
          <svg
            width={isFeed || isInline ? 24 : 18}
            height={isFeed || isInline ? 24 : 18}
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
        <span className={countClass}>{!isInline ? formatCount(likeCount) : null}</span>
      </button>

      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className={railButtonClass}
        aria-label="Open comments"
      >
        <span
          className={`flex items-center justify-center rounded-full backdrop-blur-md ${
            isFeed ? "h-11 w-11" : ""
          }`}
          style={isFeed ? { background: "var(--feed-action-bg)" } : undefined}
        >
          <svg
            width={isFeed || isInline ? 24 : 18}
            height={isFeed || isInline ? 24 : 18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </span>
        <span className={countClass}>{!isInline ? formatCount(commentCount) : null}</span>
      </button>
    </>
  );

  return (
    <>
      {isFeed ? (
        <div className="pointer-events-auto absolute bottom-36 right-4 z-20 flex flex-col items-center gap-5 sm:bottom-28">
          {actions}
        </div>
      ) : isInline ? (
        <div className="w-full">
          <div className="flex w-full items-center gap-1">
            {actions}
            {trailing ? <div className="ml-auto shrink-0">{trailing}</div> : null}
          </div>
          {(likeCount > 0 || commentCount > 0) && (
            <div className="mt-1.5 space-y-0.5">
              {likeCount > 0 && (
                <p className="text-sm font-semibold text-[var(--foreground)]">{likeLabel}</p>
              )}
              {commentCount > 0 && (
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                >
                  {commentLabel}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`flex items-center gap-4 ${isPost ? "" : "border-t border-white/10 pt-4"}`}
        >
          {actions}
        </div>
      )}

      <CommentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        comments={comments}
        commentCount={commentCount}
        clientId={clientId}
        savedAuthor={savedAuthor}
        nameInput={nameInput}
        onNameInputChange={setNameInput}
        commentBody={commentBody}
        onCommentBodyChange={setCommentBody}
        submitting={submitting}
        onSubmit={handleSubmitComment}
        onRemove={handleRemoveComment}
        formatRelativeTime={formatRelativeTime}
      />
    </>
  );
}

export function PhotoEngagement(props: PhotoEngagementProps) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return null;
  return <PhotoEngagementInner {...props} />;
}
