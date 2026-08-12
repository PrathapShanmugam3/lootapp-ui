"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, Pagination } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function FailedPaymentsPage() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    api.get(`/api/admin/failed-payments?page=${page}&limit=${limit}`).then(setData).catch(() => setData(null));
  }, [page, limit]);

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <AdminPageHeader title="Failed Payments" subtitle={data ? `${data.totalRecords} failed` : ""} />
      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        {!data ? (
          <Loader style={{ padding: 32, color: "var(--lg-ink-faint)" }} />
        ) : data.payments.length === 0 ? (
          <div style={{ padding: 32, color: "var(--lg-ink-faint)", fontSize: 13 }}>No failed payments.</div>
        ) : (
          <>
          <AdminTable columns={["#", "Offer", "Pay To", "Pay ID", "Amount", "TRX ID", "Date", "Action"]}>
            {data.payments.map((p, i) => (
              <tr key={p.id} style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background-color 140ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--lg-paper-sunken)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "12px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{p.off_name}</td>
                <td style={{ padding: "12px 16px" }}>{p.pay_to}</td>
                <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.pay_id}>{p.pay_id}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>₹{p.pay_amount}</td>
                <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.trx_id}>{p.trx_id}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--lg-ink-faint)", fontVariantNumeric: "tabular-nums" }}>{p.date} {p.time}</td>
                <td style={{ padding: "12px 16px" }}>
                  <a href={`/admin/edit-payment?id=${p.id}`} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, textDecoration: "none", transition: "color 150ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lg-pink)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--lg-violet)")}>Edit</a>
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
