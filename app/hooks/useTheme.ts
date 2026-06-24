"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  setStoredTheme,
  toggleTheme,
  type Theme,
} from "../lib/theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const set = useCallback((next: Theme) => {
    setTheme(next);
    setStoredTheme(next);
    applyTheme(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = toggleTheme(prev);
      setStoredTheme(next);
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, setTheme: set, toggleTheme: toggle };
}
