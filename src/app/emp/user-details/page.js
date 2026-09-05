"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, PrimaryButton, TextInput } from "@/components/AdminPage";
import Loader, { InlineLoader } from "@/components/Loader";
import { showSuccess, showError } from "@/lib/toast";

const label = { fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", display: "block", marginBottom: 7 };
const field = { marginBottom: 18 };
const row = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };

function UserDetailsContent() {
  const userId = useSearchParams().get("user_id");
  const [user, setUser] = useState(null);
  const [dbId, setDbId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    api.get(`/api/emp/users/by-user-id/${userId}`)
      .then((res) => {
        if (res.success) {
          setDbId(res.user.id);
          setUser(res.user);
        } else {
          setLoadError(res.message || "User not found.");
        }
      })
      .catch((err) => setLoadError(err.data?.message || err.message || "Failed to load user."));
  }, [userId]);

  function set(key, value) {
    setUser((u) => ({ ...u, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/api/emp/users/${dbId}`, {
        name: user.name, email: user.email, mobile: user.mobile, upi: user.upi, status: user.status,
      });
      if (res.success) showSuccess("User updated.");
      else showError(res.message);
    } catch (err) {
      showError(err.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  const effectiveError = !userId ? "No user ID provided." : loadError;
  if (effectiveError) {
    return (
      <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ padding: 14, borderRadius: "var(--lg-radius-sm)", background: "var(--lg-error-soft)", color: "var(--lg-error)", fontSize: 13, fontWeight: 600 }}>
          {effectiveError}
        </div>
      </div>
    );
  }
  if (!user) return <Loader style={{ padding: 32 }} />;

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <AdminPageHeader title="User Details" subtitle={`User ID: ${user.user_id}`} />
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
