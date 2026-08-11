"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, PrimaryButton, TextInput } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const label = { fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", display: "block", marginBottom: 7 };
const field = { marginBottom: 18 };
const row = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 };
const inputBase = { width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent", padding: "11px 14px" };
const selectStyle = {
  ...inputBase, padding: "11px 36px 11px 14px", fontSize: 13.5, color: "var(--lg-ink)", fontFamily: "var(--lg-font-body)",
  outline: "none", appearance: "none", cursor: "pointer", transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
};
function focusOn(e) { e.target.style.borderColor = "var(--lg-violet)"; e.target.style.background = "var(--lg-paper-raised)"; e.target.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12)"; }
function focusOff(e) { e.target.style.borderColor = "transparent"; e.target.style.background = "var(--lg-paper-sunken)"; e.target.style.boxShadow = "none"; }

function StatusSelect({ value, onChange, width }) {
  return (
    <div style={{ position: "relative", width: width || "100%" }}>
      <select value={value} onChange={onChange} style={{ ...selectStyle, width: "100%" }} onFocus={focusOn} onBlur={focusOff}>
        <option value="active">Active</option><option value="inactive">Inactive</option>
      </select>
      <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--lg-ink-faint)", fontSize: 10 }}>▾</span>
    </div>
  );
}

