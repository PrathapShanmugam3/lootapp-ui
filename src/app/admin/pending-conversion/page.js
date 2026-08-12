"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, Pagination } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function PendingConversionPage() {
  const [data, setData] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  function load() {
    api.get(`/api/admin/pending-conversions?page=${page}&limit=${limit}`).then(setData).catch(() => setData(null));
  }

  useEffect(() => {
    load();
  }, [page, limit]);

  async function resolve(clickId, event, approve) {
    setBusyId(`${clickId}-${event}`);
    try {
      await api.post("/api/admin/pending-conversions/resolve", { clickId, event, approve });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <AdminPageHeader title="Pending Conversions" subtitle={data ? `${data.totalRecords} awaiting manual approval` : ""} />
      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        {!data ? (
          <Loader style={{ padding: 32 }} />
        ) : data.conversions.length === 0 ? (
          <div style={{ padding: 32, color: "var(--lg-ink-faint)", fontSize: 13 }}>No pending conversions.</div>
        ) : (
          <>
          <AdminTable columns={["#", "Offer", "Click ID", "Event", "Date", "Action"]}>
            {data.conversions.map((c, i) => {
              const key = `${c.click_id}-${c.event}`;
              return (
                <tr key={c.id} style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background-color 140ms ease" }}>
                  <td style={{ padding: "10px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{c.off_name}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 12 }}>{c.click_id}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ background: "var(--lg-warning-soft)", color: "var(--lg-warning)", fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: "var(--lg-radius-pill)" }}>{c.event}</span>
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--lg-ink-faint)", fontVariantNumeric: "tabular-nums" }}>{c.date} {c.time}</td>
                  <td style={{ padding: "10px 16px", display: "flex", gap: 8 }}>
                    <button
                      disabled={busyId === key}
                      onClick={() => resolve(c.click_id, c.event, true)}
                      style={{
                        background: "var(--lg-success-soft)",
                        color: "var(--lg-success)",
                        border: "none",
                        borderRadius: "var(--lg-radius-pill)",
                        padding: "6px 14px",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: busyId === key ? "default" : "pointer",
                        opacity: busyId === key ? 0.6 : 1,
                        transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      disabled={busyId === key}
                      onClick={() => resolve(c.click_id, c.event, false)}
                      style={{
                        background: "var(--lg-error-soft)",
                        color: "var(--lg-error)",
                        border: "none",
                        borderRadius: "var(--lg-radius-pill)",
                        padding: "6px 14px",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: busyId === key ? "default" : "pointer",
                        opacity: busyId === key ? 0.6 : 1,
                        transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              );
            })}
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
