"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { splitLines, parseFees, parseTerms, initialsOf } from "@/lib/offerDetailHelpers";
import Loader from "@/components/Loader";

function TermIcon({ icon }) {
  const common = { className: "h-3.5 w-3.5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" };
  if (icon === "zap") return <svg {...common}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
  if (icon === "clock") return <svg {...common}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
  if (icon === "shield") return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  return (
    <svg {...common}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] transition-colors hover:opacity-80"
      style={{ background: "var(--lg-violet-soft)", color: "var(--lg-violet)" }}
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      {copied ? (
        <svg className="h-[15px] w-[15px] text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
      ) : (
        <svg className="h-[15px] w-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
      )}
    </button>
  );
}

function Toast({ toast, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  const borderColor = { success: "var(--lg-success)", error: "var(--lg-error)", warning: "var(--lg-warning)" }[toast.type] || "var(--lg-ink-soft)";
  return (
    <div
      className="toast show"
      style={{ background: "var(--lg-paper-raised)", color: "var(--lg-ink)", padding: "12px 24px", borderRadius: 8, boxShadow: "var(--lg-shadow-md)", fontSize: 13, fontWeight: 500, borderLeft: `4px solid ${borderColor}` }}
    >
      {toast.message}
    </div>
  );
}

function PayoutModal({ offer, referralLink, onClose, onSaved }) {
  const [rows, setRows] = useState(
    offer.events.map((e, i) => ({
      index: i,
      name: e.name,
      totalPayout: e.userPayout + e.referPayout,
      userPayout: referralLink.currentSplit[e.index - 1]?.userPayout ?? 0,
      referPayout: referralLink.currentSplit[e.index - 1]?.referPayout ?? 0,
      eventIndex: e.index,
    }))
  );
  const [toasts, setToasts] = useState([]);
  const [saving, setSaving] = useState(false);

  function pushToast(message, type) {
    setToasts((t) => [...t, { id: Date.now() + Math.random(), message, type }]);
  }

  function updateValue(rowIdx, field, rawValue) {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[rowIdx] };
      const total = row.totalPayout;
      let value = Math.max(0, Number(rawValue) || 0);
      value = Math.min(value, total);

      let user = field === "userPayout" ? value : row.userPayout;
      let refer = field === "referPayout" ? value : row.referPayout;

      if (user + refer > total) {
        if (field === "userPayout") user = total - refer;
        else refer = total - user;
        pushToast(`Total payout cannot exceed ₹${total}`, "warning");
      }

      row.userPayout = user;
      row.referPayout = refer;
      next[rowIdx] = row;
      return next;
    });
  }

  async function handleSave() {
    const hasChanges = rows.some((r, i) => {
      const orig = offer.events[i];
      return r.userPayout !== (referralLink.currentSplit[orig.index - 1]?.userPayout ?? 0) || r.referPayout !== (referralLink.currentSplit[orig.index - 1]?.referPayout ?? 0);
    });
    if (!hasChanges) {
      pushToast("No changes were made to save", "error");
      return;
    }

    const payload = {};
    for (let n = 1; n <= 5; n++) {
      const row = rows.find((r) => r.eventIndex === n);
      payload[`eve_${n}_user_po`] = row ? row.userPayout : referralLink.currentSplit[n - 1]?.userPayout ?? 0;
      payload[`eve_${n}_refer_po`] = row ? row.referPayout : referralLink.currentSplit[n - 1]?.referPayout ?? 0;
    }

    setSaving(true);
    try {
      await api.put(`/api/offers/${offer.offId}/payout-split`, payload);
      pushToast("Payouts updated successfully!", "success");
      setTimeout(onSaved, 900);
    } catch (err) {
      pushToast(err.message || "Failed to save changes.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="modal" style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(20,22,43,0.55)", zIndex: 999999, overflowY: "auto", padding: "20px" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-content" style={{ position: "relative", background: "var(--lg-paper-raised)", width: "100%", maxWidth: 600, borderRadius: "var(--lg-radius-lg)", boxShadow: "var(--lg-shadow-lg)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "var(--lg-font-body)", maxHeight: "90vh" }}>
          <div className="modal-header" style={{ padding: "15px 20px", borderBottom: "1px solid var(--lg-line)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--lg-paper-sunken)" }}>
            <h2 style={{ margin: 0, fontSize: 16, color: "var(--lg-ink)", fontWeight: 600 }}>Customize Payout</h2>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: "var(--lg-ink-soft)", cursor: "pointer" }}>×</button>
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 15, padding: "12px 20px", background: "var(--lg-paper-sunken)", borderBottom: "2px dashed var(--lg-line)", position: "sticky", top: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--lg-ink-soft)", fontSize: 13 }}>Event</div>
              <div style={{ fontWeight: 600, color: "var(--lg-ink-soft)", fontSize: 13 }}>User</div>
              <div style={{ fontWeight: 600, color: "var(--lg-ink-soft)", fontSize: 13 }}>Refer</div>
              <div style={{ fontWeight: 600, color: "var(--lg-ink-soft)", fontSize: 13 }}>Profit</div>
            </div>
            {rows.length === 0 ? (
              <div style={{ padding: 16, textAlign: "center", fontSize: 14, color: "var(--lg-ink-soft)" }}>No events configured for this campaign.</div>
            ) : (
              rows.map((row, i) => {
                const profit = row.totalPayout - row.userPayout - row.referPayout;
                return (
                  <div key={row.eventIndex} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 15, alignItems: "center", padding: "10px 20px", borderBottom: "1px solid var(--lg-line-soft)" }}>
                    <div style={{ fontWeight: 500, color: "var(--lg-ink-soft)", fontSize: 13 }}>{row.name}</div>
                    <div style={{ width: "100%" }}>
                      <input type="number" value={row.userPayout} min={0} max={row.totalPayout} onChange={(e) => updateValue(i, "userPayout", e.target.value)} style={{ fontSize: 13, width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--lg-line)", background: "var(--lg-paper)", color: "var(--lg-ink)", outline: "none", transition: "border-color 0.2s" }} onFocus={(e) => e.target.style.borderColor = "var(--lg-violet)"} onBlur={(e) => e.target.style.borderColor = "var(--lg-line)"} />
                    </div>
                    <div style={{ width: "100%" }}>
                      <input type="number" value={row.referPayout} min={0} max={row.totalPayout} onChange={(e) => updateValue(i, "referPayout", e.target.value)} style={{ fontSize: 13, width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--lg-line)", background: "var(--lg-paper)", color: "var(--lg-ink)", outline: "none", transition: "border-color 0.2s" }} onFocus={(e) => e.target.style.borderColor = "var(--lg-violet)"} onBlur={(e) => e.target.style.borderColor = "var(--lg-line)"} />
                    </div>
                    <div style={{ fontWeight: 600, textAlign: "right", fontSize: 13, color: profit >= 0 ? "var(--lg-success)" : "var(--lg-error)" }}>₹{profit}</div>
                  </div>
                );
              })
            )}
          </div>
          <div style={{ padding: "12px 20px", background: "var(--lg-paper-sunken)", borderTop: "1px solid var(--lg-line)", textAlign: "right" }}>
            <button onClick={handleSave} disabled={saving} style={{ background: "linear-gradient(135deg,var(--lg-violet),var(--lg-violet-deep))", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "var(--lg-radius-pill)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
      <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 100001, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, pointerEvents: "none" }}>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDone={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </>
  );
}

