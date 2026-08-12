"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, PrimaryButton, TextInput, Pagination } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function RedeemCodesPage() {
  const [data, setData] = useState(null);
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [expiresAt, setExpiresAt] = useState("");
  const [newCode, setNewCode] = useState(null);
  const [message, setMessage] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  function load() {
    api.get(`/api/admin/redeem-codes?page=${page}&limit=${limit}`).then(setData).catch(() => setData(null));
  }

  useEffect(() => {
    load();
  }, [page, limit]);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage(null);
    setNewCode(null);
    try {
      const res = await api.post("/api/admin/redeem-codes", { value: Number(value), maxUses: Number(maxUses), expiresAt: expiresAt || null });
      setNewCode(res.code);
      setValue("");
      setMaxUses(1);
      setExpiresAt("");
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    }
  }

  async function handleToggle(id, isActive) {
    await api.put(`/api/admin/redeem-codes/${id}/toggle`, { isActive: !isActive });
    load();
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <AdminPageHeader title="Redeem Codes" subtitle="Generate wallet-credit codes for affiliates" />

      {newCode && (
        <div style={{ padding: 16, borderRadius: "var(--lg-radius-sm)", marginBottom: 16, background: "var(--lg-success-soft)", color: "var(--lg-success)", fontSize: 14, fontWeight: 700 }}>
          Code created: <code style={{ fontSize: 16, background: "rgba(255,255,255,0.5)", padding: "2px 8px", borderRadius: 6 }}>{newCode}</code>
        </div>
      )}
      {message && (
        <div style={{ padding: 14, borderRadius: "var(--lg-radius-sm)", marginBottom: 16, background: "var(--lg-error-soft)", color: "var(--lg-error)", fontSize: 13, fontWeight: 600 }}>{message.text}</div>
      )}

      <AdminCard style={{ padding: 26, marginBottom: 24, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--lg-font-display)", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-pink))", display: "inline-block" }} />
          Generate Code
        </h3>
        <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", display: "block", marginBottom: 7 }}>Value (₹)</label>
            <TextInput type="number" required value={value} onChange={(e) => setValue(e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent", padding: "11px 14px", fontVariantNumeric: "tabular-nums" }} />
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", display: "block", marginBottom: 7 }}>Max Uses</label>
            <TextInput type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent", padding: "11px 14px", fontVariantNumeric: "tabular-nums" }} />
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", display: "block", marginBottom: 7 }}>Expires (optional)</label>
            <TextInput type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent", padding: "11px 14px" }} />
          </div>
          <PrimaryButton type="submit" style={{ borderRadius: "var(--lg-radius-pill)", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))", boxShadow: "0 10px 20px -6px rgba(16,185,129,0.5)", transition: "transform 160ms ease, box-shadow 160ms ease" }}>Generate</PrimaryButton>
        </form>
      </AdminCard>

      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        {!data ? (
          <Loader style={{ padding: 32, color: "var(--lg-ink-faint)" }} />
        ) : (
          <>
          <AdminTable columns={["#", "Code", "Value", "Uses", "Expires", "Active", "Action"]}>
            {data.codes.map((c, i) => (
              <tr key={c.id} style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background-color 140ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--lg-paper-sunken)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "12px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                <td style={{ padding: "12px 16px", fontFamily: "monospace" }}>{c.code}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>₹{c.value}</td>
                <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{c.uses} / {c.max_uses}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--lg-ink-faint)" }}>{c.expires_at || "Never"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, padding: "4px 11px", borderRadius: "var(--lg-radius-pill)", background: c.is_active ? "var(--lg-success-soft)" : "var(--lg-line-soft)", color: c.is_active ? "var(--lg-success)" : "var(--lg-ink-faint)" }}>
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={() => handleToggle(c.id, c.is_active)} style={{ color: c.is_active ? "var(--lg-error)" : "var(--lg-success)", fontWeight: 700, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0, transition: "opacity 150ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                    {c.is_active ? "Deactivate" : "Activate"}
                  </button>
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
