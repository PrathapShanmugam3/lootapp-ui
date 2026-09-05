"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, PrimaryButton, TextInput, StatusBadge } from "@/components/AdminPage";
import Loader from "@/components/Loader";
import { showSuccess, showError } from "@/lib/toast";

const label = { fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", display: "block", marginBottom: 7 };
const field = { marginBottom: 18 };
const row = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 };
const sectionTitle = { display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 800, color: "var(--lg-ink)", marginBottom: 18, fontFamily: "var(--lg-font-display)" };
const dot = { width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-pink))", flexShrink: 0 };
const sectionCard = { padding: "26px 28px", marginBottom: 20 };

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

function TextArea({ value, onChange, rows, placeholder }) {
  return <textarea rows={rows} value={value || ""} onChange={onChange} placeholder={placeholder} onFocus={focusIn} onBlur={focusOut} style={{ ...inputStyle, resize: "vertical", fontSize: 13 }} />;
}

function Select({ value, onChange, children, style }) {
  return (
    <select value={value} onChange={onChange} onFocus={focusIn} onBlur={focusOut} style={{ ...inputStyle, cursor: "pointer", ...style }}>
      {children}
    </select>
  );
}

function OfferDetailContent() {
  const offId = useSearchParams().get("o");
  const [offer, setOffer] = useState(null);
  const [tab, setTab] = useState("view");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gateways, setGateways] = useState([]);
  const [conversionEvents, setConversionEvents] = useState([]);

  useEffect(() => {
    if (!offId) return;
    api.get(`/api/admin/offers/${offId}`).then((res) => {
      setOffer(res.offer);
      setConversionEvents((res.offer?.conversion_event || "").split(",").map((s) => s.trim()).filter(Boolean));
    }).catch(() => setOffer(null));
    api.get("/api/admin/offers/gateways").then((res) => setGateways(res.gateways)).catch(() => {});
  }, [offId]);

  function set(key, value) {
    setOffer((o) => ({ ...o, [key]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...offer, conversion_event: conversionEvents.join(",") };
      const res = await api.put(`/api/admin/offers/${offId}`, payload);
      if (res.success) showSuccess("Offer updated.");
      else showError(res.message);
    } catch (err) {
      showError(err.data?.message || err.message);
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
        <form onSubmit={handleSave} noValidate>
          <AdminCard style={sectionCard}>
            <div style={sectionTitle}><span style={dot} />Basic Info</div>
            <div style={row}>
              <div style={field}><label style={label}>Offer Name</label><TextInput required value={offer.offer_name} onChange={(e) => set("offer_name", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
              <div style={field}><label style={label}>Offer Title (use {"{amount}"} for cashback placeholder)</label><TextInput value={offer.offer_title || ""} onChange={(e) => set("offer_title", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            </div>
            <div style={row}>
              <div style={field}><label style={label}>Category</label><TextInput value={offer.category || ""} onChange={(e) => set("category", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
              <div style={field}><label style={label}>Type</label>
                <Select value={offer.type || "cpa"} onChange={(e) => set("type", e.target.value)}>
                  <option value="cpa">CPA</option><option value="cpi">CPI</option><option value="cps">CPS</option>
                </Select>
              </div>
            </div>
          </AdminCard>

          <AdminCard style={sectionCard}>
            <div style={sectionTitle}><span style={dot} />Offer Details</div>
            <div style={field}><label style={label}>Steps (one per line)</label><TextArea rows={4} value={offer.steps} onChange={(e) => set("steps", e.target.value)} /></div>
            <div style={field}><label style={label}>Benefits (one per line)</label><TextArea rows={4} value={offer.offer_benefits} onChange={(e) => set("offer_benefits", e.target.value)} /></div>
            <div style={field}><label style={label}>Fees &amp; Charges (one per line)</label><TextArea rows={3} value={offer.offer_fees_charges} onChange={(e) => set("offer_fees_charges", e.target.value)} /></div>
            <div style={field}><label style={label}>Terms (one per line)</label><TextArea rows={3} value={offer.terms} onChange={(e) => set("terms", e.target.value)} /></div>
          </AdminCard>

          <AdminCard style={sectionCard}>
            <div style={sectionTitle}><span style={dot} />Advertiser</div>
            <div style={row}>
              <div style={field}><label style={label}>Advertiser Name</label><TextInput value={offer.advertiser || ""} onChange={(e) => set("advertiser", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
              <div style={field}><label style={label}>Advertiser Payout</label><TextInput value={offer.advertiser_po || ""} onChange={(e) => set("advertiser_po", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            </div>
            <div style={field}><label style={label}>Offer URL (use {"{click_id}"} placeholder)</label><TextInput type="url" required value={offer.offer_url || ""} onChange={(e) => set("offer_url", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            <div style={row}>
              <div style={field}><label style={label}>Logo URL</label><TextInput value={offer.logo || ""} onChange={(e) => set("logo", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
              <div style={field}><label style={label}>Banner Image URL</label><TextInput value={offer.banner_image || ""} onChange={(e) => set("banner_image", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            </div>
          </AdminCard>

          <AdminCard style={sectionCard}>
            <div style={sectionTitle}><span style={dot} />Events &amp; Payouts</div>
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} style={{ ...row, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: 12 }}>
                <TextInput placeholder={`Event ${n} slug`} value={offer[`eve_${n}`] || ""} onChange={(e) => set(`eve_${n}`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={inputStyle} />
                <TextInput placeholder="Display name" value={offer[`eve_${n}_name`] || ""} onChange={(e) => set(`eve_${n}_name`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={inputStyle} />
                <TextInput type="number" min="0" step="0.01" placeholder="User payout" value={offer[`eve_${n}_user_po`] || ""} onChange={(e) => set(`eve_${n}_user_po`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }} />
                <TextInput type="number" min="0" step="0.01" placeholder="Refer payout" value={offer[`eve_${n}_refer_po`] || ""} onChange={(e) => set(`eve_${n}_refer_po`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }} />
              </div>
            ))}
            <div style={field}>
              <label style={label}>Conversion Events (any one marks the click fully converted)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {[1, 2, 3, 4, 5].filter((n) => (offer[`eve_${n}`] || "").trim()).map((n) => {
                  const slug = offer[`eve_${n}`].trim();
                  const checked = conversionEvents.includes(slug);
                  return (
                    <label key={n} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--lg-ink)", background: "var(--lg-paper-sunken)", padding: "8px 12px", borderRadius: "var(--lg-radius-sm)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setConversionEvents((prev) => e.target.checked ? [...prev, slug] : prev.filter((s) => s !== slug));
                        }}
                      />
                      {(offer[`eve_${n}_name`] || "").trim() || slug}
                    </label>
                  );
                })}
                {[1, 2, 3, 4, 5].every((n) => !(offer[`eve_${n}`] || "").trim()) && (
                  <span style={{ fontSize: 12.5, color: "var(--lg-ink-faint)" }}>Fill in event slugs above to choose which ones count as conversion.</span>
                )}
              </div>
            </div>
          </AdminCard>

          <AdminCard style={sectionCard}>
            <div style={sectionTitle}><span style={dot} />Custom Input Fields</div>
            {[1, 2, 3].map((n) => (
              <div key={n} style={{ ...row, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 12 }}>
                <TextInput placeholder={`Input ${n} label`} value={offer[`input_${n}`] || ""} onChange={(e) => set(`input_${n}`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={inputStyle} />
                <Select value={offer[`input_${n}_type`] || "text"} onChange={(e) => set(`input_${n}_type`, e.target.value)}>
                  <option value="text">Text</option><option value="number">Number</option><option value="email">Email</option><option value="tel">Phone</option><option value="url">URL</option>
                </Select>
              </div>
            ))}
          </AdminCard>

          <AdminCard style={sectionCard}>
            <div style={sectionTitle}><span style={dot} />Payment &amp; Status</div>
            <div style={row}>
              <div style={field}>
                <label style={label}>User Pay Method</label>
                <Select value={offer.pay_method || "upi"} onChange={(e) => set("pay_method", e.target.value)}>
                  <option value="upi">UPI</option><option value="bank">Bank</option><option value="wallet">Wallet</option>
                </Select>
              </div>
              <div style={field}>
                <label style={label}>User Gateway</label>
                <Select value={offer.gateway_user || ""} onChange={(e) => set("gateway_user", e.target.value)}>
                  <option value="">— none —</option>
                  {gateways.map((g) => <option key={g.id} value={g.id}>{g.gname} ({g.gtype})</option>)}
                </Select>
              </div>
            </div>
            <div style={row}>
              <div style={field}>
                <label style={label}>Refer Pay Method</label>
                <Select value={offer.pay_method1 || "upi"} onChange={(e) => set("pay_method1", e.target.value)}>
                  <option value="upi">UPI</option><option value="bank">Bank</option><option value="wallet">Wallet</option>
                </Select>
              </div>
              <div style={field}>
                <label style={label}>Refer Gateway</label>
                <Select value={offer.gateway_refer || ""} onChange={(e) => set("gateway_refer", e.target.value)}>
                  <option value="">— none —</option>
                  {gateways.map((g) => <option key={g.id} value={g.id}>{g.gname} ({g.gtype})</option>)}
                </Select>
              </div>
            </div>
            <div style={row}>
              <div style={field}><label style={label}>Caps</label><TextInput value={offer.caps || ""} onChange={(e) => set("caps", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
              <div style={field}><label style={label}>Pay Limit</label><TextInput value={offer.pay_limit || ""} onChange={(e) => set("pay_limit", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            </div>
            <div style={row}>
              <div style={field}><label style={label}>Pay Time</label><TextInput value={offer.pay_time || ""} onChange={(e) => set("pay_time", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
              <div style={field}><label style={label}>Offer Comment</label><TextInput value={offer.offer_comm || ""} onChange={(e) => set("offer_comm", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            </div>
            <div style={field}>
              <label style={label}>Offer Status</label>
              <Select value={offer.offer_status} onChange={(e) => set("offer_status", e.target.value)} style={{ width: 200 }}>
                <option value="live">Live</option><option value="Paused">Paused</option><option value="inactive">Inactive</option>
              </Select>
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
