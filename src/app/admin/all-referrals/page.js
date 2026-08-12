"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, Pagination, TextInput } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function AllReferralsPage() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    api.get(`/api/admin/referrals?${params}`).then(setData).catch(() => setData(null));
  }, [search, page, limit]);

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <AdminPageHeader title="Manage Referrals" subtitle={data ? `${data.totalRecords.toLocaleString("en-IN")} referral links` : ""} />
      <TextInput placeholder="Search offer, affiliate, code, telegram…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ marginBottom: 16, width: "100%", maxWidth: 320, borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} />
      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        {!data ? (
          <Loader style={{ padding: 32 }} />
        ) : (
          <>
            <AdminTable columns={["#", "ID", "Offer", "Affiliate", "Refer Code", "Telegram", "Action"]}>
              {data.referrals.map((r, i) => (
                <tr key={r.id} style={{ borderTop: "1px solid var(--lg-line)", transition: "background-color 140ms ease" }}>
                  <td style={{ padding: "10px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                  <td style={{ padding: "10px 16px", fontVariantNumeric: "tabular-nums" }}>{r.id}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{r.offer_name || r.offer_id}</td>
                  <td style={{ padding: "10px 16px" }}><a href={`/admin/user_performance?user_id=${r.aff_id}`} style={{ color: "var(--lg-violet)", fontWeight: 600, textDecoration: "none", transition: "color 150ms ease" }}>{r.aff_id}</a></td>
                  <td style={{ padding: "10px 16px", fontFamily: "monospace" }}>{r.refer_code}</td>
                  <td style={{ padding: "10px 16px" }}>{r.ref_telegram || "—"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <a href={`/admin/edit-referral?id=${r.id}`} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, textDecoration: "none", transition: "color 150ms ease" }}>Edit</a>
                  </td>
                </tr>
              ))}
            </AdminTable>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "0 4px" }}>
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
          </>
        )}
      </AdminCard>
    </div>
  );
}
