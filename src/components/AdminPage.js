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
        ...style,
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
              boxShadow: p === page ? "0 4px 14px rgba(99, 102, 241, 0.4)" : "none",
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
    live: { bg: "var(--lg-success-soft)", text: "var(--lg-success)" },
    active: { bg: "var(--lg-success-soft)", text: "var(--lg-success)" },
    success: { bg: "var(--lg-success-soft)", text: "var(--lg-success)" },
    inactive: { bg: "var(--lg-line-soft)", text: "var(--lg-ink-faint)" },
    paused: { bg: "var(--lg-warning-soft)", text: "var(--lg-warning)" },
    pending: { bg: "var(--lg-warning-soft)", text: "var(--lg-warning)" },
    processing: { bg: "var(--lg-info-soft)", text: "var(--lg-info)" },
    failed: { bg: "var(--lg-error-soft)", text: "var(--lg-error)" },
    rejected: { bg: "var(--lg-error-soft)", text: "var(--lg-error)" },
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
        transition: "transform 0.18s ease, boxShadow 0.18s ease",
        fontFamily: "var(--lg-font-body)",
        ...props.style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.45)";
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(99, 102, 241, 0.35)";
        props.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}

export function TextInput(props) {
  const { style, ...rest } = props;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        borderRadius: "var(--lg-radius-sm)",
        background: "var(--lg-paper-raised)",
        border: "1px solid var(--lg-line)",
        transition: "all 0.18s ease",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--lg-violet)";
        e.currentTarget.style.boxShadow = "0 0 0 3px var(--lg-violet-soft)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--lg-line)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <input
        {...rest}
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
  );
}
