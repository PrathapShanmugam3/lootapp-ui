"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, PrimaryButton } from "@/components/AdminPage";

function parseEntries(text) {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const [clickId, event] = line.split(",").map((s) => (s || "").trim());
      return { clickId, event };
    })
    .filter((e) => e.clickId);
}

export default function UploadReportPage() {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  async function handleSubmit() {
    const entries = parseEntries(text);
    if (entries.length === 0) return;
    setSubmitting(true);
    setResults(null);
    try {
      const res = await api.post("/api/admin/conversions/manual", { entries });
      setResults(res.results || []);
    } catch (err) {
      setResults([{ status: "failed", message: err.data?.message || err.message }]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <AdminPageHeader title="Upload Report" subtitle="Manually trigger conversion events by Click ID" />

      <AdminCard style={{ padding: 26, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", display: "block", marginBottom: 8 }}>
          Enter Click IDs and Events (one per line: clickid, event_name)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={"abc123, registration\nxyz789, purchase"}
          style={{
            width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent",
            padding: "12px 14px", fontFamily: "monospace", fontSize: 13, color: "var(--lg-ink)", outline: "none", resize: "vertical",
          }}
        />
        <div style={{ marginTop: 16 }}>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            style={{ borderRadius: "var(--lg-radius-pill)", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))", boxShadow: "0 10px 20px -6px rgba(16,185,129,0.5)" }}
          >
            {submitting ? "Processing…" : "Submit"}
          </PrimaryButton>
        </div>

        {results && (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 14px", borderRadius: "var(--lg-radius-sm)", fontSize: 12.5,
                  background: r.status === "success" ? "var(--lg-success-soft)" : "var(--lg-error-soft)",
                  color: r.status === "success" ? "var(--lg-success)" : "var(--lg-error)",
                }}
              >
                {r.clickId && <strong>{r.clickId}</strong>} {r.event && `(${r.event})`} — {r.message || r.status}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
