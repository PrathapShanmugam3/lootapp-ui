"use client";

import { useState } from "react";

export function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontFamily: "var(--lg-font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--lg-ink)", margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--lg-ink-soft)", margin: "6px 0 0", fontSize: 14, fontWeight: 500 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({ children, style }) {
  return (
    <div
      style={{
        background: "var(--lg-paper-raised)",
        borderRadius: "var(--lg-radius)",
        border: "1px solid var(--lg-line)",
        boxShadow: "var(--lg-shadow-md)",
        overflow: "hidden",
        transition: "box-shadow 220ms ease, border-color 220ms ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--lg-glow-violet), var(--lg-shadow-md)";
        e.currentTarget.style.borderColor = "var(--lg-violet-soft)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = style?.boxShadow || "var(--lg-shadow-md)";
        e.currentTarget.style.borderColor = style?.border ? "" : "var(--lg-line)";
      }}
    >
      {children}
    </div>
  );
}

export function AdminTable({ columns, children }) {
  return (
    <div className="lg-table-scroll" style={{ overflowX: "auto", maxWidth: "100%" }}>
      <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse", minWidth: 640 }}>
        <thead>
          <tr style={{ background: "var(--lg-paper-sunken)", borderBottom: "1px solid var(--lg-line)", textAlign: "left" }}>
            {columns.map((c) => (
              <th
                key={c}
                style={{
                  padding: "16px 24px",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "var(--lg-ink-soft)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ color: "var(--lg-ink)" }}>{children}</tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2);
  return (
    <div style={{ display: "flex", gap: 8, padding: 20, justifyContent: "center", borderTop: "1px solid var(--lg-line)" }}>
      {pages.map((p, i) => (
        <span key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && pages[i - 1] !== p - 1 && <span style={{ color: "var(--lg-ink-faint)" }}>…</span>}
          <button
            onClick={() => onChange(p)}
            style={{
              minWidth: 34,
              height: 34,
              borderRadius: "var(--lg-radius-sm)",
              border: p === page ? "none" : "1px solid var(--lg-line)",
              fontSize: 13,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              cursor: "pointer",
              background: p === page ? "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))" : "var(--lg-paper-raised)",
              color: p === page ? "#ffffff" : "var(--lg-ink)",
              boxShadow: p === page ? "var(--lg-glow-violet), 0 4px 14px rgba(99, 102, 241, 0.4)" : "none",
              transition: "all 0.18s ease",
            }}
          >
            {p}
          </button>
        </span>
      ))}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    live: { bg: "var(--lg-success-soft)", text: "var(--lg-success)", glow: "var(--lg-glow-success)" },
    active: { bg: "var(--lg-success-soft)", text: "var(--lg-success)", glow: "var(--lg-glow-success)" },
    success: { bg: "var(--lg-success-soft)", text: "var(--lg-success)", glow: "var(--lg-glow-success)" },
    approved: { bg: "var(--lg-success-soft)", text: "var(--lg-success)", glow: "var(--lg-glow-success)" },
    inactive: { bg: "var(--lg-line-soft)", text: "var(--lg-ink-faint)" },
    paused: { bg: "var(--lg-warning-soft)", text: "var(--lg-warning)", glow: "var(--lg-glow-warning)" },
    pending: { bg: "var(--lg-warning-soft)", text: "var(--lg-warning)", glow: "var(--lg-glow-warning)" },
    processing: { bg: "var(--lg-info-soft)", text: "var(--lg-info)" },
    failed: { bg: "var(--lg-error-soft)", text: "var(--lg-error)", glow: "var(--lg-glow-error)" },
    rejected: { bg: "var(--lg-error-soft)", text: "var(--lg-error)", glow: "var(--lg-glow-error)" },
  };
  const style = map[(status || "").toLowerCase()] || { bg: "var(--lg-line-soft)", text: "var(--lg-ink-faint)" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: style.bg,
        color: style.text,
        fontSize: 11,
        fontWeight: 800,
        padding: "4px 12px",
        borderRadius: "var(--lg-radius-pill)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        boxShadow: style.glow ? `${style.glow.split(",")[0]}` : "none",
      }}
    >
      {status}
    </span>
  );
}

export function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))",
        color: "#ffffff",
        border: "none",
        borderRadius: "var(--lg-radius-pill)",
        padding: "11px 24px",
        fontSize: 13.5,
        fontWeight: 700,
        letterSpacing: "0.01em",
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        fontFamily: "var(--lg-font-body)",
        ...props.style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--lg-glow-violet), 0 6px 20px rgba(99, 102, 241, 0.45)";
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = props.style?.boxShadow || "0 4px 14px rgba(99, 102, 241, 0.35)";
        props.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}

export function TextInput(props) {
  const { style, onInvalid, onInput, ...rest } = props;
  const [error, setError] = useState("");

  function handleInvalid(e) {
    e.preventDefault();
    setError(e.target.validationMessage);
    onInvalid?.(e);
  }

  function handleInput(e) {
    if (e.target.validity.valid) setError("");
    onInput?.(e);
  }

  return (
    <div style={{ width: style?.width }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: "var(--lg-radius-sm)",
          background: "var(--lg-paper-raised)",
          border: error ? "1px solid #dc2626" : "1px solid var(--lg-line)",
          transition: "all 0.18s ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? "#dc2626" : "var(--lg-violet)";
          e.currentTarget.style.boxShadow = error ? "0 0 0 3px rgba(220,38,38,0.15)" : "0 0 0 3px var(--lg-violet-soft)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? "#dc2626" : "var(--lg-line)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <input
          {...rest}
          onInvalid={handleInvalid}
          onInput={handleInput}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            borderRadius: "var(--lg-radius-sm)",
            padding: "10px 14px",
            fontSize: 14,
            color: "var(--lg-ink)",
            fontFamily: "var(--lg-font-body)",
            outline: "none",
            ...style,
          }}
        />
      </div>
      {error && <span style={{ display: "block", color: "#dc2626", fontSize: 12, fontWeight: 600, marginTop: 6 }}>{error}</span>}
    </div>
  );
}

export function CsvExportButton({ headers, rows, filename = "export.csv", label = "Export CSV" }) {
  function handleExport() {
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => {
          const str = String(cell ?? "").replace(/"/g, '""');
          return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "var(--lg-paper-raised)",
        color: "var(--lg-violet)",
        border: "1px solid var(--lg-violet)",
        borderRadius: "var(--lg-radius-pill)",
        padding: "8px 18px",
        fontSize: 12.5,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 200ms ease",
        fontFamily: "var(--lg-font-body)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))";
        e.currentTarget.style.color = "#fff";
        e.currentTarget.style.boxShadow = "var(--lg-glow-violet)";
        e.currentTarget.style.borderColor = "transparent";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--lg-paper-raised)";
        e.currentTarget.style.color = "var(--lg-violet)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--lg-violet)";
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      {label}
    </button>
  );
}
