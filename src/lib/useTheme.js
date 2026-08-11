"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "loothat-theme"; // "light" | "dark" | null (null = follow system)

export function useTheme() {
  const [theme, setThemeState] = useState(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute("data-theme", next);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      document.documentElement.removeAttribute("data-theme");
    }
  }, []);

  const toggle = useCallback(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const current = theme || (prefersDark ? "dark" : "light");
    setTheme(current === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}
