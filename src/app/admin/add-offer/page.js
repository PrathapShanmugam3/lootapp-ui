"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, PrimaryButton, TextInput } from "@/components/AdminPage";

const label = { fontSize: 12.5, fontWeight: 700, color: "var(--lg-ink-soft)", display: "block", marginBottom: 7 };
const field = { marginBottom: 18 };
const row = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 };
const sectionTitle = { display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 800, color: "var(--lg-ink)", marginBottom: 18, fontFamily: "var(--lg-font-display)" };
const dot = { width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-pink))", flexShrink: 0 };

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

function Select({ value, onChange, children, style }) {
  return (
    <select value={value} onChange={onChange} onFocus={focusIn} onBlur={focusOut} style={{ ...inputStyle, cursor: "pointer", ...style }}>
      {children}
    </select>
  );
}

function TextArea({ value, onChange, rows, placeholder }) {
  return <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder} onFocus={focusIn} onBlur={focusOut} style={{ ...inputStyle, resize: "vertical", fontSize: 13 }} />;
}

function Field({ children, style }) {
  return <TextInput {...children} style={{ width: "100%", ...inputStyle, ...style }} onFocus={focusIn} onBlur={focusOut} />;
}

const sectionCard = { padding: "26px 28px", marginBottom: 20 };

