"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, Pagination } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function FailedPaymentsPage() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState([]);
  const [repaying, setRepaying] = useState(false);
  const [message, setMessage] = useState(null);

  function load() {
    api.get(`/api/admin/failed-payments?page=${page}&limit=${limit}`)
      .then((res) => { setData(res); setSelected([]); })
      .catch(() => setData(null));
  }

  useEffect(load, [page, limit]);

  function toggleSelect(id) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function toggleSelectAll() {
    if (!data) return;
    const allIds = data.payments.map((p) => p.id);
    setSelected((prev) => prev.length === allIds.length ? [] : allIds);
  }

  async function handleRepay(id) {
    setRepaying(true);
    setMessage(null);
    try {
      const res = await api.post(`/api/admin/pay-records/${id}/repay`);
      setMessage(res.success ? { type: "success", text: `Repay attempted: ${res.result?.status || "done"}.` } : { type: "error", text: res.message });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setRepaying(false);
    }
  }

  async function handleRepayBulk() {
    if (selected.length === 0) return;
    if (!window.confirm(`Repay ${selected.length} failed payment(s)? This will attempt to move real money again.`)) return;
    setRepaying(true);
    setMessage(null);
    try {
      const res = await api.post("/api/admin/pay-records/repay-bulk", { ids: selected });
      const succeeded = res.results?.filter((r) => r.success).length || 0;
      const failed = (res.results?.length || 0) - succeeded;
      setMessage({ type: failed ? "error" : "success", text: `${succeeded} repaid, ${failed} could not be repaid.` });
      setSelected([]);
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setRepaying(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <AdminPageHeader
        title="Failed Payments"
        subtitle={data ? `${data.totalRecords} failed` : ""}
        action={selected.length > 0 && (
          <button onClick={handleRepayBulk} disabled={repaying} style={{ background: "var(--lg-violet)", color: "#fff", border: "none", borderRadius: "var(--lg-radius-pill)", padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: repaying ? "not-allowed" : "pointer" }}>
            {repaying ? "Repaying…" : `Repay Selected (${selected.length})`}
          </button>
        )}
      />
      {message && (
        <div style={{ padding: 12, borderRadius: "var(--lg-radius-sm)", marginBottom: 16, background: message.type === "error" ? "var(--lg-error-soft)" : "var(--lg-success-soft)", color: message.type === "error" ? "var(--lg-error)" : "var(--lg-success)", fontSize: 13, fontWeight: 600 }}>
          {message.text}
        </div>
      )}
      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        {!data ? (
          <Loader style={{ padding: 32, color: "var(--lg-ink-faint)" }} />
        ) : data.payments.length === 0 ? (
          <div style={{ padding: 32, color: "var(--lg-ink-faint)", fontSize: 13 }}>No failed payments.</div>
        ) : (
          <>
          <AdminTable columns={[
            <input key="select-all" type="checkbox" checked={selected.length === data.payments.length && data.payments.length > 0} onChange={toggleSelectAll} />,
            "#", "Offer", "Pay To", "Pay ID", "Amount", "TRX ID", "Date", "Action",
          ]}>
            {data.payments.map((p, i) => (
              <tr key={p.id} style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background-color 140ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--lg-paper-sunken)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "12px 16px" }}><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                <td style={{ padding: "12px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{p.off_name}</td>
                <td style={{ padding: "12px 16px" }}>{p.pay_to}</td>
                <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" }}>{p.pay_id}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>₹{p.pay_amount}</td>
                <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, wordBreak: "break-all" }}>{p.trx_id}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--lg-ink-faint)", fontVariantNumeric: "tabular-nums" }}>{p.date} {p.time}</td>
                <td style={{ padding: "12px 16px", display: "flex", gap: 14, alignItems: "center" }}>
                  <a href={`/admin/edit-payment?id=${p.id}`} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, textDecoration: "none", transition: "color 150ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lg-pink)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--lg-violet)")}>Edit</a>
                  <button onClick={() => handleRepay(p.id)} disabled={repaying} style={{ color: "var(--lg-success)", background: "none", border: "none", fontWeight: 700, fontSize: 12, cursor: repaying ? "not-allowed" : "pointer", padding: 0 }}>Repay</button>
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
