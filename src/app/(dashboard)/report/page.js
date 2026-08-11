"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";

const DATE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last_7_days", label: "Last 7 days" },
  { key: "last_30_days", label: "Last 30 days" },
  { key: "this_month", label: "This month" },
  { key: "custom", label: "Custom range" },
];

const CAMPAIGN_COLORS = ["var(--lg-violet)", "var(--lg-pink)", "var(--lg-orange)", "var(--lg-yellow)", "var(--lg-success)", "var(--lg-violet-deep)", "var(--lg-blue)", "var(--lg-cyan)", "var(--lg-error)"];

function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return CAMPAIGN_COLORS[Math.abs(hash) % CAMPAIGN_COLORS.length];
}

function initialsOf(name) {
  const words = (name || "").trim().split(" ");
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (name || "").trim().slice(0, 2).toUpperCase();
}

function TrendBadge({ current, previous }) {
  if (previous > 0) {
    const change = Math.round(((current - previous) / previous) * 100);
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold" style={{ background: "var(--lg-success-soft)", color: "var(--lg-success)" }}>
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" /></svg>
          +{change}%
        </div>
      );
    }
    if (change < 0) {
      return (
        <div className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold" style={{ background: "var(--lg-error-soft)", color: "var(--lg-error)" }}>
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 17h6v-6" /><path d="m22 17-8.5-8.5-5 5L2 7" /></svg>
          {change}%
        </div>
      );
    }
  } else if (current > 0 && previous === 0) {
    return <div className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold" style={{ background: "var(--lg-success-soft)", color: "var(--lg-success)" }}>New</div>;
  }
  return (
    <div className="flex items-center justify-center h-5 w-8 rounded-full" style={{ background: "var(--lg-success-soft)", color: "var(--lg-success)" }}>
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
    </div>
  );
}

function AnimatedNumber({ target }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!target) {
      setDisplay(0);
      return;
    }
    const dur = 1100;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{display.toLocaleString("en-IN")}</>;
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function resolveClientDates(option) {
  const today = new Date();
  let start = new Date();
  let end = new Date();
  switch (option) {
    case "yesterday":
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
      break;
    case "last_7_days":
      start.setDate(today.getDate() - 6);
      break;
    case "last_30_days":
      start.setDate(today.getDate() - 29);
      break;
    case "this_month":
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    default:
      break;
  }
  return { startDate: formatDate(start), endDate: formatDate(end) };
}

