"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, Pagination } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function PendingPaymentsPage() {
  const [data, setData] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState(new Set());
  const [isBulkBusy, setIsBulkBusy] = useState(false);

  function load() {
    api.get(`/api/admin/pending-payments?page=${page}&limit=${limit}`).then(setData).catch(() => setData(null));
  }

  useEffect(() => {
    load();
    setSelected(new Set());
  }, [page, limit]);

  async function resolve(trxId, approve) {
    if (approve && !window.confirm("Approve this payout? This will attempt a real gateway transfer.")) return;
    setBusyId(trxId);
    try {
      const res = await api.post("/api/admin/pending-payments/resolve", { trxId, approve });
      alert(res.status ? `Status: ${res.status}` : res.message || "Done");
      load();
      setSelected(new Set());
    } finally {
      setBusyId(null);
    }
  }

  async function resolveBulk(approve) {
    if (selected.size === 0) return;
    if (approve && !window.confirm(`Approve ${selected.size} payouts? This will attempt real gateway transfers.`)) return;
    
    setIsBulkBusy(true);
    try {
      const res = await api.post("/api/admin/pending-payments/resolve-bulk", { 
        trxIds: Array.from(selected), 
        approve 
      });
      alert(res.success ? `Processed ${selected.size} items.` : res.message || "Bulk action failed");
      load();
      setSelected(new Set());
    } finally {
      setIsBulkBusy(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <AdminPageHeader 
        title="Pending Payments" 
        subtitle={data ? `${data.totalRecords} awaiting approval` : ""} 
        action={
          selected.size > 0 && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--lg-ink-soft)", marginRight: 8 }}>{selected.size} selected</span>
              <button disabled={isBulkBusy} onClick={() => resolveBulk(false)} style={{ background: "var(--lg-error-soft)", color: "var(--lg-error)", border: "none", borderRadius: "var(--lg-radius-pill)", padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: isBulkBusy ? "not-allowed" : "pointer", opacity: isBulkBusy ? 0.6 : 1, transition: "all 150ms ease" }}>Reject All</button>
              <button disabled={isBulkBusy} onClick={() => resolveBulk(true)} style={{ background: "var(--lg-success-soft)", color: "var(--lg-success)", border: "none", borderRadius: "var(--lg-radius-pill)", padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: isBulkBusy ? "not-allowed" : "pointer", opacity: isBulkBusy ? 0.6 : 1, transition: "all 150ms ease" }}>Approve All</button>
            </div>
          )
        }
      />
      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        {!data ? (
          <Loader style={{ padding: 32, color: "var(--lg-ink-faint)" }} />
        ) : data.payments.length === 0 ? (
          <div style={{ padding: 32, color: "var(--lg-ink-faint)", fontSize: 13 }}>No pending payments.</div>
        ) : (
          <>
          <AdminTable columns={[
            <input 
              type="checkbox" 
              checked={data.payments.length > 0 && selected.size === data.payments.length}
              onChange={(e) => {
                if (e.target.checked) setSelected(new Set(data.payments.map(p => p.trx_id)));
                else setSelected(new Set());
              }}
              style={{ cursor: "pointer" }}
            />, 
            "#", "Offer", "Pay To", "Pay ID", "Amount", "User Balance", "Event", "Action"
          ]}>
            {data.payments.map((p, i) => (
              <tr key={p.id} style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background-color 140ms ease", background: selected.has(p.trx_id) ? "var(--lg-violet-soft)" : "transparent" }} onMouseEnter={(e) => { if(!selected.has(p.trx_id)) e.currentTarget.style.background = "var(--lg-paper-sunken)" }} onMouseLeave={(e) => { if(!selected.has(p.trx_id)) e.currentTarget.style.background = "transparent" }}>
                <td style={{ padding: "12px 16px" }}>
                  <input 
                    type="checkbox" 
                    checked={selected.has(p.trx_id)}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(p.trx_id);
                      else next.delete(p.trx_id);
                      setSelected(next);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td style={{ padding: "12px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{p.off_name}</td>
                <td style={{ padding: "12px 16px" }}>{p.pay_to}</td>
                <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.pay_id}>{p.pay_id}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>₹{p.pay_amount}</td>
                <td style={{ padding: "12px 16px" }}>
                  {p.aff_balance !== null ? (
                    <a href={`/admin/user_performance?user_id=${p.aff_id}`} style={{ color: "var(--lg-violet)", fontWeight: 700, textDecoration: "none", fontVariantNumeric: "tabular-nums", transition: "color 150ms ease" }}>₹{p.aff_balance.toLocaleString("en-IN")}</a>
                  ) : "—"}
                </td>
                <td style={{ padding: "12px 16px" }}>{p.event}</td>
                <td style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
                  <button disabled={busyId === p.trx_id} onClick={() => resolve(p.trx_id, true)} style={{ background: "var(--lg-success-soft)", color: "var(--lg-success)", border: "none", borderRadius: "var(--lg-radius-pill)", padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: busyId === p.trx_id ? "not-allowed" : "pointer", opacity: busyId === p.trx_id ? 0.6 : 1, transition: "transform 150ms ease, box-shadow 150ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>Approve</button>
                  <button disabled={busyId === p.trx_id} onClick={() => resolve(p.trx_id, false)} style={{ background: "var(--lg-error-soft)", color: "var(--lg-error)", border: "none", borderRadius: "var(--lg-radius-pill)", padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: busyId === p.trx_id ? "not-allowed" : "pointer", opacity: busyId === p.trx_id ? 0.6 : 1, transition: "transform 150ms ease, box-shadow 150ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>Reject</button>
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
