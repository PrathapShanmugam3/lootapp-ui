"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, Pagination } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function TopEarnersPage() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const now = new Date();
    const monthStart = `${now.toISOString().slice(0, 7)}-01`;
    const params = new URLSearchParams({ dateFrom: monthStart, page: String(page), limit: String(limit) });
    api.get(`/api/admin/top-earners?${params}`).then(setData).catch(() => setData(null));
  }, [page, limit]);

  if (!data) return <Loader style={{ padding: 32 }} />;

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <AdminPageHeader title="Top Earners" subtitle="This month, ranked by total earnings" />
      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        <AdminTable columns={["Rank", "UPI/Pay ID", "User", "Total Earnings", "Payments", "Last Payment"]}>
          {data.earners.map((e, i) => (
            <tr key={`${e.aff_id}-${e.pay_id}`} style={{ borderTop: "1px solid var(--lg-line)", transition: "background-color 140ms ease" }}>
              <td style={{ padding: "10px 16px", fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>{page === 1 ? (MEDALS[i] || i + 1) : (page - 1) * limit + i + 1}</td>
              <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 12, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={e.pay_id}>{e.pay_id}</td>
              <td style={{ padding: "10px 16px" }}><a href={`/admin/user_performance?user_id=${e.aff_id}`} style={{ color: "var(--lg-violet)", fontWeight: 600, textDecoration: "none", transition: "color 150ms ease" }}>{e.name || e.aff_id}</a></td>
              <td style={{ padding: "10px 16px", fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>₹{e.total_earnings.toLocaleString("en-IN")}</td>
              <td style={{ padding: "10px 16px", fontVariantNumeric: "tabular-nums" }}>{e.total_payments}</td>
              <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--lg-ink-faint)" }}>{e.last_payment}</td>
            </tr>
          ))}
        </AdminTable>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "12px 4px 0" }}>
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
    </div>
  );
}
