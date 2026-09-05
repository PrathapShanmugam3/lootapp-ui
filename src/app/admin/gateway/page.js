"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, PrimaryButton, TextInput } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const emptyForm = {
  id: null, gtype: "upi", gname: "", gurl: "", statusVar: "", successResponse: "", trxIdVar: "", priority: 0, isActive: true,
  callbackUrl: "", callbackStatusVar1: "", callbackStatusVar2: "", callbackSuccessStatus: "",
};

const inputBase = {
  width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent",
  padding: "11px 14px",
};
const selectStyle = {
  ...inputBase, padding: "11px 36px 11px 14px", fontSize: 13.5, color: "var(--lg-ink)", fontFamily: "var(--lg-font-body)",
  outline: "none", appearance: "none", cursor: "pointer", transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
};
function focusOn(e) { e.target.style.borderColor = "var(--lg-violet)"; e.target.style.background = "var(--lg-paper-raised)"; e.target.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12)"; }
function focusOff(e) { e.target.style.borderColor = "transparent"; e.target.style.background = "var(--lg-paper-sunken)"; e.target.style.boxShadow = "none"; }

export default function GatewayPage() {
  const [gateways, setGateways] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null);

  function load() {
    api.get("/api/admin/gateways").then((res) => setGateways(res.gateways)).catch(() => setGateways([]));
  }

  useEffect(() => {
    load();
  }, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await api.post("/api/admin/gateways", form);
      setMessage({ type: "success", text: form.id ? "Gateway updated." : "Gateway added." });
      setForm(emptyForm);
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this gateway?")) return;
    await api.del(`/api/admin/gateways/${id}`);
    load();
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <AdminPageHeader title="Payment Gateways" subtitle="Manage UPI/Bank payout gateway configurations" />

      {message && (
        <div style={{ padding: 14, borderRadius: "var(--lg-radius-sm)", marginBottom: 16, background: message.type === "error" ? "var(--lg-error-soft)" : "var(--lg-success-soft)", color: message.type === "error" ? "var(--lg-error)" : "var(--lg-success)", fontSize: 13, fontWeight: 600 }}>
          {message.text}
        </div>
      )}

      <AdminCard style={{ padding: 26, marginBottom: 24, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--lg-font-display)", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-pink))", display: "inline-block" }} />
          {form.id ? "Edit Gateway" : "Add Gateway"}
        </h3>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 14 }}>
            <div style={{ position: "relative" }}>
              <select value={form.gtype} onChange={(e) => set("gtype", e.target.value)} style={selectStyle} onFocus={focusOn} onBlur={focusOff}>
                <option value="upi">UPI</option><option value="bank">Bank</option>
              </select>
              <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--lg-ink-faint)", fontSize: 10 }}>▾</span>
            </div>
            <TextInput placeholder="Gateway Name" value={form.gname} onChange={(e) => set("gname", e.target.value)} required style={inputBase} />
          </div>
          <TextInput placeholder="Gateway URL template (e.g. https://api.example.com/pay?upi={upi}&amount={amount}&order_id={order_id})" value={form.gurl} onChange={(e) => set("gurl", e.target.value)} style={{ ...inputBase, marginBottom: 14 }} required />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
            <TextInput placeholder="Status field name" value={form.statusVar} onChange={(e) => set("statusVar", e.target.value)} style={inputBase} />
            <TextInput placeholder="Success value" value={form.successResponse} onChange={(e) => set("successResponse", e.target.value)} style={inputBase} />
            <TextInput placeholder="TRX ID field name" value={form.trxIdVar} onChange={(e) => set("trxIdVar", e.target.value)} style={inputBase} />
          </div>

          <h4 style={{ fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", marginBottom: 10 }}>Status Callback (for checking payment status after &quot;Processing&quot;)</h4>
          <TextInput placeholder="Callback URL template (e.g. https://api.example.com/status?order_id={order_id})" value={form.callbackUrl} onChange={(e) => set("callbackUrl", e.target.value)} style={{ ...inputBase, marginBottom: 14 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
            <TextInput placeholder="Status var 1 (parent field)" value={form.callbackStatusVar1} onChange={(e) => set("callbackStatusVar1", e.target.value)} style={inputBase} />
            <TextInput placeholder="Status var 2 (child field)" value={form.callbackStatusVar2} onChange={(e) => set("callbackStatusVar2", e.target.value)} style={inputBase} />
            <TextInput placeholder="Success status value" value={form.callbackSuccessStatus} onChange={(e) => set("callbackSuccessStatus", e.target.value)} style={inputBase} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 18, alignItems: "center" }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", display: "block", marginBottom: 7 }}>Failover priority (lower tried first)</label>
              <TextInput type="number" min="0" value={form.priority} onChange={(e) => set("priority", Number(e.target.value))} style={{ ...inputBase, fontVariantNumeric: "tabular-nums" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, padding: "10px 14px", background: "var(--lg-paper-sunken)", borderRadius: "var(--lg-radius-sm)" }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--lg-ink)" }}>Active (eligible for payout routing)</span>
              <label style={{ position: "relative", width: 40, height: 23, flexShrink: 0, display: "inline-block", cursor: "pointer" }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span
                  style={{
                    position: "absolute", inset: 0, borderRadius: 20, transition: "background-color 160ms ease",
                    background: form.isActive ? "linear-gradient(135deg, var(--lg-violet), var(--lg-pink))" : "var(--lg-line)",
                  }}
                >
                  <span
                    style={{
                      position: "absolute", width: 17, height: 17, left: form.isActive ? 20 : 3, top: 3,
                      background: "#fff", borderRadius: "50%", transition: "left 160ms ease", boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  />
                </span>
              </label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <PrimaryButton type="submit" style={{ borderRadius: "var(--lg-radius-pill)", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))", boxShadow: "0 10px 20px -6px rgba(16,185,129,0.5)", transition: "transform 160ms ease, box-shadow 160ms ease" }}>{form.id ? "Update Gateway" : "Add Gateway"}</PrimaryButton>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                style={{ background: "var(--lg-paper-raised)", border: "1.5px solid var(--lg-line)", color: "var(--lg-ink-soft)", borderRadius: "var(--lg-radius-pill)", padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "border-color 160ms ease, color 160ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--lg-ink-soft)"; e.currentTarget.style.color = "var(--lg-ink)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--lg-line)"; e.currentTarget.style.color = "var(--lg-ink-soft)"; }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </AdminCard>

      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        {!gateways ? (
          <Loader style={{ padding: 32, color: "var(--lg-ink-faint)" }} />
        ) : (
          <AdminTable columns={["#", "ID", "Type", "Name", "Priority", "Active", "Action"]}>
            {gateways.map((g, i) => (
              <React.Fragment key={g.id}>
                <tr style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background-color 140ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--lg-paper-sunken)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "12px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{g.id}</td>
                  <td style={{ padding: "12px 16px", textTransform: "uppercase", fontSize: 11.5, fontWeight: 700, color: "var(--lg-ink-faint)" }}>{g.gtype}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{g.gname}</td>
                  <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{g.priority}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, padding: "4px 11px", borderRadius: "var(--lg-radius-pill)", background: g.is_active ? "var(--lg-success-soft)" : "var(--lg-line-soft)", color: g.is_active ? "var(--lg-success)" : "var(--lg-ink-faint)" }}>
                      {g.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", display: "flex", gap: 14 }}>
                    <button onClick={() => setForm({
                      id: g.id, gtype: g.gtype, gname: g.gname, gurl: g.gurl, statusVar: g.status_var, successResponse: g.success_response, trxIdVar: g.trx_id_var, priority: g.priority, isActive: Boolean(g.is_active),
                      callbackUrl: g.callback_url || "", callbackStatusVar1: g.callback_status_var_1 || "", callbackStatusVar2: g.callback_status_var_2 || "", callbackSuccessStatus: g.callback_success_status || "",
                    })} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 150ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lg-pink)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--lg-violet)")}>Edit</button>
                    <button onClick={() => handleDelete(g.id)} style={{ color: "var(--lg-error)", fontWeight: 700, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0, transition: "opacity 150ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>Delete</button>
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--lg-line-soft)" }}>
                  <td colSpan={7} style={{ padding: "0 16px 14px", fontSize: 11.5, color: "var(--lg-ink-faint)" }}>
                    <div style={{ background: "var(--lg-paper-sunken)", borderRadius: "var(--lg-radius-sm)", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                      <div><strong style={{ color: "var(--lg-ink-soft)" }}>URL:</strong> <span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{g.gurl}</span></div>
                      <div><strong style={{ color: "var(--lg-ink-soft)" }}>Status var:</strong> {g.status_var || "—"} · <strong style={{ color: "var(--lg-ink-soft)" }}>Success value:</strong> {g.success_response || "—"} · <strong style={{ color: "var(--lg-ink-soft)" }}>TRX ID var:</strong> {g.trx_id_var || "—"}</div>
                      {g.callback_url && (
                        <div><strong style={{ color: "var(--lg-ink-soft)" }}>Callback:</strong> <span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{g.callback_url}</span> ({g.callback_status_var_1} → {g.callback_status_var_2} == {g.callback_success_status})</div>
                      )}
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </AdminTable>
        )}
      </AdminCard>
    </div>
  );
}