export default function ReportsPage() {
  const [dateOption, setDateOption] = useState("today");
  const [customStart, setCustomStart] = useState(formatDate(new Date()));
  const [customEnd, setCustomEnd] = useState(formatDate(new Date()));
  const [appliedLabel, setAppliedLabel] = useState("Today");
  const [ddOpen, setDdOpen] = useState(false);
  const [data, setData] = useState(null);
  const ddRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  function fetchReport(option, startDate, endDate) {
    const params = new URLSearchParams({ dateOption: option });
    if (option === "custom") {
      params.set("startDate", startDate);
      params.set("endDate", endDate);
    }
    api.get(`/api/reports?${params.toString()}`).then(setData).catch(() => setData(null));
  }

  useEffect(() => {
    fetchReport("today");
  }, []);

  function handleApply() {
    let startDate, endDate;
    if (dateOption === "custom") {
      if (!customStart || !customEnd) return alert("Please select start and end dates.");
      if (new Date(customStart) > new Date(customEnd)) return alert("Start date cannot be after end date.");
      startDate = customStart;
      endDate = customEnd;
    } else {
      const resolved = resolveClientDates(dateOption);
      startDate = resolved.startDate;
      endDate = resolved.endDate;
    }
    setAppliedLabel(DATE_OPTIONS.find((o) => o.key === dateOption)?.label || "Today");
    setDdOpen(false);
    fetchReport(dateOption, startDate, endDate);
  }

  if (!data) {
    return <Loader />;
  }

  const campaigns = data.campaigns.map((c, i) => ({
    ...c,
    color: hashColor(c.offId),
    initials: initialsOf(c.offerName),
    rank: i + 1,
    cvr: c.totalClicks > 0 ? Math.round((c.totalLeads / c.totalClicks) * 100) : 0,
  }));

  return (
    <main className="flex-1 px-8 py-6 max-w-7xl mx-auto w-full space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.35rem] font-extrabold" style={{ color: "var(--lg-ink)", letterSpacing: "-0.02em" }}>Reports</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--lg-ink-soft)" }}>Track performance across all your campaigns</p>
        </div>
        <button onClick={() => fetchReport(dateOption, customStart, customEnd)} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold transition hover:opacity-90" style={{ background: "linear-gradient(135deg,var(--lg-violet),var(--lg-violet-deep))", color: "#fff", boxShadow: "0 4px 14px -4px color-mix(in srgb, var(--lg-violet) 45%, transparent)" }}>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="lh-card flex items-center px-5 py-4 lh-card-1 gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,var(--lg-violet),var(--lg-pink))" }}>
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" /></svg>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--lg-ink-soft)" }}>Total Clicks</p>
            <p className="text-[1.6rem] font-extrabold leading-none" style={{ color: "var(--lg-ink)", letterSpacing: "-0.03em" }}><AnimatedNumber target={data.current.totalClicks} /></p>
          </div>
          <TrendBadge current={data.current.totalClicks} previous={data.previous.totalClicks} />
        </div>

        <div className="lh-card flex items-center px-5 py-4 lh-card-2 gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,var(--lg-orange),var(--lg-yellow))" }}>
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></svg>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--lg-ink-soft)" }}>Total Conversions</p>
            <p className="text-[1.6rem] font-extrabold leading-none" style={{ color: "var(--lg-ink)", letterSpacing: "-0.03em" }}><AnimatedNumber target={data.current.totalConversions} /></p>
          </div>
          <TrendBadge current={data.current.totalConversions} previous={data.previous.totalConversions} />
        </div>

        <div className="lh-card flex items-center px-5 py-4 lh-card-3 gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,var(--lg-cyan),var(--lg-blue))" }}>
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" /></svg>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--lg-ink-soft)" }}>Total Earnings</p>
            <p className="text-[1.6rem] font-extrabold leading-none" style={{ color: "var(--lg-ink)", letterSpacing: "-0.03em" }}>₹<AnimatedNumber target={data.current.totalEarnings} /></p>
          </div>
          <TrendBadge current={data.current.totalEarnings} previous={data.previous.totalEarnings} />
        </div>
      </div>

      <div className="lh-card overflow-visible px-5 py-4 relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-1.5 mr-1 self-start sm:self-center" style={{ color: "var(--lg-violet)" }}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
            <span className="text-[13px] font-semibold whitespace-nowrap">Filter by period</span>
          </div>

          <div className="relative w-full sm:flex-1 max-w-xs" ref={ddRef}>
            <button onClick={() => setDdOpen((v) => !v)} className="lh-rp-period-btn flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-[13px] font-medium">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" style={{ color: "var(--lg-violet)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                <span style={{ color: "var(--lg-ink)" }}>{DATE_OPTIONS.find((o) => o.key === dateOption)?.label}</span>
              </div>
              <svg className="h-4 w-4 transition-transform duration-200" style={{ color: "var(--lg-ink-soft)", transform: ddOpen ? "rotate(180deg)" : "none" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
            </button>

            {ddOpen && (
              <div className="lh-rp-dropdown absolute left-0 right-0 top-full mt-1 w-full rounded-xl py-1 z-50">
                {DATE_OPTIONS.map((opt) => (
                  <button key={opt.key} onClick={() => setDateOption(opt.key)} className="lh-rp-dropdown-item flex w-full items-center px-4 py-2 text-[13px]" style={{ color: "var(--lg-ink-soft)" }}>
                    {opt.label}
                  </button>
                ))}
                {dateOption === "custom" && (
                  <div className="px-3 pt-2 pb-2 mt-1" style={{ borderTop: "1px solid var(--lg-line-soft)" }}>
                    <label className="block text-[11px] mb-1" style={{ color: "var(--lg-ink-faint)" }}>Start Date</label>
                    <div className="lh-input-wrap lh-icon-calendar mb-2">
                      <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="text-[12px]" />
                    </div>
                    <label className="block text-[11px] mb-1" style={{ color: "var(--lg-ink-faint)" }}>End Date</label>
                    <div className="lh-input-wrap lh-icon-calendar">
                      <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="text-[12px]" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={handleApply} className="lh-rp-apply-btn flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-[13px] font-semibold text-white w-full sm:w-auto">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
            Apply
          </button>

          <span className="ml-auto text-[12px] whitespace-nowrap mt-2 sm:mt-0" style={{ color: "var(--lg-ink-soft)" }}>
            Showing data for: <span className="font-semibold" style={{ color: "var(--lg-violet)" }}>{appliedLabel}</span>
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-4 w-4" style={{ color: "var(--lg-violet)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
          <p className="text-[13px] font-bold" style={{ color: "var(--lg-ink)" }}>Campaign Performance</p>
          <span className="ml-auto text-[12px]" style={{ color: "var(--lg-ink-soft)" }}>{campaigns.length} campaigns</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.length === 0 ? (
            <div className="lh-card col-span-full py-12 text-center">
              <p className="text-sm font-medium" style={{ color: "var(--lg-ink-faint)" }}>No data found for the selected period.</p>
            </div>
          ) : (
            campaigns.map((c) => (
              <div key={c.offId} className="lh-rp-campaign-card">
                <span className="lh-rp-rank absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold" style={{ background: "var(--lg-violet-soft)", color: "var(--lg-violet)" }}>{c.rank}</span>
                <div className="flex items-center gap-3 mb-4 pr-6">
                  {c.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo} alt={c.offerName} className="h-10 w-10 flex-shrink-0 rounded-xl object-cover" style={{ boxShadow: "var(--lg-shadow-sm)" }} />
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[13px] font-extrabold text-white" style={{ background: c.color, boxShadow: "var(--lg-shadow-sm)" }}>{c.initials}</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-tight truncate" style={{ color: "var(--lg-ink)" }}>{c.offerName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {c.totalLeads > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--lg-success)" }}>
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" /></svg>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--lg-ink-soft)" }}>
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 17h6v-6" /><path d="m22 17-8.5-8.5-5 5L2 7" /></svg>
                          No leads
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-around mb-4 rounded-xl py-3" style={{ background: "var(--lg-paper-sunken)" }}>
                  <div className="text-center">
                    <p className="text-[1.3rem] font-extrabold" style={{ color: "var(--lg-violet)", letterSpacing: "-0.02em" }}>{c.totalClicks.toLocaleString("en-IN")}</p>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--lg-ink-soft)" }}>Clicks</p>
                  </div>
                  <div className="h-8 w-px" style={{ background: "var(--lg-line)" }} />
                  <div className="text-center">
                    <p className="text-[1.3rem] font-extrabold" style={{ color: "var(--lg-orange)", letterSpacing: "-0.02em" }}>{c.totalLeads.toLocaleString("en-IN")}</p>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--lg-ink-soft)" }}>Leads</p>
                  </div>
                  <div className="h-8 w-px" style={{ background: "var(--lg-line)" }} />
                  <div className="text-center">
                    <p className="text-[1.3rem] font-extrabold" style={{ color: "var(--lg-success)", letterSpacing: "-0.02em" }}>{c.cvr}%</p>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--lg-ink-soft)" }}>CVR</p>
                  </div>
                </div>
                <div className="mb-4 px-0.5">
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="font-medium" style={{ color: "var(--lg-ink-soft)" }}>Conversion Rate</span>
                    <span className="font-bold" style={{ color: c.totalLeads > 0 ? "var(--lg-success)" : "var(--lg-ink-soft)" }}>{c.cvr}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--lg-paper-sunken)" }}>
                    <div className="h-full rounded-full" style={{ width: `${c.cvr}%`, background: c.totalLeads > 0 ? "linear-gradient(90deg,var(--lg-violet),var(--lg-pink))" : "var(--lg-line)", transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)" }} />
                  </div>
                </div>
                <a href={`/detailed-report?o=${c.offId}&start_date=${data.period.startDate}&end_date=${data.period.endDate}`} className="lh-rp-view-btn flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-semibold text-white cursor-pointer no-underline">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                  View Details
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
