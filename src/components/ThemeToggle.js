"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/useTheme";

export default function ThemeToggle({ className, style }) {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={className} style={{ width: 36, height: 36, ...style }} />;

  const isDark = theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      type="button"
      onClick={toggle}
      className={className}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      style={{
        width: 36, height: 36, borderRadius: 4,
        border: "1px solid var(--lg-line, #DDD8CC)",
        background: "var(--lg-paper-raised, #fff)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        color: "var(--lg-ink, #0B1210)",
        transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
        ...style,
      }}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