function ActiveToggle({ checked, onChange, label: toggleLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--lg-paper-sunken)", borderRadius: "var(--lg-radius-sm)" }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--lg-ink)" }}>{toggleLabel}</span>
      <label style={{ position: "relative", width: 40, height: 23, flexShrink: 0, display: "inline-block", cursor: "pointer" }}>
        <input type="checkbox" checked={checked === "active"} onChange={(e) => onChange(e.target.checked ? "active" : "inactive")} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{ position: "absolute", inset: 0, borderRadius: 20, transition: "background-color 160ms ease", background: checked === "active" ? "linear-gradient(135deg, var(--lg-violet), var(--lg-pink))" : "var(--lg-line)" }}>
          <span style={{ position: "absolute", width: 17, height: 17, left: checked === "active" ? 20 : 3, top: 3, background: "#fff", borderRadius: "50%", transition: "left 160ms ease", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
        </span>
      </label>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    api.get("/api/admin/settings").then((res) => setSettings(res.settings)).catch(() => setSettings(null));
  }, []);

  function set(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put("/api/admin/settings", settings);
      setMessage(res.success ? { type: "success", text: "Settings saved." } : { type: "error", text: res.message });
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleResetApiKey() {
    if (!window.confirm("Reset the API key? All postback URLs using the old key will stop working.")) return;
    setResetting(true);
    try {
      const res = await api.post("/api/admin/settings/reset-api-key");
      set("valid_api", res.apiKey);
      setMessage({ type: "success", text: "API key reset." });
    } finally {
      setResetting(false);
    }
  }

  if (!settings) return <Loader style={{ padding: 32, color: "var(--lg-ink-faint)" }} />;

  const cardStyle = { padding: 26, marginBottom: 20, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" };
  const sectionTitle = (text) => (
    <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 18, display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--lg-font-display)" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-pink))", display: "inline-block" }} />
      {text}
    </h3>
  );

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <AdminPageHeader title="Settings" subtitle="Global payment gateway and automation config" />
      {message && (
        <div style={{ padding: 14, borderRadius: "var(--lg-radius-sm)", marginBottom: 16, background: message.type === "error" ? "var(--lg-error-soft)" : "var(--lg-success-soft)", color: message.type === "error" ? "var(--lg-error)" : "var(--lg-success)", fontSize: 13, fontWeight: 600 }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave}>
        <AdminCard style={cardStyle}>
          {sectionTitle("Default UPI Payment Settings")}
          <div style={field}><label style={label}>Pay URL Template</label><TextInput value={settings.pay_url} onChange={(e) => set("pay_url", e.target.value)} style={inputBase} /></div>
          <div style={row}>
            <div style={field}><label style={label}>Status Var</label><TextInput value={settings.status_var} onChange={(e) => set("status_var", e.target.value)} style={inputBase} /></div>
            <div style={field}><label style={label}>Success Response</label><TextInput value={settings.success_response} onChange={(e) => set("success_response", e.target.value)} style={inputBase} /></div>
          </div>
          <div style={field}><label style={label}>TRX ID Var</label><TextInput value={settings.trx_id_var} onChange={(e) => set("trx_id_var", e.target.value)} style={inputBase} /></div>
        </AdminCard>

        <AdminCard style={cardStyle}>
          {sectionTitle("Callback Settings")}
          <div style={field}><label style={label}>Callback URL</label><TextInput value={settings.callback_url} onChange={(e) => set("callback_url", e.target.value)} style={inputBase} /></div>
          <div style={row}>
            <div style={field}><label style={label}>Status Var 1 (parent)</label><TextInput value={settings.callback_status_var_1} onChange={(e) => set("callback_status_var_1", e.target.value)} style={inputBase} /></div>
            <div style={field}><label style={label}>Status Var 2 (child)</label><TextInput value={settings.callback_status_var_2} onChange={(e) => set("callback_status_var_2", e.target.value)} style={inputBase} /></div>
          </div>
          <div style={field}><label style={label}>Success Status</label><TextInput value={settings.callback_success_status} onChange={(e) => set("callback_success_status", e.target.value)} style={inputBase} /></div>
        </AdminCard>

        <AdminCard style={cardStyle}>
          {sectionTitle("User Wallet Gateway")}
          <div style={row}>
            <div style={field}>
              <label style={label}>UPI Gateway ID</label><TextInput value={settings.upi_gateway || ""} onChange={(e) => set("upi_gateway", e.target.value)} style={inputBase} />
            </div>
            <div style={field}>
              <label style={label}>UPI Status</label>
              <StatusSelect value={settings.upi_status || "inactive"} onChange={(e) => set("upi_status", e.target.value)} />
            </div>
          </div>
          <div style={row}>
            <div style={field}><label style={label}>Bank Gateway ID</label><TextInput value={settings.bank_gateway || ""} onChange={(e) => set("bank_gateway", e.target.value)} style={inputBase} /></div>
            <div style={field}>
              <label style={label}>Bank Status</label>
              <StatusSelect value={settings.bank_status || "inactive"} onChange={(e) => set("bank_status", e.target.value)} />
            </div>
          </div>
        </AdminCard>

        <AdminCard style={cardStyle}>
          {sectionTitle("Referral Wallet Gateway")}
          <div style={row}>
            <div style={field}><label style={label}>Refer UPI Gateway ID</label><TextInput value={settings.r_upi_gateway || ""} onChange={(e) => set("r_upi_gateway", e.target.value)} style={inputBase} /></div>
            <div style={field}>
              <label style={label}>Refer UPI Status</label>
              <StatusSelect value={settings.r_upi_status || "inactive"} onChange={(e) => set("r_upi_status", e.target.value)} />
            </div>
          </div>
          <div style={row}>
            <div style={field}><label style={label}>Refer Bank Gateway ID</label><TextInput value={settings.r_bank_gateway || ""} onChange={(e) => set("r_bank_gateway", e.target.value)} style={inputBase} /></div>
            <div style={field}>
              <label style={label}>Refer Bank Status</label>
              <StatusSelect value={settings.r_bank_status || "inactive"} onChange={(e) => set("r_bank_status", e.target.value)} />
            </div>
          </div>
        </AdminCard>

        <AdminCard style={cardStyle}>
          {sectionTitle("Auto Payment")}
          <div style={row}>
            <ActiveToggle checked={settings.camp_auto_pay} onChange={(v) => set("camp_auto_pay", v)} label="Campaign Auto Pay" />
            <ActiveToggle checked={settings.wallet_auto_pay} onChange={(v) => set("wallet_auto_pay", v)} label="Wallet Auto Pay" />
          </div>
        </AdminCard>

        <AdminCard style={cardStyle}>
          {sectionTitle("Security")}
          <div style={field}>
            <label style={label}>VPN / Proxy Blocking (applied to signup and other public entry points)</label>
            <StatusSelect value={settings.vpn_block_enabled || "active"} onChange={(e) => set("vpn_block_enabled", e.target.value)} width={240} />
          </div>
        </AdminCard>

        <PrimaryButton type="submit" disabled={saving} style={{ borderRadius: "var(--lg-radius-pill)", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))", boxShadow: "0 10px 20px -6px rgba(16,185,129,0.5)", transition: "transform 160ms ease, box-shadow 160ms ease" }}>{saving ? "Saving…" : "Save Settings"}</PrimaryButton>
      </form>

      <AdminCard style={{ padding: 26, marginTop: 24, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8, fontFamily: "var(--lg-font-display)" }}>Server / API Key</h3>
        <p style={{ fontSize: 12, color: "var(--lg-ink-faint)", marginBottom: 12 }}>Current key: <code style={{ background: "var(--lg-paper-sunken)", padding: "2px 8px", borderRadius: 6 }}>{settings.valid_api}</code></p>
        <button
          onClick={handleResetApiKey}
          disabled={resetting}
          style={{ background: "var(--lg-error-soft)", color: "var(--lg-error)", border: "none", borderRadius: "var(--lg-radius-pill)", padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: resetting ? "not-allowed" : "pointer", opacity: resetting ? 0.6 : 1, transition: "transform 150ms ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          {resetting ? "Resetting…" : "Reset API Key"}
        </button>
      </AdminCard>
    </div>
  );
}