export default function AddOfferPage() {
  const router = useRouter();
  const [gateways, setGateways] = useState([]);
  const [form, setForm] = useState({
    offer_name: "", offer_title: "", category: "", type: "cpa",
    steps: "", offer_benefits: "", offer_fees_charges: "", terms: "",
    advertiser: "", advertiser_po: "", offer_url: "", logo: "", banner_image: "",
    conversion_event: "", caps: "", pay_time: "", pay_method: "upi", pay_method1: "upi",
    gateway_user: "", gateway_refer: "", visibility: "all", offer_status: "live",
    manual_event: "", offer_comm: "", pay_limit: "",
    eve_1: "", eve_1_name: "", eve_1_user_po: "", eve_1_refer_po: "",
    eve_2: "", eve_2_name: "", eve_2_user_po: "", eve_2_refer_po: "",
    eve_3: "", eve_3_name: "", eve_3_user_po: "", eve_3_refer_po: "",
    input_1: "", input_1_type: "text", input_2: "", input_2_type: "text", input_3: "", input_3_type: "text",
  });
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/api/admin/offers/gateways").then((res) => setGateways(res.gateways)).catch(() => {});
  }, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.post("/api/admin/offers", form);
      if (res.success) {
        router.push(`/admin/offer-detail?o=${res.offId}`);
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <AdminPageHeader title="Add Offer" subtitle="Create a new campaign" />
      {message && (
        <div style={{ padding: 12, borderRadius: "var(--lg-radius-sm)", marginBottom: 16, background: message.type === "error" ? "var(--lg-error-soft)" : "var(--lg-success-soft)", color: message.type === "error" ? "var(--lg-error)" : "var(--lg-success)", fontSize: 13, fontWeight: 600 }}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <AdminCard style={sectionCard}>
          <div style={sectionTitle}><span style={dot} />Basic Info</div>
          <div style={row}>
            <div style={field}><label style={label}>Offer Name</label><TextInput required value={form.offer_name} onChange={(e) => set("offer_name", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            <div style={field}><label style={label}>Offer Title (use {"{amount}"} for cashback placeholder)</label><TextInput value={form.offer_title} onChange={(e) => set("offer_title", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
          </div>
          <div style={row}>
            <div style={field}><label style={label}>Category</label><TextInput value={form.category} onChange={(e) => set("category", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            <div style={field}><label style={label}>Type</label>
              <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option value="cpa">CPA</option><option value="cpi">CPI</option><option value="cps">CPS</option>
              </Select>
            </div>
          </div>
        </AdminCard>

        <AdminCard style={sectionCard}>
          <div style={sectionTitle}><span style={dot} />Offer Details</div>
          <div style={field}><label style={label}>Steps (one per line)</label><TextArea rows={4} value={form.steps} onChange={(e) => set("steps", e.target.value)} /></div>
          <div style={field}><label style={label}>Benefits (one per line)</label><TextArea rows={4} value={form.offer_benefits} onChange={(e) => set("offer_benefits", e.target.value)} /></div>
          <div style={field}><label style={label}>Fees &amp; Charges (one per line)</label><TextArea rows={3} value={form.offer_fees_charges} onChange={(e) => set("offer_fees_charges", e.target.value)} /></div>
          <div style={field}><label style={label}>Terms (one per line)</label><TextArea rows={3} value={form.terms} onChange={(e) => set("terms", e.target.value)} /></div>
        </AdminCard>

        <AdminCard style={sectionCard}>
          <div style={sectionTitle}><span style={dot} />Advertiser</div>
          <div style={row}>
            <div style={field}><label style={label}>Advertiser Name</label><TextInput value={form.advertiser} onChange={(e) => set("advertiser", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            <div style={field}><label style={label}>Advertiser Payout</label><TextInput value={form.advertiser_po} onChange={(e) => set("advertiser_po", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
          </div>
          <div style={field}><label style={label}>Offer URL (use {"{click_id}"} placeholder)</label><TextInput value={form.offer_url} onChange={(e) => set("offer_url", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
          <div style={row}>
            <div style={field}><label style={label}>Logo URL</label><TextInput value={form.logo} onChange={(e) => set("logo", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            <div style={field}><label style={label}>Banner Image URL</label><TextInput value={form.banner_image} onChange={(e) => set("banner_image", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
          </div>
        </AdminCard>

        <AdminCard style={sectionCard}>
          <div style={sectionTitle}><span style={dot} />Events &amp; Payouts</div>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ ...row, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: 12 }}>
              <TextInput placeholder={`Event ${n} slug`} value={form[`eve_${n}`]} onChange={(e) => set(`eve_${n}`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={inputStyle} />
              <TextInput placeholder="Display name" value={form[`eve_${n}_name`]} onChange={(e) => set(`eve_${n}_name`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={inputStyle} />
              <TextInput type="number" placeholder="User payout" value={form[`eve_${n}_user_po`]} onChange={(e) => set(`eve_${n}_user_po`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }} />
              <TextInput type="number" placeholder="Refer payout" value={form[`eve_${n}_refer_po`]} onChange={(e) => set(`eve_${n}_refer_po`, e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }} />
            </div>
          ))}
          <div style={field}><label style={label}>Conversion Event (terminal event slug)</label><TextInput value={form.conversion_event} onChange={(e) => set("conversion_event", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
        </AdminCard>

        <AdminCard style={sectionCard}>
          <div style={sectionTitle}><span style={dot} />Payment &amp; Status</div>
          <div style={row}>
            <div style={field}>
              <label style={label}>User Pay Method</label>
              <Select value={form.pay_method} onChange={(e) => set("pay_method", e.target.value)}>
                <option value="upi">UPI</option><option value="bank">Bank</option><option value="wallet">Wallet</option>
              </Select>
            </div>
            <div style={field}>
              <label style={label}>User Gateway</label>
              <Select value={form.gateway_user} onChange={(e) => set("gateway_user", e.target.value)}>
                <option value="">— none —</option>
                {gateways.map((g) => <option key={g.id} value={g.id}>{g.gname} ({g.gtype})</option>)}
              </Select>
            </div>
          </div>
          <div style={row}>
            <div style={field}>
              <label style={label}>Refer Pay Method</label>
              <Select value={form.pay_method1} onChange={(e) => set("pay_method1", e.target.value)}>
                <option value="upi">UPI</option><option value="bank">Bank</option><option value="wallet">Wallet</option>
              </Select>
            </div>
            <div style={field}>
              <label style={label}>Refer Gateway</label>
              <Select value={form.gateway_refer} onChange={(e) => set("gateway_refer", e.target.value)}>
                <option value="">— none —</option>
                {gateways.map((g) => <option key={g.id} value={g.id}>{g.gname} ({g.gtype})</option>)}
              </Select>
            </div>
          </div>
          <div style={row}>
            <div style={field}><label style={label}>Caps</label><TextInput value={form.caps} onChange={(e) => set("caps", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
            <div style={field}><label style={label}>Pay Limit</label><TextInput value={form.pay_limit} onChange={(e) => set("pay_limit", e.target.value)} onFocus={focusIn} onBlur={focusOut} style={{ width: "100%", ...inputStyle }} /></div>
          </div>
          <div style={field}>
            <label style={label}>Offer Status</label>
            <Select value={form.offer_status} onChange={(e) => set("offer_status", e.target.value)} style={{ width: 200 }}>
              <option value="live">Live</option><option value="Paused">Paused</option><option value="inactive">Inactive</option>
            </Select>
          </div>
        </AdminCard>

        <div style={{ display: "flex", gap: 12 }}>
          <PrimaryButton type="submit" disabled={saving}>{saving ? "Creating…" : "Create Offer"}</PrimaryButton>
        </div>
      </form>
    </div>
  );
}
