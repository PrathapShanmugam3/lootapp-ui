"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, PrimaryButton, TextInput, StatusBadge } from "@/components/AdminPage";
import Loader from "@/components/Loader";

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

function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: "9px 18px",
        borderRadius: "var(--lg-radius-pill)",
        border: "none",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        background: active ? "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))" : "var(--lg-paper-sunken)",
        color: active ? "#fff" : "var(--lg-ink-soft)",
        textTransform: "capitalize",
        boxShadow: active ? "0 8px 16px -6px rgba(16,185,129,0.5)" : "none",
        transition: "background-color 150ms ease, color 150ms ease, box-shadow 150ms ease, transform 150ms ease",
      }}
    >
      {children}
    </button>
  );
}

function actionBtnStyle(bg, color) {
  return {
    background: bg,
    color,
    border: "none",
    borderRadius: "var(--lg-radius-pill)",
    padding: "10px 20px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    transition: "transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease",
  };
}

function OfferDetailContent() {
  const offId = useSearchParams().get("o");
  const [offer, setOffer] = useState(null);
  const [tab, setTab] = useState("view");
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!offId) return;
    api.get(`/api/admin/offers/${offId}`).then((res) => setOffer(res.offer)).catch(() => setOffer(null));
  }, [offId]);

  function set(key, value) {
    setOffer((o) => ({ ...o, [key]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put(`/api/admin/offers/${offId}`, offer);
      setMessage(res.success ? { type: "success", text: "Offer updated." } : { type: "error", text: res.message });
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await api.del(`/api/admin/offers/${offId}`);
    window.location.href = "/admin/all-offers";
  }

  if (!offer) return <Loader style={{ padding: 32, color: "var(--lg-ink-soft)" }} />;

  const totalPayout = [1, 2, 3, 4, 5].reduce((s, n) => s + Number(offer[`eve_${n}_user_po`] || 0) + Number(offer[`eve_${n}_refer_po`] || 0), 0);

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <AdminPageHeader title={offer.offer_name} subtitle={`ID: ${offer.off_id} · Total payout ₹${totalPayout}`} action={<StatusBadge status={offer.offer_status} />} />

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["view", "edit", "delete"].map((t) => (
          <TabButton key={t} active={tab === t} onClick={() => setTab(t)}>
            {t === "view" ? "Offer Details" : t === "edit" ? "Edit Details" : "Delete Offer"}
          </TabButton>
        ))}
      </div>

      {message && (
        <div style={{ padding: 12, borderRadius: "var(--lg-radius-sm)", marginBottom: 16, background: message.type === "error" ? "var(--lg-error-soft)" : "var(--lg-success-soft)", color: message.type === "error" ? "var(--lg-error)" : "var(--lg-success)", fontSize: 13, fontWeight: 600 }}>
          {message.text}
        </div>
      )}

      {tab === "view" && (
        <AdminCard style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Events &amp; Payouts</h3>
          {[1, 2, 3, 4, 5].filter((n) => offer[`eve_${n}_name`]).map((n) => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--lg-line)", fontSize: 13 }}>
              <span style={{ color: "var(--lg-ink)", fontWeight: 600 }}>{offer[`eve_${n}_name`]}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--lg-ink-soft)" }}>User ₹{offer[`eve_${n}_user_po`]} · Refer ₹{offer[`eve_${n}_refer_po`]}</span>
            </div>
          ))}
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "20px 0 8px", fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Steps</h3>
          <p style={{ fontSize: 13, whiteSpace: "pre-line", color: "var(--lg-ink-soft)" }}>{offer.steps}</p>
        </AdminCard>
      )}

      {tab === "edit" && (
        <form onSubmit={handleSave}>
          <AdminCard style={{ padding: 24, marginBottom: 16 }}>
            <div style={row}>
              <div style={field}><label style={label}>Offer Name</label><TextInput value={offer.offer_name} onChange={(e) => set("offer_name", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
              <div style={field}><label style={label}>Caps</label><TextInput value={offer.caps} onChange={(e) => set("caps", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            </div>
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} style={{ ...row, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: 12 }}>
                <TextInput placeholder={`Event ${n} slug`} value={offer[`eve_${n}`] || ""} onChange={(e) => set(`eve_${n}`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={inputStyle} />
                <TextInput placeholder="Display name" value={offer[`eve_${n}_name`] || ""} onChange={(e) => set(`eve_${n}_name`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={inputStyle} />
                <TextInput type="number" placeholder="User payout" value={offer[`eve_${n}_user_po`] || ""} onChange={(e) => set(`eve_${n}_user_po`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }} />
                <TextInput type="number" placeholder="Refer payout" value={offer[`eve_${n}_refer_po`] || ""} onChange={(e) => set(`eve_${n}_refer_po`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }} />
              </div>
            ))}
            <div style={field}>
              <label style={label}>Offer Status</label>
              <select value={offer.offer_status} onChange={(e) => set("offer_status", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ ...inputStyle, width: 200, cursor: "pointer" }}>
                <option value="live">Live</option><option value="Paused">Paused</option><option value="inactive">Inactive</option>
              </select>
            </div>
          </AdminCard>
          <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</PrimaryButton>
        </form>
      )}

      {tab === "delete" && (
        <AdminCard style={{ padding: 24 }}>
          <p style={{ fontSize: 13, color: "var(--lg-ink-soft)", marginBottom: 16 }}>This permanently deletes the offer. This cannot be undone.</p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={actionBtnStyle("var(--lg-error-soft)", "var(--lg-error)")}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Delete Offer
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleDelete}
                style={actionBtnStyle("var(--lg-error)", "#fff")}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={actionBtnStyle("var(--lg-paper-sunken)", "var(--lg-ink-soft)")}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Cancel
              </button>
            </div>
          )}
        </AdminCard>
      )}
    </div>
  );
}

export default function OfferDetailPage() {
  return (
    <Suspense fallback={<Loader style={{ padding: 32, color: "var(--lg-ink-soft)" }} />}>
      <OfferDetailContent />
    </Suspense>
  );
}
