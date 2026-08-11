"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function ApiPage() {
  const [settings, setSettings] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  function load() {
    api.get("/api/admin/settings").then((res) => setSettings(res.settings)).catch(() => setSettings(null));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReset() {
    if (!window.confirm("Reset the API key? Existing postback URLs will stop working immediately.")) return;
    setResetting(true);
    try {
      await api.post("/api/admin/settings/reset-api-key");
      load();
    } finally {
      setResetting(false);
    }
  }

  if (!settings) return <Loader style={{ padding: 32 }} />;

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const postbackUrl = `${backendUrl}/api/postback/conversion?c={click_id}&e={event}&api=${settings.valid_api}`;

  return (
    <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
      <AdminPageHeader title="Postback API" subtitle="Share this URL with advertisers/networks to receive conversions" />
      <AdminCard style={{ padding: 26, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", marginBottom: 8 }}>Postback URL</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <code style={{ flex: 1, background: "var(--lg-paper-sunken)", padding: "12px 14px", borderRadius: "var(--lg-radius-sm)", fontSize: 12, wordBreak: "break-all" }}>{postbackUrl}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(postbackUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            style={{
              background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))", color: "#fff", border: "none",
              borderRadius: "var(--lg-radius-pill)", padding: "10px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0,
              boxShadow: "0 8px 16px -6px rgba(16,185,129,0.5)", transition: "transform 160ms ease, box-shadow 160ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p style={{ fontSize: 12, color: "var(--lg-ink-faint)", marginTop: 16 }}>
          Replace <code>{"{click_id}"}</code> and <code>{"{event}"}</code> with the actual values when the advertiser fires the postback.
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          style={{ marginTop: 20, background: "var(--lg-error-soft)", color: "var(--lg-error)", border: "none", borderRadius: "var(--lg-radius-pill)", padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: resetting ? "not-allowed" : "pointer", opacity: resetting ? 0.6 : 1, transition: "transform 150ms ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          {resetting ? "Resetting…" : "Reset API Key"}
        </button>
      </AdminCard>
    </div>
  );
}
