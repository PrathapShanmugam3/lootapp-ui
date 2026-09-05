"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, PrimaryButton, TextInput } from "@/components/AdminPage";
import Loader from "@/components/Loader";
import { showSuccess, showError } from "@/lib/toast";

const label = { fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", display: "block", marginBottom: 7 };
const field = { marginBottom: 18 };
const row = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 };

const inputStyle = {
  width: "100%",
  background: "var(--lg-paper-sunken)",
  border: "1.5px solid transparent",
  borderRadius: "var(--lg-radius-sm)",
  padding: "11px 14px",
  fontFamily: "var(--lg-font-body)",
  fontSize: 13.5,
  color: "var(--lg-ink)",
  outline: "none",
  transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
};
function focusIn(e) {
  e.currentTarget.style.borderColor = "var(--lg-violet)";
  e.currentTarget.style.background = "var(--lg-paper-raised)";
  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12)";
}
function focusOut(e) {
  e.currentTarget.style.borderColor = "transparent";
  e.currentTarget.style.background = "var(--lg-paper-sunken)";
  e.currentTarget.style.boxShadow = "none";
}

const STATE_COLORS = { active: "var(--lg-success)", suspended: "var(--lg-warning)", banned: "var(--lg-error)" };

function pillBtnStyle(bg, color) {
  return {
    background: bg,
    color,
    border: "none",
    borderRadius: "var(--lg-radius-pill)",
    padding: "9px 16px",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    transition: "transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease",
  };
}

