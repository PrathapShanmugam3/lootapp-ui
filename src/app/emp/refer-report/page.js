"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, TextInput, PrimaryButton, Pagination } from "@/components/AdminPage";
import { InlineLoader } from "@/components/Loader";

export default function ReferReportPage() {
  const [affId, setAffId] = useState("");
  const [activeAffId, setActiveAffId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState("");

  function fetchClicks(searchVal, pageVal, limitVal) {
    setLoading(true);
    api.get(`/api/emp/clicks?search=${encodeURIComponent(searchVal)}&page=${pageVal}&limit=${limitVal}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (activeAffId) {
      fetchClicks(activeAffId, page, limit);
    }
  }, [activeAffId, page, limit]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!affId.trim()) {
      setError("Search query is missing.");
      return;
    }
    setError("");
    setPage(1);
    setActiveAffId(affId);
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <AdminPageHeader title="Referrer Report" subtitle="Search clicks by affiliate ID or UPI" />
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "flex-start" }} noValidate>
        <div>
          <TextInput
            placeholder="Affiliate ID, UPI, or click ID…"
            value={affId}
            onChange={(e) => { setAffId(e.target.value); if (error) setError(""); }}
            required
            style={{ width: 320 }}
          />
          {error && <span style={{ display: "block", color: "#dc2626", fontSize: 12, fontWeight: 600, marginTop: 6 }}>{error}</span>}
        </div>
        <PrimaryButton type="submit" disabled={loading}>{loading ? <><InlineLoader style={{ marginRight: 8 }} />Searching…</> : "Search"}</PrimaryButton>
      </form>
      {data && (
        <AdminCard>
          <AdminTable columns={["#", "Click ID", "Offer", "Affiliate", "Sub1 (User)", "Sub2 (Refer)", "Event", "Date"]}>
            {data.clicks.map((c, i) => (
              <tr
                key={c.id}
                style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background 140ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--lg-paper-sunken)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--lg-ink-faint)", fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "10px 16px" }}>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              style={{
                padding: "7px 30px 7px 12px", borderRadius: "var(--lg-radius-pill)", border: "1.5px solid var(--lg-line)",
                background: "var(--lg-paper-sunken)", fontSize: 12.5, fontWeight: 600, color: "var(--lg-ink)",
                fontFamily: "var(--lg-font-body)", outline: "none", appearance: "none", cursor: "pointer",
                transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--lg-violet)"; e.target.style.background = "var(--lg-paper-raised)"; e.target.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--lg-line)"; e.target.style.background = "var(--lg-paper-sunken)"; e.target.style.boxShadow = "none"; }}
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <Pagination page={data.currentPage} totalPages={data.totalPages} onChange={setPage} />
          </div>
        </AdminCard>
      )}
    </div>
  );
}
