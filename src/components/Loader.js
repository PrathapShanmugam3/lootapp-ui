"use client";

/**
 * Shared Aurora-styled loading indicator — a gradient-ring spinner,
 * replacing plain "Loading…" text across the app. Respects
 * prefers-reduced-motion by falling back to a static ring.
 */
export default function Loader({ size = 28, label, style, center = true }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: center ? 32 : 0,
        ...style,
      }}
    >
      <span
        className="lg-spinner"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          display: "inline-block",
          border: `${Math.max(2.5, size / 10)}px solid var(--lg-line)`,
          borderTopColor: "var(--lg-violet)",
          borderRightColor: "var(--lg-pink)",
        }}
      />
      {label && (
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--lg-ink-faint)", fontFamily: "var(--lg-font-body)" }}>
          {label}
        </span>
      )}
    </div>
  );
}

export function InlineLoader({ size = 15, style }) {
  return (
    <span
      className="lg-spinner"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "inline-block",
        border: `${Math.max(2, size / 8)}px solid rgba(255,255,255,0.35)`,
        borderTopColor: "currentColor",
        verticalAlign: "middle",
        ...style,
      }}
    />
  );
}