function OfferDetailContent() {
  const searchParams = useSearchParams();
  const offId = searchParams.get("o");
  const [data, setData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [themeSaving, setThemeSaving] = useState(false);

  async function handleThemeChange(theme) {
    setThemeSaving(true);
    try {
      await api.put(`/api/offers/${offId}/landing-theme`, { theme });
      setData((d) => ({ ...d, referralLink: { ...d.referralLink, landingTheme: theme } }));
    } finally {
      setThemeSaving(false);
    }
  }

  useEffect(() => {
    if (!offId) {
      window.location.href = "/live-offers";
      return;
    }
    api
      .get(`/api/offers/${offId}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [offId]);

  if (error) {
    return <main className="flex-1 px-8 py-7 max-w-7xl mx-auto w-full text-sm text-red-500">{error}</main>;
  }
  if (!data) {
    return <Loader />;
  }

  const { offer, referralLink, availableThemes = [] } = data;
  const initials = initialsOf(offer.offerName);
  const benefits = splitLines(offer.offerBenefits);
  const fees = parseFees(splitLines(offer.offerFeesCharges));
  const steps = splitLines(offer.steps);
  const terms = parseTerms(splitLines(offer.terms));

  return (
    <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full space-y-8" style={{ position: "relative", zIndex: 1 }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-2">
        <a href="/live-offers" className="flex items-center gap-2 text-[14px] font-semibold transition-colors cursor-pointer px-3 py-1.5 rounded-full" style={{ color: "var(--lg-violet)", background: "var(--lg-violet-soft)" }}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back to Campaigns
        </a>
        <span className="text-[14px]" style={{ color: "var(--lg-line)" }}>/</span>
        <span className="text-[14px] font-medium" style={{ color: "var(--lg-ink-soft)" }}>{offer.offerName}</span>
      </div>

      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-[1px] group">
        <div className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity duration-500" style={{ background: "linear-gradient(to bottom right, var(--lg-violet-soft), var(--lg-pink-soft))" }}></div>
        <div className="relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 rounded-2xl shadow-sm overflow-hidden" style={{ background: "var(--lg-paper-raised)", border: "1px solid var(--lg-line)" }}>
          
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 z-10 w-full md:w-auto">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 items-center justify-center rounded-2xl text-[28px] font-extrabold overflow-hidden relative group-hover:scale-105 transition-transform duration-500" style={{ background: "var(--lg-paper-sunken)", color: "var(--lg-ink)", border: "1px solid var(--lg-line)", boxShadow: "var(--lg-shadow-sm)" }}>
              {offer.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={offer.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-1.5 tracking-tight" style={{ color: "var(--lg-ink)" }}>{offer.offerName}</h1>
              <p className="text-sm font-medium mb-3" style={{ color: "var(--lg-ink-soft)" }}>Join this offer to start earning</p>
              <span className="inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md" style={{ background: "var(--lg-paper-sunken)", color: "var(--lg-ink)", border: "1px solid var(--lg-line)" }}>
                {offer.category}
              </span>
            </div>
          </div>
          
          <div className="z-10 mt-6 md:mt-0 w-full md:w-auto flex justify-center md:justify-end">
            <div className="flex flex-col items-center md:items-end rounded-2xl p-4 md:p-0 border md:border-transparent w-full md:w-auto" style={{ borderColor: "var(--lg-line)", background: "var(--lg-paper-sunken)" }}>
              <span className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--lg-violet)" }}>Total Payout</span>
              <div className="relative">
                <span className="text-3xl sm:text-4xl font-black tracking-tighter" style={{ color: "var(--lg-ink)" }}>
                  ₹{offer.totalPayout.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Links & Tools Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tracking Links Card */}
        <div className="lg:col-span-2 rounded-2xl p-[1px] relative">
          <div className="relative rounded-2xl p-6 shadow-sm h-full flex flex-col" style={{ background: "var(--lg-paper-raised)", border: "1px solid var(--lg-line)" }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ background: "var(--lg-violet-soft)", color: "var(--lg-violet)", borderColor: "var(--lg-violet-soft)" }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
                <h2 className="text-lg font-bold" style={{ color: "var(--lg-ink)" }}>Your Tracking Links</h2>
              </div>
              <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))", color: "#fff", border: "none", boxShadow: "0 4px 12px -4px color-mix(in srgb, var(--lg-violet) 45%, transparent)" }}>
                <svg className="w-4 h-4 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
                Customize Payout
              </button>
            </div>

            <div className="space-y-6 flex-1">
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2.5 ml-1" style={{ color: "var(--lg-ink-soft)" }}>Your Offer URL</label>
                <div className="flex items-center gap-3 rounded-2xl p-2 transition-colors shadow-inner border" style={{ background: "var(--lg-paper-sunken)", borderColor: "var(--lg-line)" }}>
                  <div className="flex-1 overflow-hidden pl-3">
                    <p className="truncate text-sm font-mono select-all" style={{ color: "var(--lg-ink)" }}>{referralLink.offerLink}</p>
                  </div>
                  <CopyButton value={referralLink.offerLink} />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2.5 ml-1" style={{ color: "var(--lg-ink-soft)" }}>Sub Refer URL</label>
                <div className="flex items-center gap-3 rounded-2xl p-2 transition-colors shadow-inner border" style={{ background: "var(--lg-paper-sunken)", borderColor: "var(--lg-line)" }}>
                  <div className="flex-1 overflow-hidden pl-3">
                    <p className="truncate text-sm font-mono select-all" style={{ color: "var(--lg-ink)" }}>{referralLink.referLink}</p>
                  </div>
                  <CopyButton value={referralLink.referLink} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Landing Page Theme Card */}
        {availableThemes.length > 0 && (
          <div className="rounded-2xl p-[1px] relative">
            <div className="relative rounded-2xl p-6 shadow-sm h-full" style={{ background: "var(--lg-paper-raised)", border: "1px solid var(--lg-line)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ background: "var(--lg-pink-soft)", color: "var(--lg-pink)", borderColor: "var(--lg-pink-soft)" }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h2 className="text-lg font-bold" style={{ color: "var(--lg-ink)" }}>Landing Page</h2>
              </div>
              
              <div className="flex flex-col gap-3">
                {availableThemes.map((t) => {
                  const isActive = referralLink.landingTheme === t.key;
                  return (
                    <div key={t.key} className="flex items-center justify-between p-3 rounded-2xl border transition-all" style={{
                      borderColor: isActive ? "var(--lg-pink)" : "var(--lg-line)",
                      background: isActive ? "var(--lg-pink-soft)" : "var(--lg-paper-sunken)"
                    }}>
                      <button
                        disabled={themeSaving}
                        onClick={() => handleThemeChange(t.key)}
                        className="flex-1 text-left flex items-center gap-3"
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors`} style={{ borderColor: isActive ? "var(--lg-pink)" : "var(--lg-ink-soft)" }}>
                          {isActive && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--lg-pink)" }} />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold`} style={{ color: isActive ? "var(--lg-pink)" : "var(--lg-ink-soft)" }}>{t.label}</p>
                        </div>
                      </button>
                      <a
                        href={`${referralLink.offerLink}&preview_theme=${t.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                        style={{ background: "var(--lg-paper)", color: "var(--lg-ink-soft)" }}
                        title="Preview theme"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Grid (2x2 instead of 1x4) */}
      <div className="grid md:grid-cols-2 gap-6 pb-12">
        {/* Benefits */}
        <div className="rounded-2xl border shadow-sm p-6 transition-colors duration-300" style={{ background: "var(--lg-paper-raised)", borderColor: "var(--lg-line)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: "var(--lg-violet-soft)", color: "var(--lg-violet)", borderColor: "var(--lg-violet-soft)" }}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 12 20 22 4 22 4 12" /><rect width="20" height="5" x="2" y="7" /><line x1="12" y1="22" x2="12" y2="7" /></svg>
            </div>
            <h3 className="text-base font-bold" style={{ color: "var(--lg-ink)" }}>Benefits</h3>
          </div>
          <ul className="space-y-4">
            {benefits.length > 0 ? benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "var(--lg-ink-soft)" }}>
                <div className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--lg-violet)" }} />
                {b}
              </li>
            )) : <li className="text-sm italic" style={{ color: "var(--lg-ink-faint)" }}>No benefits listed.</li>}
          </ul>
        </div>

        {/* Fees & Charges */}
        <div className="rounded-2xl border shadow-sm p-6 transition-colors duration-300" style={{ background: "var(--lg-paper-raised)", borderColor: "var(--lg-line)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: "var(--lg-blue-soft)", color: "var(--lg-blue)", borderColor: "var(--lg-blue-soft)" }}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" /></svg>
            </div>
            <h3 className="text-base font-bold" style={{ color: "var(--lg-ink)" }}>Fees &amp; Charges</h3>
          </div>
          <div className="space-y-3">
            {fees.length > 0 ? fees.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border" style={{ background: "var(--lg-paper-sunken)", borderColor: "var(--lg-line)" }}>
                <div className="text-sm" style={{ color: "var(--lg-ink-soft)" }}>{f.label}</div>
                <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ color: "var(--lg-blue)", background: "var(--lg-blue-soft)" }}>{f.value}</span>
              </div>
            )) : <div className="text-sm italic" style={{ color: "var(--lg-ink-faint)" }}>No fee info.</div>}
          </div>
        </div>

        {/* How to Apply */}
        <div className="rounded-2xl border shadow-sm p-6 transition-colors duration-300" style={{ background: "var(--lg-paper-raised)", borderColor: "var(--lg-line)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: "var(--lg-orange-soft)", color: "var(--lg-orange)", borderColor: "var(--lg-orange-soft)" }}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 className="text-base font-bold" style={{ color: "var(--lg-ink)" }}>How to Apply</h3>
          </div>
          <ol className="space-y-4">
            {steps.length > 0 ? steps.map((s, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: "linear-gradient(135deg, var(--lg-orange), var(--lg-yellow))", boxShadow: "0 2px 6px -2px color-mix(in srgb, var(--lg-orange) 45%, transparent)" }}>
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed pt-0.5" style={{ color: "var(--lg-ink-soft)" }}>{s}</span>
              </li>
            )) : <li className="text-sm italic" style={{ color: "var(--lg-ink-faint)" }}>No steps provided.</li>}
          </ol>
        </div>

        {/* Terms & Conditions */}
        <div className="rounded-2xl border shadow-sm p-6 transition-colors duration-300" style={{ background: "var(--lg-paper-raised)", borderColor: "var(--lg-line)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: "var(--lg-success-soft)", color: "var(--lg-success)", borderColor: "var(--lg-success-soft)" }}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <h3 className="text-base font-bold" style={{ color: "var(--lg-ink)" }}>Terms &amp; Conditions</h3>
          </div>
          <div className="space-y-3">
            {terms.length > 0 ? terms.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border" style={{ background: "var(--lg-success-soft)", borderColor: "var(--lg-line)" }}>
                <div className="flex items-center gap-2.5" style={{ color: "var(--lg-success)" }}>
                  <TermIcon icon={t.icon} />
                  <span className="text-sm font-semibold">{t.label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--lg-success)" }}>{t.value}</span>
              </div>
            )) : <div className="text-sm italic" style={{ color: "var(--lg-ink-faint)" }}>No terms given.</div>}
          </div>
        </div>
      </div>

      {modalOpen && (
        <PayoutModal
          offer={offer}
          referralLink={referralLink}
          onClose={() => setModalOpen(false)}
          onSaved={() => window.location.reload()}
        />
      )}
    </main>
  );
}

export default function OfferDetailPage() {
  return (
    <Suspense fallback={<Loader />}>
      <OfferDetailContent />
    </Suspense>
  );
}
