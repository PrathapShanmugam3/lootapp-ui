"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, PrimaryButton, TextInput } from "@/components/AdminPage";
import Loader, { InlineLoader } from "@/components/Loader";

const label = { fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", display: "block", marginBottom: 7 };
const field = { marginBottom: 18 };
const row = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };

function UserDetailsContent() {
  const userId = useSearchParams().get("user_id");
  const [user, setUser] = useState(null);
  const [dbId, setDbId] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    api.get(`/api/emp/users?search=${userId}&page=1`).then((res) => {
      const match = res.users.find((u) => u.user_id === userId);
      if (match) {
        setDbId(match.id);
        api.get(`/api/emp/users/${match.id}`).then((r) => setUser(r.user));
      }
    });
  }, [userId]);

  function set(key, value) {
    setUser((u) => ({ ...u, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put(`/api/emp/users/${dbId}`, {
        name: user.name, email: user.email, mobile: user.mobile, upi: user.upi, status: user.status,
      });
      setMessage(res.success ? { type: "success", text: "User updated." } : { type: "error", text: res.message });
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <Loader style={{ padding: 32 }} />;

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <AdminPageHeader title="User Details" subtitle={`User ID: ${user.user_id}`} />
      {message && (
        <div
          style={{
            padding: 14,
            borderRadius: "var(--lg-radius-sm)",
            marginBottom: 16,
            background: message.type === "error" ? "var(--lg-error-soft)" : "var(--lg-success-soft)",
            color: message.type === "error" ? "var(--lg-error)" : "var(--lg-success)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <AdminCard style={{ padding: 26 }}>
          <div style={row}>
            <div style={field}><label style={label}>Name</label><TextInput required maxLength={100} value={user.name} onChange={(e) => set("name", e.target.value)} style={{ width: "100%" }} /></div>
            <div style={field}><label style={label}>Email</label><TextInput type="email" required value={user.email} onChange={(e) => set("email", e.target.value)} style={{ width: "100%" }} /></div>
          </div>
          <div style={row}>
            <div style={field}><label style={label}>Mobile</label><TextInput type="tel" required pattern="[0-9]{10}" maxLength={10} title="Enter a valid 10-digit mobile number" value={user.mobile} onChange={(e) => set("mobile", e.target.value)} style={{ width: "100%" }} /></div>
            <div style={field}><label style={label}>UPI</label><TextInput pattern=".*@.*" title="Enter a valid UPI ID (must contain @)" value={user.upi || ""} onChange={(e) => set("upi", e.target.value)} style={{ width: "100%" }} /></div>
          </div>
          <div style={{ ...field, background: "var(--lg-paper-sunken)", padding: 14, borderRadius: "var(--lg-radius-sm)" }}>
            <label style={label}>Balance (view only — contact admin to adjust)</label>
            <p style={{ fontSize: 20, fontWeight: 700, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)", fontVariantNumeric: "tabular-nums" }}>₹{Number(user.balance).toLocaleString("en-IN")}</p>
          </div>
          <PrimaryButton type="submit" disabled={saving}>{saving ? <><InlineLoader style={{ marginRight: 8 }} />Saving…</> : "Save Changes"}</PrimaryButton>
        </AdminCard>
      </form>
    </div>
  );
}

export default function UserDetailsPage() {
  return (
    <Suspense fallback={<Loader style={{ padding: 32 }} />}>
      <UserDetailsContent />
    </Suspense>
  );
}
