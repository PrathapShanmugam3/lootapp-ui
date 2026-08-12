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

const CAMPAIGN_COLORS = [
  "linear-gradient(135deg, #6366f1, #a78bfa)",
  "linear-gradient(135deg, #ec4899, #f472b6)",
  "linear-gradient(135deg, #f59e0b, #fbbf24)",
  "linear-gradient(135deg, #10b981, #34d399)",
  "linear-gradient(135deg, #06b6d4, #38bdf8)",
];

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
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: "var(--lg-radius-pill)", background: "var(--lg-success-soft)", color: "var(--lg-success)", fontSize: 12, fontWeight: 800 }}>
          ↑ +{change}%
        </span>
      );
    }
    if (change < 0) {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: "var(--lg-radius-pill)", background: "var(--lg-error-soft)", color: "var(--lg-error)", fontSize: 12, fontWeight: 800 }}>
          ↓ {change}%
        </span>
      );
    }
  } else if (current > 0 && previous === 0) {
    return <span style={{ display: "inline-flex", padding: "4px 10px", borderRadius: "var(--lg-radius-pill)", background: "var(--lg-success-soft)", color: "var(--lg-success)", fontSize: 12, fontWeight: 800 }}>New</span>;
  }
  return <span style={{ display: "inline-flex", padding: "4px 10px", borderRadius: "var(--lg-radius-pill)", background: "var(--lg-paper-sunken)", color: "var(--lg-ink-soft)", fontSize: 12, fontWeight: 700 }}>—</span>;
}

