"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, PrimaryButton, TextInput } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const label = { fontSize: 12, fontWeight: 600, color: "var(--lg-ink-soft)", display: "block", marginBottom: 4 };
const field = { marginBottom: 14 };

function EditClickContent() {
  const id = useSearchParams().get("id");
  const [click, setClick] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/admin/clicks/${id}`).then((res) => setClick(res.click)).catch(() => setClick(null));
  }, [id]);

  function set(key, value) {
    setClick((c) => ({ ...c, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put(`/api/admin/clicks/${id}`, {
        affId: click.aff_id, offName: click.off_name,
        affSub1: click.aff_sub_1, affSub2: click.aff_sub_2, affSub3: click.aff_sub_3, affSub4: click.aff_sub_4, affSub5: click.aff_sub_5,
        clickStatus: click.click_status,
      });
      setMessage(res.success ? { type: "success", text: "Click updated." } : { type: "error", text: res.message });
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  }

  if (!click) return <Loader style={{ padding: 32 }} />;

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <AdminPageHeader title="Edit Click" subtitle={click.click_id} />
      {message && (
        <div style={{ padding: 12, borderRadius: "var(--lg-radius-sm)", marginBottom: 16, background: message.type === "error" ? "var(--lg-error-soft)" : "var(--lg-success-soft)", color: message.type === "error" ? "var(--lg-error)" : "var(--lg-success)", fontSize: 13, fontWeight: 600 }}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <AdminCard style={{ padding: 24, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
          <div style={field}><label style={label}>Click ID (read-only)</label><TextInput value={click.click_id} disabled style={{ width: "100%", background: "var(--lg-paper-sunken)", borderRadius: "var(--lg-radius-sm)", border: "1.5px solid transparent" }} /></div>
          <div style={field}><label style={label}>Affiliate ID</label><TextInput required value={click.aff_id} onChange={(e) => set("aff_id", e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} /></div>
          <div style={field}><label style={label}>Offer Name</label><TextInput required value={click.off_name} onChange={(e) => set("off_name", e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} /></div>
          <div style={field}><label style={label}>Sub1 (User UPI)</label><TextInput value={click.aff_sub_1} onChange={(e) => set("aff_sub_1", e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} /></div>
          <div style={field}><label style={label}>Sub2 (Refer UPI)</label><TextInput value={click.aff_sub_2} onChange={(e) => set("aff_sub_2", e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} /></div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--lg-ink-soft)", margin: "12px 0 16px", cursor: "pointer" }}>
            <input type="checkbox" checked={click.click_status === "1"} onChange={(e) => set("click_status", e.target.checked ? "1" : "0")} style={{ width: 16, height: 16, accentColor: "var(--lg-violet)", cursor: "pointer" }} />
            Mark as Converted
          </label>
          <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</PrimaryButton>
        </AdminCard>
      </form>
    </div>
  );
}

export default function EditClickPage() {
  return (
    <Suspense fallback={<Loader style={{ padding: 32 }} />}>
      <EditClickContent />
    </Suspense>
  );
}
