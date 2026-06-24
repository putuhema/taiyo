"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { ModalPortal } from "./ModalPortal";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <ModalPortal>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-sm border border-[var(--border)] bg-[var(--card)] px-5 py-3 shadow-xl"
          >
            <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--foreground)]">
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
