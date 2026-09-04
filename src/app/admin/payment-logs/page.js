"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, StatusBadge, TextInput, Pagination, CsvExportButton } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function PaymentLogsPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [event, setEvent] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);
    if (event) params.set("event", event);
    if (search) params.set("search", search);
    api.get(`/api/admin/payment-logs?${params}`).then(setData).catch(() => setData(null));
  }, [status, event, search, page, limit]);

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <AdminPageHeader
        title="Payment Logs"
        subtitle={data ? `${data.totalRecords} records` : ""}
        action={
          data?.logs?.length > 0 && (
            <CsvExportButton
              headers={["Offer", "Pay To", "Pay ID", "Event", "Amount", "Status", "Date", "Time"]}
              rows={data.logs.map(l => [l.off_name, l.pay_to, l.pay_id, l.event, l.pay_amount, l.pay_status, l.date, l.time])}
              filename="payment-logs.csv"
            />
          )
        }
      />
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <TextInput placeholder="Search pay ID, TRX ID…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: "100%", maxWidth: 280, borderRadius: "var(--lg-radius-pill)" }} />
        <TextInput placeholder="Filter by event…" value={event} onChange={(e) => { setEvent(e.target.value); setPage(1); }} style={{ width: "100%", maxWidth: 200, borderRadius: "var(--lg-radius-pill)" }} />
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{
              padding: "10px 36px 10px 16px", borderRadius: "var(--lg-radius-pill)", border: "1.5px solid var(--lg-line)",
              background: "var(--lg-paper-sunken)", fontSize: 13, color: "var(--lg-ink)", fontFamily: "var(--lg-font-body)",
              outline: "none", appearance: "none", cursor: "pointer", transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--lg-violet)"; e.target.style.background = "var(--lg-paper-raised)"; e.target.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--lg-line)"; e.target.style.background = "var(--lg-paper-sunken)"; e.target.style.boxShadow = "none"; }}
          >
            <option value="">All statuses</option>
            {["Success", "Failed", "Refunded to Wallet", "Processing", "Pending", "Rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span style={{ position: "absolute", right: 14, pointerEvents: "none", color: "var(--lg-ink-faint)", fontSize: 10 }}>▾</span>
        </div>
      </div>
      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        {!data ? (
          <Loader style={{ padding: 32, color: "var(--lg-ink-faint)" }} />
        ) : (
          <>
            <AdminTable columns={["#", "Offer", "Pay To", "Pay ID", "Event", "Amount", "Status", "Date"]}>
              {data.logs.map((l, i) => (
                <tr key={l.id} style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background-color 140ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--lg-paper-sunken)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "12px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{l.off_name}</td>
                  <td style={{ padding: "12px 16px" }}>{l.pay_to}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={l.pay_id}>{l.pay_id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12.5, color: "var(--lg-ink-soft)" }}>{l.event}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>₹{l.pay_amount}</td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={l.pay_status} /></td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--lg-ink-faint)", fontVariantNumeric: "tabular-nums" }}>{l.date} {l.time}</td>
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
