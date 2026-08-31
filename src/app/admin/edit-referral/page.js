"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, PrimaryButton, TextInput } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const label = { fontSize: 12, fontWeight: 600, color: "var(--lg-ink-soft)", display: "block", marginBottom: 4 };
const field = { marginBottom: 14 };
const row = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 };

function EditReferralContent() {
  const id = useSearchParams().get("id");
  const [referral, setReferral] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/admin/referrals/${id}`).then((res) => setReferral(res.referral)).catch(() => setReferral(null));
  }, [id]);

  function set(key, value) {
    setReferral((r) => ({ ...r, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put(`/api/admin/referrals/${id}`, referral);
      setMessage(res.success ? { type: "success", text: "Referral updated." } : { type: "error", text: res.message });
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  }

  if (!referral) return <Loader style={{ padding: 32 }} />;

  return (
    <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
      <AdminPageHeader title="Edit Referral" subtitle={`Referral #${referral.id}`} />
      {message && (
        <div style={{ padding: 12, borderRadius: "var(--lg-radius-sm)", marginBottom: 16, background: message.type === "error" ? "var(--lg-error-soft)" : "var(--lg-success-soft)", color: message.type === "error" ? "var(--lg-error)" : "var(--lg-success)", fontSize: 13, fontWeight: 600 }}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <AdminCard style={{ padding: 24, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
          <div style={row}>
            <div style={field}><label style={label}>Offer ID</label><TextInput value={referral.offer_id} onChange={(e) => set("offer_id", e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} /></div>
            <div style={field}><label style={label}>Affiliate ID</label><TextInput value={referral.aff_id} onChange={(e) => set("aff_id", e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} /></div>
          </div>
          <div style={row}>
            <div style={field}><label style={label}>Refer Pay ID</label><TextInput value={referral.refer_pay_id} onChange={(e) => set("refer_pay_id", e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} /></div>
            <div style={field}><label style={label}>Refer Code</label><TextInput value={referral.refer_code} onChange={(e) => set("refer_code", e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} /></div>
          </div>
          <div style={field}><label style={label}>Telegram</label><TextInput value={referral.ref_telegram} onChange={(e) => set("ref_telegram", e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} /></div>

          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 10px", fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Payout Split</h3>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} style={{ ...row, marginBottom: 8 }}>
              <TextInput type="number" min="0" step="0.01" placeholder={`Event ${n} User Payout`} value={referral[`eve_${n}_user_po`] || ""} onChange={(e) => set(`eve_${n}_user_po`, e.target.value)} style={{ borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent", fontVariantNumeric: "tabular-nums" }} />
              <TextInput type="number" min="0" step="0.01" placeholder={`Event ${n} Refer Payout`} value={referral[`eve_${n}_refer_po`] || ""} onChange={(e) => set(`eve_${n}_refer_po`, e.target.value)} style={{ borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent", fontVariantNumeric: "tabular-nums" }} />
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</PrimaryButton>
          </div>
        </AdminCard>
      </form>
    </div>
  );
}

export default function EditReferralPage() {
  return (
    <Suspense fallback={<Loader style={{ padding: 32 }} />}>
      <EditReferralContent />
    </Suspense>
  );
}
