"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, TextInput, PrimaryButton } from "@/components/AdminPage";
import { InlineLoader } from "@/components/Loader";

export default function ReferReportPage() {
  const [affId, setAffId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!affId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/emp/clicks?search=${encodeURIComponent(affId)}&page=1`);
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <AdminPageHeader title="Referrer Report" subtitle="Search clicks by affiliate ID or UPI" />
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <TextInput placeholder="Affiliate ID, UPI, or click ID…" value={affId} onChange={(e) => setAffId(e.target.value)} style={{ width: 320 }} />
        <PrimaryButton type="submit" disabled={loading}>{loading ? <><InlineLoader style={{ marginRight: 8 }} />Searching…</> : "Search"}</PrimaryButton>
      </form>
      {data && (
        <AdminCard>
          <AdminTable columns={["Click ID", "Offer", "Affiliate", "Sub1 (User)", "Sub2 (Refer)", "Event", "Date"]}>
            {data.clicks.map((c) => (
              <tr
                key={c.id}
                style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background 140ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--lg-paper-sunken)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--lg-ink-faint)", fontVariantNumeric: "tabular-nums" }}>{c.click_id}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{c.off_name}</td>
                <td style={{ padding: "12px 16px" }}>{c.aff_id}</td>
                <td style={{ padding: "12px 16px", fontSize: 12 }}>{c.aff_sub_1}</td>
                <td style={{ padding: "12px 16px", fontSize: 12 }}>{c.aff_sub_2}</td>
                <td style={{ padding: "12px 16px" }}>{c.current_event}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--lg-ink-faint)" }}>{c.date}</td>
              </tr>
            ))}
          </AdminTable>
        </AdminCard>
      )}
    </div>
  );
}
