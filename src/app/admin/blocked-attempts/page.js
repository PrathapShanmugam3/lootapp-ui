"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, Pagination } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function BlockedAttemptsPage() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    api.get(`/api/admin/blocked-attempts?page=${page}&limit=${limit}`).then(setData).catch(() => setData(null));
  }, [page, limit]);

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <AdminPageHeader title="Blocked Attempts" subtitle={data ? `${data.totalRecords} VPN/proxy attempts blocked` : ""} />
      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        {!data ? (
          <Loader style={{ padding: 32 }} />
        ) : data.attempts.length === 0 ? (
          <div style={{ padding: 32, color: "var(--lg-ink-faint)", fontSize: 13 }}>No blocked attempts recorded.</div>
        ) : (
          <>
            <AdminTable columns={["#", "IP", "Route", "Reason", "Time"]}>
              {data.attempts.map((a, i) => (
                <tr key={a.id} style={{ borderTop: "1px solid var(--lg-line)", transition: "background-color 140ms ease" }}>
                  <td style={{ padding: "10px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "monospace", fontWeight: 700, color: "var(--lg-ink)" }}>{a.ip}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 12 }}>{a.route}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ background: "var(--lg-error-soft)", color: "var(--lg-error)", fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: "var(--lg-radius-pill)" }}>{a.reason}</span>
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--lg-ink-faint)", fontVariantNumeric: "tabular-nums" }}>{new Date(a.created_at).toLocaleString()}</td>
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
              <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </AdminCard>
    </div>
  );
}