function AnimatedNumber({ target }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!target) {
      setDisplay(0);
      return;
    }
    const dur = 900;
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

  if (!data) return <Loader style={{ padding: 40, color: "var(--lg-violet)" }} />;

  const campaigns = data.campaigns.map((c, i) => ({
    ...c,
    color: hashColor(c.offId),
    initials: initialsOf(c.offerName),
    rank: i + 1,
    cvr: c.totalClicks > 0 ? Math.round((c.totalLeads / c.totalClicks) * 100) : 0,
  }));

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)", letterSpacing: "-0.02em" }}>Performance Reports</h1>
          <p style={{ color: "var(--lg-ink-soft)", fontSize: 14, marginTop: 4 }}>Real-time conversion metrics and campaign earnings analytics</p>
        </div>
        <button
          onClick={() => fetchReport(dateOption, customStart, customEnd)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: "var(--lg-radius-pill)",
            border: "none",
            background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))",
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)"
          }}
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 28 }}>
        <div style={{ background: "var(--lg-paper-raised)", borderRadius: "var(--lg-radius)", padding: 24, border: "1px solid var(--lg-line)", boxShadow: "var(--lg-shadow-md)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--lg-ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 6px 0" }}>Total Clicks</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: "var(--lg-ink)", margin: 0, fontFamily: "var(--lg-font-display)" }}>
              <AnimatedNumber target={data.current.totalClicks} />
            </p>
          </div>
          <TrendBadge current={data.current.totalClicks} previous={data.previous.totalClicks} />
        </div>

        <div style={{ background: "var(--lg-paper-raised)", borderRadius: "var(--lg-radius)", padding: 24, border: "1px solid var(--lg-line)", boxShadow: "var(--lg-shadow-md)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--lg-ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 6px 0" }}>Total Conversions</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: "var(--lg-ink)", margin: 0, fontFamily: "var(--lg-font-display)" }}>
              <AnimatedNumber target={data.current.totalConversions} />
            </p>
          </div>
          <TrendBadge current={data.current.totalConversions} previous={data.previous.totalConversions} />
        </div>

        <div style={{ background: "var(--lg-paper-raised)", borderRadius: "var(--lg-radius)", padding: 24, border: "1px solid var(--lg-line)", boxShadow: "var(--lg-shadow-md)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--lg-ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 6px 0" }}>Total Revenue</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: "var(--lg-ink)", margin: 0, fontFamily: "var(--lg-font-display)" }}>
              ₹<AnimatedNumber target={data.current.totalEarnings} />
            </p>
          </div>
          <TrendBadge current={data.current.totalEarnings} previous={data.previous.totalEarnings} />
        </div>
      </div>

      {/* Date Filter Bar */}
      <div style={{ background: "var(--lg-paper-raised)", borderRadius: "var(--lg-radius)", padding: "16px 24px", border: "1px solid var(--lg-line)", boxShadow: "var(--lg-shadow-md)", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--lg-ink-soft)" }}>Period:</span>
          <div style={{ position: "relative" }} ref={ddRef}>
            <button
              onClick={() => setDdOpen(!ddOpen)}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--lg-radius-pill)",
                border: "1px solid var(--lg-line)",
                background: "var(--lg-paper-sunken)",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--lg-ink)",
                cursor: "pointer"
              }}
            >
              📅 {DATE_OPTIONS.find((o) => o.key === dateOption)?.label} ▾
            </button>

            {ddOpen && (
              <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 6, background: "var(--lg-paper-raised)", border: "1px solid var(--lg-line)", borderRadius: "var(--lg-radius-sm)", boxShadow: "var(--lg-shadow-lg)", zIndex: 100, width: 200, padding: 6 }}>
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setDateOption(opt.key)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: "transparent", color: "var(--lg-ink)", fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: "pointer" }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleApply}
            style={{
              padding: "8px 20px",
              borderRadius: "var(--lg-radius-pill)",
              border: "none",
              background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))",
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            Apply Filter
          </button>
        </div>

        <span style={{ fontSize: 13, color: "var(--lg-ink-soft)", fontWeight: 600 }}>
          Showing: <strong style={{ color: "var(--lg-violet)" }}>{appliedLabel}</strong>
        </span>
      </div>

      {/* Campaign Performance Grid */}
      <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 18px 0", color: "var(--lg-ink)", fontFamily: "var(--lg-font-display)" }}>Campaign Breakdown</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {campaigns.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: 48, textAlign: "center", background: "var(--lg-paper-raised)", borderRadius: "var(--lg-radius)", border: "1px solid var(--lg-line)", color: "var(--lg-ink-soft)" }}>
            No campaign activity found for this timeframe.
          </div>
        ) : (
          campaigns.map((c) => (
            <div
              key={c.offId}
              style={{
                background: "var(--lg-paper-raised)",
                borderRadius: "var(--lg-radius)",
                padding: 24,
                border: "1px solid var(--lg-line)",
                boxShadow: "var(--lg-shadow-md)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "var(--lg-radius-sm)", background: c.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>
                    {c.initials}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: "var(--lg-ink)" }}>{c.offerName}</h4>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c.totalLeads > 0 ? "var(--lg-success)" : "var(--lg-ink-faint)" }}>
                      {c.totalLeads > 0 ? "● Active Conversions" : "● No leads yet"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: 14, borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", textAlign: "center", marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--lg-ink-soft)", fontWeight: 600 }}>Clicks</span>
                    <p style={{ fontSize: 16, fontWeight: 800, margin: "2px 0 0 0", color: "var(--lg-ink)" }}>{c.totalClicks}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--lg-ink-soft)", fontWeight: 600 }}>Leads</span>
                    <p style={{ fontSize: 16, fontWeight: 800, margin: "2px 0 0 0", color: "var(--lg-violet)" }}>{c.totalLeads}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--lg-ink-soft)", fontWeight: 600 }}>CVR</span>
                    <p style={{ fontSize: 16, fontWeight: 800, margin: "2px 0 0 0", color: "var(--lg-success)" }}>{c.cvr}%</p>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ height: 6, borderRadius: "var(--lg-radius-pill)", background: "var(--lg-paper-sunken)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${c.cvr}%`, background: "linear-gradient(90deg, var(--lg-violet), var(--lg-pink))" }} />
                  </div>
                </div>
              </div>

              <a
                href={`/detailed-report?o=${c.offId}&start_date=${data.period.startDate}&end_date=${data.period.endDate}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "10px",
                  borderRadius: "var(--lg-radius-pill)",
                  background: "var(--lg-paper-sunken)",
                  color: "var(--lg-violet)",
                  fontSize: 12.5,
                  fontWeight: 800,
                  textDecoration: "none"
                }}
              >
                View Detailed Logs →
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
