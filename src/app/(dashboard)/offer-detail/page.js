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
      <div className="modal" style={{ display: "block", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(20,22,43,0.55)", zIndex: 100000, overflowY: "auto" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-content" style={{ position: "relative", background: "var(--lg-paper-raised)", width: "90%", maxWidth: 600, margin: "40px auto", borderRadius: "var(--lg-radius-lg)", boxShadow: "var(--lg-shadow-lg)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "var(--lg-font-body)" }}>
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
                    <div className="lh-input-wrap no-icon">
                      <input type="number" value={row.userPayout} min={0} max={row.totalPayout} onChange={(e) => updateValue(i, "userPayout", e.target.value)} style={{ fontSize: 13 }} />
                    </div>
                    <div className="lh-input-wrap no-icon">
                      <input type="number" value={row.referPayout} min={0} max={row.totalPayout} onChange={(e) => updateValue(i, "referPayout", e.target.value)} style={{ fontSize: 13 }} />
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
    <main className="flex-1 px-8 py-6 max-w-7xl mx-auto w-full space-y-5" style={{ position: "relative", zIndex: 1 }}>
      <div className="flex items-center gap-2">
        <a href="/live-offers" className="flex items-center gap-1.5 text-[13px] font-medium lh-cd-back cursor-pointer">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
          Back to Campaigns
        </a>
        <span className="text-[13px]" style={{ color: "var(--lg-line)" }}>/</span>
        <span className="text-[13px]" style={{ color: "var(--lg-ink-soft)" }}>{offer.offerName}</span>
      </div>

      <div className="lh-cd-hero overflow-hidden">
        <div className="lh-cd-hero-bg" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between px-6 sm:px-8 py-6 gap-5 md:gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-2xl text-[20px] sm:text-[22px] font-extrabold text-white overflow-hidden" style={{ background: "rgba(255,255,255,0.18)", boxShadow: "0 6px 22px -6px rgba(0,0,0,0.35)" }}>
              {offer.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={offer.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h1 className="text-[1.25rem] sm:text-[1.5rem] font-extrabold text-white mb-1" style={{ letterSpacing: "-0.02em" }}>{offer.offerName}</h1>
              <p className="text-[13px] text-white/70">Join this offer to start earning</p>
              <span className="mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.30)" }}>{offer.category}</span>
            </div>
          </div>
          <div className="w-full md:w-auto mt-2 md:mt-0">
            <div className="flex flex-row md:flex-col items-center justify-between md:justify-center bg-white/10 md:bg-transparent border border-white/20 md:border-transparent rounded-xl px-5 py-3 md:p-0">
              <div className="flex items-center gap-1.5 text-white/90 md:text-white/60 md:mb-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Total Payout</span>
              </div>
              <p className="text-[1.25rem] sm:text-[1.35rem] font-extrabold text-white" style={{ letterSpacing: "-0.02em" }}>₹{offer.totalPayout.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lh-cd-url-card">
        <div className="px-5 pt-5 pb-4">
          <h2 className="text-[15px] font-bold mb-3.5" style={{ color: "var(--lg-ink)" }}>Your Tracking Links</h2>
          <button onClick={() => setModalOpen(true)} className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold text-white transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg,var(--lg-violet),var(--lg-violet-deep))", boxShadow: "0 4px 12px -4px color-mix(in srgb, var(--lg-violet) 45%, transparent)" }}>
            <span className="font-normal opacity-90">₹</span> Customize Payout
          </button>
        </div>
        <div className="w-full h-px" style={{ background: "var(--lg-line-soft)" }} />
        <div className="flex flex-col gap-4 px-5 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--lg-ink-soft)" }}>Your Offer URL</p>
            <div className="flex items-center gap-2 rounded-[14px] px-1.5 py-1.5" style={{ background: "var(--lg-violet-soft)", border: "1px solid var(--lg-line)" }}>
              <span className="flex-1 truncate text-[13px] font-mono pl-3" style={{ color: "var(--lg-ink-soft)" }}>{referralLink.offerLink}</span>
              <CopyButton value={referralLink.offerLink} />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--lg-ink-soft)" }}>Sub Refer URL</p>
            <div className="flex items-center gap-2 rounded-[14px] px-1.5 py-1.5" style={{ background: "var(--lg-violet-soft)", border: "1px solid var(--lg-line)" }}>
              <span className="flex-1 truncate text-[13px] font-mono pl-3" style={{ color: "var(--lg-ink-soft)" }}>{referralLink.referLink}</span>
              <CopyButton value={referralLink.referLink} />
            </div>
          </div>

          {availableThemes.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--lg-ink-soft)" }}>Landing Page Theme</p>
              <div className="flex gap-2 flex-wrap">
                {availableThemes.map((t) => (
                  <button
                    key={t.key}
                    disabled={themeSaving}
                    onClick={() => handleThemeChange(t.key)}
                    title={t.description}
                    className="text-[12px] font-semibold px-3 py-2 rounded-xl"
                    style={
                      referralLink.landingTheme === t.key
                        ? { background: "linear-gradient(135deg,var(--lg-violet),var(--lg-violet-deep))", color: "#fff" }
                        : { background: "var(--lg-paper-sunken)", color: "var(--lg-ink-soft)" }
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lh-cd-info-card lh-cd-info-purple">
          <div className="flex items-center gap-2 mb-4">
            <div className="lh-cd-info-icon lh-cd-icon-purple flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12" /><rect width="20" height="5" x="2" y="7" /><line x1="12" y1="22" x2="12" y2="7" /></svg>
            </div>
            <span className="text-[13px] font-bold" style={{ color: "var(--lg-ink)" }}>Benefits</span>
          </div>
          <ul className="space-y-2">
            {benefits.length > 0 ? benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: "var(--lg-ink-soft)" }}>
                <svg className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: "var(--lg-violet)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                {b}
              </li>
            )) : <li className="text-[12px]" style={{ color: "var(--lg-ink-faint)" }}>No benefits listed.</li>}
          </ul>
        </div>

        <div className="lh-cd-info-card lh-cd-info-blue">
          <div className="flex items-center gap-2 mb-4">
            <div className="lh-cd-info-icon lh-cd-icon-blue flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" /></svg>
            </div>
            <span className="text-[13px] font-bold" style={{ color: "var(--lg-ink)" }}>Fees &amp; Charges</span>
          </div>
          <div className="space-y-3">
            {fees.length > 0 ? fees.map((f, i) => (
              <div key={i} className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 text-[12px]" style={{ color: "var(--lg-ink-soft)" }}>
                  <svg className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: "var(--lg-blue)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  {f.label}
                </div>
                <span className="text-[12px] font-bold flex-shrink-0" style={{ color: "var(--lg-blue)" }}>{f.value}</span>
              </div>
            )) : <div className="text-[12px]" style={{ color: "var(--lg-ink-faint)" }}>No fee info.</div>}
          </div>
        </div>

        <div className="lh-cd-info-card lh-cd-info-indigo">
          <div className="flex items-center gap-2 mb-4">
            <div className="lh-cd-info-icon lh-cd-icon-indigo flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <span className="text-[13px] font-bold" style={{ color: "var(--lg-ink)" }}>How to Apply</span>
          </div>
          <ol className="space-y-2.5">
            {steps.length > 0 ? steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white" style={{ background: "linear-gradient(135deg,var(--lg-orange),var(--lg-yellow))", boxShadow: "0 2px 6px -2px color-mix(in srgb, var(--lg-orange) 45%, transparent)" }}>{i + 1}</span>
                <span className="text-[12px]" style={{ color: "var(--lg-ink-soft)" }}>{s}</span>
              </li>
            )) : <li className="text-[12px]" style={{ color: "var(--lg-ink-faint)" }}>No steps provided.</li>}
          </ol>
        </div>

        <div className="lh-cd-info-card lh-cd-info-emerald">
          <div className="flex items-center gap-2 mb-4">
            <div className="lh-cd-info-icon lh-cd-icon-emerald flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <span className="text-[13px] font-bold" style={{ color: "var(--lg-ink)" }}>Terms &amp; Conditions</span>
          </div>
          <div className="space-y-2.5">
            {terms.length > 0 ? terms.map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: "var(--lg-success-soft)", border: "1px solid transparent" }}>
                <div className="flex items-center gap-2" style={{ color: "var(--lg-success)" }}>
                  <TermIcon icon={t.icon} />
                  <span className="text-[12px] font-medium">{t.label}</span>
                </div>
                <span className="text-[12px] font-bold text-right" style={{ color: "var(--lg-success)" }}>{t.value}</span>
              </div>
            )) : <div className="text-[12px]" style={{ color: "var(--lg-ink-faint)" }}>No terms given.</div>}
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
