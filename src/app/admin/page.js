"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const ICON_GRADIENTS = [
  "linear-gradient(135deg, var(--lg-violet), #a78bfa)",
  "linear-gradient(135deg, #ec4899, #f472b6)",
  "linear-gradient(135deg, #06b6d4, #38bdf8)",
  "linear-gradient(135deg, #f59e0b, #fbbf24)",
  "linear-gradient(135deg, #3b82f6, #60a5fa)",
];

const GLOW_COLORS = [
  "var(--lg-glow-violet)",
  "var(--lg-glow-pink)",
  "var(--lg-glow-cyan)",
  "var(--lg-glow-warning)",
  "var(--lg-glow-violet)",
];

const ICONS = {
  clicks: <path d="m3 11 18-8-8 18-2-8-8-2z" />,
  check: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m22 4-10 10-3-3" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  wallet: <><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20M6 15h4" /></>,
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: "#fff" }}>
      {ICONS[name]}
    </svg>
  );
}

function StatCard({ label, value, sub, icon, gradient, glow }) {
  return (
    <div
      style={{
        background: "var(--lg-paper-raised)",
        borderRadius: "var(--lg-radius)",
        padding: "20px 22px",
        boxShadow: "var(--lg-shadow-md)",
        border: "1px solid var(--lg-line)",
        transition: "transform 250ms ease, box-shadow 300ms ease, border-color 250ms ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.transform = "translateY(-6px)"; 
        e.currentTarget.style.borderColor = "var(--lg-violet)";
        e.currentTarget.style.boxShadow = `var(--lg-shadow-lg), ${glow || "var(--lg-glow-violet)"}`;
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.transform = "translateY(0)"; 
        e.currentTarget.style.borderColor = "var(--lg-line)";
        e.currentTarget.style.boxShadow = "var(--lg-shadow-md)";
      }}
    >
      {/* Shimmer overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: gradient,
        opacity: 0.7,
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--lg-ink-soft)", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
        <div style={{ width: 38, height: 38, borderRadius: "var(--lg-radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", background: gradient, boxShadow: `0 4px 12px rgba(0,0,0,0.15), ${glow || "var(--lg-glow-violet)"}` }}>
          <Icon name={icon} />
        </div>
      </div>
      <p style={{ fontSize: 26, fontWeight: 800, color: "var(--lg-ink)", margin: 0, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--lg-ink-faint)", margin: "6px 0 0" }}>{sub}</p>}
    </div>
  );
}

const panelStyle = {
  background: "var(--lg-paper-raised)",
  borderRadius: "var(--lg-radius)",
  padding: 24,
  border: "1px solid var(--lg-line)",
  boxShadow: "var(--lg-shadow-md)",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    api.get("/api/admin/dashboard").then((res) => setData(res.data)).catch(() => setData(null));
  }, []);

  useEffect(() => {
    if (!data?.chart || !chartRef.current) return;
    import("chart.js/auto").then(({ default: Chart }) => {
      if (chartInstance.current) chartInstance.current.destroy();
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const textColor = isDark ? "#94a3b8" : "#475569";
      const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
      chartInstance.current = new Chart(chartRef.current.getContext("2d"), {
        type: "line",
        data: {
          labels: data.chart.map(c => c.date),
          datasets: [
            { label: "Clicks", data: data.chart.map(c => c.clicks), borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.1)", borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: "#fff", tension: 0.4, fill: true },
            { label: "Conversions", data: data.chart.map(c => c.conversions), borderColor: "#ec4899", backgroundColor: "rgba(236,72,153,0.1)", borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: "#fff", tension: 0.4, fill: true },
            { label: "Payouts (₹)", data: data.chart.map(c => c.payouts), borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)", borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: "#fff", tension: 0.4, fill: true },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: isDark ? "#131b2e" : "#fff", titleColor: isDark ? "#fff" : "#0f172a", bodyColor: textColor, borderColor: isDark ? "#1e293b" : "#e2e8f0", borderWidth: 1, padding: 12, displayColors: true, boxPadding: 4 }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11, weight: '600' } } },
            y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11, weight: '600' } } }
          }
        }
      });
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [data]);

  if (!data) return <Loader style={{ padding: 40, color: "var(--lg-violet)" }} />;

  const stats1 = [
    { label: "Clicks Today", value: data.clicks.today.toLocaleString("en-IN"), sub: `${data.clicks.yesterday} yesterday`, icon: "clicks" },
    { label: "Clicks This Month", value: data.clicks.month.toLocaleString("en-IN"), sub: `${data.clicks.lastMonth.toLocaleString("en-IN")} last month`, icon: "clicks" },
    { label: "Conversions Today", value: data.conversions.today.toLocaleString("en-IN"), sub: `${data.conversions.yesterday} yesterday`, icon: "check" },
    { label: "Conversions This Month", value: data.conversions.month.toLocaleString("en-IN"), sub: `${data.conversions.lastMonth.toLocaleString("en-IN")} last month`, icon: "check" },
    { label: "Payout Today", value: `₹${data.withdrawals.today.toLocaleString("en-IN")}`, sub: `₹${data.withdrawals.yesterday.toLocaleString("en-IN")} yesterday`, icon: "wallet" },
    { label: "Payout This Month", value: `₹${data.withdrawals.month.toLocaleString("en-IN")}`, sub: `₹${data.withdrawals.lastMonth.toLocaleString("en-IN")} last month`, icon: "wallet" },
    { label: "Pending Payout", value: `₹${data.pendingAmount.toLocaleString("en-IN")}`, sub: "Awaiting approval", icon: "clock" },
    { label: "Processing Payout", value: `₹${data.processingAmount.toLocaleString("en-IN")}`, sub: "At gateway", icon: "clock" },
    { label: "Failed Payout", value: `₹${data.failedPayouts.month.toLocaleString("en-IN")}`, sub: `₹${data.failedPayouts.lastMonth.toLocaleString("en-IN")} last month`, icon: "wallet" },
  ];
  const stats2 = [
    { label: "Live Offers", value: data.liveOffers, icon: "clock" },
    { label: "Total Users", value: data.totalUsers.toLocaleString("en-IN"), icon: "users" },
    { label: "Logged In Today", value: data.todayLoggedUsers, icon: "check" },
    { label: "Joined Today", value: data.todayJoinedUsers, icon: "users" },
    { label: "Total Wallet Balance", value: `₹${data.totalWalletBalance.toLocaleString("en-IN")}`, icon: "wallet" },
  ];

  const maxCr = Math.max(...data.topOffers.map((o) => Number(o.cr) || 0), 1);

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 40 }}>
      <AdminPageHeader title="Overview & Analytics" subtitle="Loot Hat operational overview & real-time analytics" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 20, marginBottom: 24 }}>
        {stats1.map((s, i) => (
          <StatCard key={s.label} {...s} gradient={ICON_GRADIENTS[i % ICON_GRADIENTS.length]} glow={GLOW_COLORS[i % GLOW_COLORS.length]} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 20, marginBottom: 32 }}>
        {stats2.map((s, i) => (
          <StatCard key={s.label} {...s} gradient={ICON_GRADIENTS[(i + 2) % ICON_GRADIENTS.length]} glow={GLOW_COLORS[(i + 2) % GLOW_COLORS.length]} />
        ))}
      </div>

      {/* 7-Day Trend Chart */}
      <div style={{ ...panelStyle, marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, var(--lg-violet), var(--lg-pink), var(--lg-cyan))", opacity: 0.7 }} />
        <div className="chart-header-row">
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>7-Day Trend</h2>
          <div className="chart-legend">
            <span className="chart-legend-item"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", flexShrink: 0, boxShadow: "0 0 6px rgba(99,102,241,0.5)" }} />Clicks</span>
            <span className="chart-legend-item"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ec4899", flexShrink: 0, boxShadow: "0 0 6px rgba(236,72,153,0.5)" }} />Conversions</span>
            <span className="chart-legend-item"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0, boxShadow: "0 0 6px rgba(245,158,11,0.5)" }} />Payouts</span>
          </div>
        </div>
        <div className="chart-canvas-wrapper">
          <canvas ref={chartRef} />
        </div>
      </div>

      <div className="chart-campaigns-grid">
        <div style={panelStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Top Offers by Conversion Rate</h2>
          </div>
          {data.topOffers.map((o, i) => {
            const pct = Number(o.cr) || 0;
            const pctColor = pct >= 20 ? "var(--lg-success)" : pct >= 5 ? "var(--lg-warning)" : "var(--lg-ink-faint)";
            return (
              <div key={o.offId} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i === data.topOffers.length - 1 ? "none" : "1px solid var(--lg-line)" }}>
                <div style={{ width: 28, height: 28, borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--lg-font-display)", fontSize: 12, fontWeight: 800, color: "var(--lg-ink-soft)", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--lg-ink)", flex: 1 }}>{o.offerName}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--lg-ink-faint)", flexShrink: 0 }}>{o.clicks} clicks · {o.conversions} conv.</div>
                <div style={{ flex: 1, height: 8, borderRadius: 99, background: "var(--lg-paper-sunken)", overflow: "hidden", margin: "0 14px", maxWidth: 100 }}>
                  <div style={{ width: `${Math.min(100, (pct / maxCr) * 100)}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg, var(--lg-violet), var(--lg-pink))" }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, fontVariantNumeric: "tabular-nums", width: 50, textAlign: "right", color: pctColor }}>{o.cr}%</div>
              </div>
            );
          })}
        </div>

        <div style={panelStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Recent Payments</h2>
          </div>
          <div>
            {data.recentPayments.slice(0, 5).map((p, i, arr) => {
              const initial = (p.offName || "?").charAt(0).toUpperCase();
              const success = p.status === "Success";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--lg-line)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "var(--lg-radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--lg-font-display)", fontWeight: 800, fontSize: 13, color: "#fff", flexShrink: 0, background: ICON_GRADIENTS[i % ICON_GRADIENTS.length] }}>{initial}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--lg-ink)" }}>{p.offName}</div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "var(--lg-radius-pill)",
                        marginTop: 4,
                        background: success ? "var(--lg-success-soft)" : p.status === "Failed" ? "var(--lg-error-soft)" : "var(--lg-warning-soft)",
                        color: success ? "var(--lg-success)" : p.status === "Failed" ? "var(--lg-error)" : "var(--lg-warning)",
                      }}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div style={{ marginLeft: "auto", fontFamily: "var(--lg-font-display)", fontWeight: 800, fontSize: 15, color: "var(--lg-ink)", fontVariantNumeric: "tabular-nums" }}>₹{p.amount}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
