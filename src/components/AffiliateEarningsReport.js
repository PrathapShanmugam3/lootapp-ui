"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminCard, AdminTable, TextInput, StatusBadge } from "@/components/AdminPage";
import { InlineLoader } from "@/components/Loader";

export function StatCard({ label, value }) {
  return (
    <div style={{ flex: 1, minWidth: 140, background: "var(--lg-paper-sunken)", borderRadius: "var(--lg-radius)", padding: "14px 18px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--lg-ink-faint)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--lg-ink)", fontFamily: "var(--lg-font-display)", marginTop: 4 }}>{value}</div>
    </div>
  );
}

/**
 * Failed/skipped-payment recovery drill-down for one affiliate + offer.
 * Shared between emp/refer-report and emp/user-report, since both reduce to
 * "search an affiliate, see their earnings" — same data, same recovery
 * actions (edit pay ID, repay), just reached via a different search field.
 */
export function DrilldownModal({ affId, offId, offName, onClose, onChanged, apiBase = "/api/emp" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editPayId, setEditPayId] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);

  function load() {
    api.get(`${apiBase}/affiliates/${affId}/offers/${offId}/drilldown`)
      .then(setData)
      .catch(() => setData({ clicks: [] }))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  async function saveEditPayId(payRecordId) {
    setBusyId(payRecordId);
    setMessage(null);
    try {
      const res = await api.put(`${apiBase}/pay-records/${payRecordId}`, { payId: editPayId });
      if (res.success) {
        setEditingId(null);
        load();
        onChanged?.();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setBusyId(null);
    }
  }

  async function handleRepay(payRecordId) {
    setBusyId(payRecordId);
    setMessage(null);
    try {
      const res = await api.post(`${apiBase}/pay-records/${payRecordId}/repay`);
      setMessage(res.success ? { type: "success", text: `Repay attempted: ${res.result?.status || "done"}.` } : { type: "error", text: res.message });
      load();
      onChanged?.();
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--lg-paper)", borderRadius: "var(--lg-radius)", maxWidth: 900, width: "100%", maxHeight: "85vh", overflowY: "auto", padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>{offName} — Clicks</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--lg-ink-faint)" }}>×</button>
        </div>

        {message && (
          <div style={{ padding: 10, borderRadius: "var(--lg-radius-sm)", marginBottom: 12, background: message.type === "error" ? "var(--lg-error-soft)" : "var(--lg-success-soft)", color: message.type === "error" ? "var(--lg-error)" : "var(--lg-success)", fontSize: 12.5, fontWeight: 600 }}>
            {message.text}
          </div>
        )}

        {loading ? (
          <InlineLoader />
        ) : data.clicks.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--lg-ink-faint)" }}>No clicks for this offer.</p>
        ) : (
          data.clicks.map((c) => (
            <div key={c.id} style={{ border: "1px solid var(--lg-line)", borderRadius: "var(--lg-radius-sm)", padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "monospace", fontSize: 12 }}>{c.click_id}</span>
                <span style={{ fontSize: 12, color: "var(--lg-ink-faint)" }}>{c.date} {c.time}</span>
              </div>
              {c.payRecords.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--lg-ink-faint)" }}>No payment records for this click yet.</p>
              ) : (
                c.payRecords.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid var(--lg-line-soft)", flexWrap: "wrap" }}>
                    <StatusBadge status={p.pay_status} />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>₹{p.pay_amount}</span>
                    <span style={{ fontSize: 12, color: "var(--lg-ink-faint)" }}>{p.pay_to}</span>
                    {editingId === p.id ? (
                      <>
                        <TextInput value={editPayId} onChange={(e) => setEditPayId(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
                        <button onClick={() => saveEditPayId(p.id)} disabled={busyId === p.id} style={{ color: "var(--lg-success)", background: "none", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ color: "var(--lg-ink-faint)", background: "none", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" }}>{p.pay_id || "—"}</span>
                        {(p.pay_status === "Failed" || p.pay_status === "Skipped") && (
                          <>
                            <button onClick={() => { setEditingId(p.id); setEditPayId(p.pay_id || ""); }} style={{ color: "var(--lg-violet)", background: "none", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Edit Pay ID</button>
                            {p.pay_status === "Failed" && (
                              <button onClick={() => handleRepay(p.id)} disabled={busyId === p.id} style={{ color: "var(--lg-success)", background: "none", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                                {busyId === p.id ? "Repaying…" : "Repay"}
                              </button>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AffiliateOfferBreakdown({ offers, onViewMore }) {
  return (
    <AdminCard>
      <AdminTable columns={["Offer", "Clicks", "Leads", "Earnings", "Action"]}>
        {offers.map((o) => (
          <tr key={o.offId} style={{ borderTop: "1px solid var(--lg-line-soft)" }}>
            <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{o.offName}</td>
            <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{o.clicks}</td>
            <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{o.leads}</td>
            <td style={{ padding: "12px 16px", fontWeight: 700, fontVariantNumeric: "tabular-nums", fontFamily: "var(--lg-font-display)" }}>₹{o.earnings}</td>
            <td style={{ padding: "12px 16px" }}>
              <button onClick={() => onViewMore(o)} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}>View more</button>
            </td>
          </tr>
        ))}
        {offers.length === 0 && (
          <tr><td colSpan={5} style={{ padding: "16px", color: "var(--lg-ink-faint)", fontSize: 13 }}>No offer activity for this affiliate.</td></tr>
        )}
      </AdminTable>
    </AdminCard>
  );
}