function StateButton({ children, disabled, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={{ ...props.style, opacity: disabled ? 0.5 : 1, cursor: disabled ? "default" : "pointer" }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {children}
    </button>
  );
}

function EditUserContent() {
  const id = useSearchParams().get("id");
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [auditLog, setAuditLog] = useState(null);
  const [stateReason, setStateReason] = useState("");
  const [stateSaving, setStateSaving] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");

  function loadUser() {
    api.get(`/api/admin/users/${id}`).then((res) => setUser(res.user)).catch(() => setUser(null));
  }
  function loadAuditLog() {
    api.get(`/api/admin/users/${id}/audit-log`).then((res) => setAuditLog(res.log)).catch(() => setAuditLog([]));
  }

  useEffect(() => {
    if (!id) return;
    loadUser();
    loadAuditLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStateChange(state) {
    if (state !== "active" && !window.confirm(`Set this account to "${state}"? The user will be logged out and unable to sign in.`)) return;
    setStateSaving(true);
    try {
      await api.put(`/api/admin/users/${id}/account-state`, { state, reason: stateReason });
      setStateReason("");
      loadUser();
      loadAuditLog();
    } finally {
      setStateSaving(false);
    }
  }

  function set(key, value) {
    setUser((u) => ({ ...u, [key]: value }));
  }

  function applyAdjustment(sign) {
    const amount = Number(adjustAmount);
    if (!amount || amount <= 0) return;
    const newBalance = Math.max(0, Number(user.balance) + sign * amount);
    set("balance", newBalance);
    setAdjustAmount("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/api/admin/users/${id}`, {
        name: user.name, email: user.email, mobile: user.mobile, upi: user.upi,
        accNo: user.acc_no, ifsc: user.ifsc, balance: Number(user.balance), status: user.status, comment,
      });
      if (res.success) showSuccess("User updated.");
      else showError(res.message);
    } catch (err) {
      showError(err.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <Loader style={{ padding: 32, color: "var(--lg-ink-soft)" }} />;

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <AdminPageHeader title="Edit User" subtitle={`User ID: ${user.user_id} · Last login: ${user.last_login || "never"}`} />
      <form onSubmit={handleSubmit} noValidate>
        <AdminCard style={{ padding: 24 }}>
          <div style={row}>
            <div style={field}><label style={label}>Name</label><TextInput required maxLength={100} value={user.name} onChange={(e) => set("name", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            <div style={field}><label style={label}>Email</label><TextInput type="email" required value={user.email} onChange={(e) => set("email", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
          </div>
          <div style={row}>
            <div style={field}><label style={label}>Mobile</label><TextInput type="tel" required pattern="[0-9]{10}" title="Enter a valid 10-digit mobile number" maxLength={10} value={user.mobile} onChange={(e) => set("mobile", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            <div style={field}><label style={label}>UPI</label><TextInput pattern=".*@.*" title="Enter a valid UPI ID (must contain @)" value={user.upi || ""} onChange={(e) => set("upi", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
          </div>
          <div style={row}>
            <div style={field}><label style={label}>Account Number</label><TextInput pattern="[0-9]{9,18}" title="Enter a valid account number (9-18 digits)" value={user.acc_no || ""} onChange={(e) => set("acc_no", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            <div style={field}><label style={label}>IFSC</label><TextInput pattern="[A-Z]{4}0[A-Z0-9]{6}" maxLength={11} title="Enter a valid IFSC code (e.g. HDFC0001234)" value={user.ifsc || ""} onChange={(e) => set("ifsc", e.target.value.toUpperCase())} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
          </div>
          <div style={row}>
            <div style={field}><label style={label}>Balance (₹)</label><TextInput type="number" step="0.01" min="0" required value={user.balance} onChange={(e) => set("balance", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle, fontVariantNumeric: "tabular-nums" }} /></div>
            <div style={field}>
              <label style={label}>Status</label>
              <select value={user.status} onChange={(e) => set("status", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="1">Active</option><option value="0">Inactive</option>
              </select>
            </div>
          </div>
          <div style={field}>
            <label style={label}>Add / Cut Balance</label>
            <div style={{ display: "flex", gap: 8 }}>
              <TextInput type="number" step="0.01" min="0" placeholder="Amount" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ flex: 1, ...inputStyle, fontVariantNumeric: "tabular-nums" }} />
              <button type="button" onClick={() => applyAdjustment(1)} style={{ ...pillBtnStyle("var(--lg-success-soft)", "var(--lg-success)"), padding: "0 18px" }}>+ Add</button>
              <button type="button" onClick={() => applyAdjustment(-1)} style={{ ...pillBtnStyle("var(--lg-error-soft)", "var(--lg-error)"), padding: "0 18px" }}>− Cut</button>
            </div>
            <span style={{ fontSize: 11.5, color: "var(--lg-ink-faint)", marginTop: 6, display: "block" }}>Applies to the Balance field above — remember to Save Changes after.</span>
          </div>
          <div style={field}>
            <label style={label}>Balance Adjustment Comment (if changing balance)</label>
            <TextInput value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Reason for balance change" onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} />
          </div>
          <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</PrimaryButton>
        </AdminCard>
      </form>

      <AdminCard style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Account Status</h3>
        <p style={{ fontSize: 13, marginBottom: 12, color: "var(--lg-ink-soft)" }}>
          Currently: <span style={{ fontWeight: 700, color: STATE_COLORS[user.account_state] || "var(--lg-ink-faint)", textTransform: "capitalize" }}>{user.account_state}</span>
        </p>
        <TextInput placeholder="Reason (optional)" value={stateReason} onChange={(e) => setStateReason(e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", marginBottom: 12, ...inputStyle }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StateButton disabled={stateSaving || user.account_state === "active"} onClick={() => handleStateChange("active")} style={pillBtnStyle("var(--lg-success-soft)", "var(--lg-success)")}>Reactivate</StateButton>
          <StateButton disabled={stateSaving || user.account_state === "suspended"} onClick={() => handleStateChange("suspended")} style={pillBtnStyle("var(--lg-warning-soft)", "var(--lg-warning)")}>Suspend</StateButton>
          <StateButton disabled={stateSaving || user.account_state === "banned"} onClick={() => handleStateChange("banned")} style={pillBtnStyle("var(--lg-error-soft)", "var(--lg-error)")}>Ban</StateButton>
        </div>
      </AdminCard>

      <AdminCard style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Activity Log</h3>
        {!auditLog ? (
          <Loader style={{ fontSize: 13, color: "var(--lg-ink-faint)" }} />
        ) : auditLog.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--lg-ink-faint)" }}>No activity recorded yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {auditLog.map((entry) => (
              <div key={entry.id} style={{ fontSize: 12, borderBottom: "1px solid var(--lg-line-soft)", paddingBottom: 10 }}>
                <span style={{ fontWeight: 700, color: "var(--lg-ink)" }}>{entry.action}</span>
                {entry.detail && <span style={{ color: "var(--lg-ink-soft)" }}> — {entry.detail}</span>}
                <div style={{ color: "var(--lg-ink-faint)", marginTop: 2 }}>by {entry.actor_user_id} · {new Date(entry.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}

export default function EditUserPage() {
  return (
    <Suspense fallback={<Loader style={{ padding: 32, color: "var(--lg-ink-soft)" }} />}>
      <EditUserContent />
    </Suspense>
  );
}
