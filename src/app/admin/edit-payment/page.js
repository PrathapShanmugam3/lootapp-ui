"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, PrimaryButton, TextInput } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const label = { fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", display: "block", marginBottom: 7 };
const field = { marginBottom: 18 };
const selectStyle = {
  width: "100%", padding: "11px 36px 11px 14px", borderRadius: "var(--lg-radius-sm)", border: "1.5px solid transparent",
  background: "var(--lg-paper-sunken)", fontSize: 13.5, color: "var(--lg-ink)", fontFamily: "var(--lg-font-body)",
  outline: "none", appearance: "none", cursor: "pointer", transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
};

function EditPaymentContent() {
  const id = useSearchParams().get("id");
  const [record, setRecord] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/admin/pay-records/${id}`).then((res) => setRecord(res.record)).catch(() => setRecord(null));
  }, [id]);

  function set(key, value) {
    setRecord((r) => ({ ...r, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put(`/api/admin/pay-records/${id}`, { payId: record.pay_id, payAmount: record.pay_amount, payStatus: record.pay_status });
      setMessage(res.success ? { type: "success", text: "Payment record updated." } : { type: "error", text: res.message });
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  }

  if (!record) return <Loader style={{ padding: 32 }} />;

  return (
    <div style={{ padding: "2rem", maxWidth: 500, margin: "0 auto" }}>
      <AdminPageHeader title="Edit Payment" subtitle={record.off_name} />
      {message && (
        <div style={{ padding: 14, borderRadius: "var(--lg-radius-sm)", marginBottom: 16, background: message.type === "error" ? "var(--lg-error-soft)" : "var(--lg-success-soft)", color: message.type === "error" ? "var(--lg-error)" : "var(--lg-success)", fontSize: 13, fontWeight: 600 }}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <AdminCard style={{ padding: 26, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
          <div style={field}><label style={label}>Pay ID</label><TextInput required value={record.pay_id} onChange={(e) => set("pay_id", e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent", padding: "11px 14px" }} /></div>
          <div style={field}><label style={label}>Amount</label><TextInput type="number" min="0" step="0.01" required value={record.pay_amount} onChange={(e) => set("pay_amount", e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent", padding: "11px 14px", fontVariantNumeric: "tabular-nums" }} /></div>
          <div style={field}>
            <label style={label}>Status</label>
            <div style={{ position: "relative" }}>
              <select
                value={record.pay_status}
                onChange={(e) => set("pay_status", e.target.value)}
                style={selectStyle}
                onFocus={(e) => { e.target.style.borderColor = "var(--lg-violet)"; e.target.style.background = "var(--lg-paper-raised)"; e.target.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "var(--lg-paper-sunken)"; e.target.style.boxShadow = "none"; }}
              >
                {["Success", "Failed", "Skipped", "Refunded to Wallet", "Processing", "Pending", "Rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--lg-ink-faint)", fontSize: 10 }}>▾</span>
            </div>
          </div>
          <PrimaryButton type="submit" disabled={saving} style={{ borderRadius: "var(--lg-radius-pill)", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))", boxShadow: "0 10px 20px -6px rgba(16,185,129,0.5)", transition: "transform 160ms ease, box-shadow 160ms ease" }}>{saving ? "Saving…" : "Save Changes"}</PrimaryButton>
        </AdminCard>
      </form>
    </div>
  );
}

export default function EditPaymentPage() {
  return (
    <Suspense fallback={<Loader style={{ padding: 32 }} />}>
      <EditPaymentContent />
    </Suspense>
  );
}
