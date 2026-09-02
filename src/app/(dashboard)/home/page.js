"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";

const ICON_GRADIENTS = {
  clicks: "linear-gradient(135deg, var(--lg-violet), #a78bfa)",
  conversions: "linear-gradient(135deg, #ec4899, #f472b6)",
  earnings: "linear-gradient(135deg, #f59e0b, #fbbf24)"
};

const KPI_GLOWS = {
  clicks: "var(--lg-glow-violet)",
  conversions: "var(--lg-glow-pink)",
  earnings: "var(--lg-glow-warning)"
};

function KpiCard({ label, value, trend, mtd, icon, gradient, glowKey }) {
  const trendPct = typeof trend === "object" ? trend?.trend ?? 0 : trend;
  const dir = typeof trend === "object" ? trend?.direction ?? "flat" : "flat";
  const glow = KPI_GLOWS[glowKey] || "var(--lg-glow-violet)";

  return (
    <div
      style={{
        background: "var(--lg-paper-raised)",
        borderRadius: "var(--lg-radius)",
        padding: "22px 24px",
        boxShadow: "var(--lg-shadow-md)",
        border: "1px solid var(--lg-line)",
        transition: "transform 250ms ease, box-shadow 300ms ease, border-color 250ms ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.transform = "translateY(-6px)"; 
        e.currentTarget.style.borderColor = "var(--lg-violet)";
        e.currentTarget.style.boxShadow = `var(--lg-shadow-lg), ${glow}`;
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.transform = "translateY(0)"; 
        e.currentTarget.style.borderColor = "var(--lg-line)";
        e.currentTarget.style.boxShadow = "var(--lg-shadow-md)";
      }}
    >
      {/* Colored accent bar at top */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: gradient,
        borderRadius: "var(--lg-radius) var(--lg-radius) 0 0",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--lg-ink-soft)", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
        <div style={{ width: 40, height: 40, borderRadius: "var(--lg-radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", background: gradient, color: "#fff", boxShadow: `0 4px 12px rgba(0,0,0,0.12), ${glow}` }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: 32, fontWeight: 800, color: "var(--lg-ink)", margin: "0 0 14px", fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{value}</p>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--lg-line)" }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: dir === "up" ? "var(--lg-success)" : dir === "down" ? "var(--lg-error)" : "var(--lg-ink-soft)" }}>
          {dir === "up" ? "↑ " : dir === "down" ? "↓ " : ""}
          {trendPct}% vs yesterday
        </span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--lg-ink-soft)" }}>MTD: {mtd}</span>
      </div>
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

export default function AffiliateDashboard() {
  const [data, setData] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    api.get("/api/dashboard")
      .then((res) => {
        if (res && res.kpis) {
          setData(res);
        } else if (res && res.data) {
          setData(res.data);
        } else {
          setData(res);
        }
      })
      .catch(() => setData(null));
  }, []);

  useEffect(() => {
    if (!data || !chartRef.current) return;

    const chartArray = Array.isArray(data.chart) ? data.chart : [];
    const labels = chartArray.length > 0 
      ? chartArray.map((c) => c.date) 
      : data.chart?.labels || [];

    const clicksData = chartArray.length > 0 
      ? chartArray.map((c) => c.clicks) 
      : data.chart?.datasets?.clicks || [];

    const conversionsData = chartArray.length > 0 
      ? chartArray.map((c) => c.conversions) 
      : data.chart?.datasets?.conversions || [];

    const earningsData = chartArray.length > 0 
      ? chartArray.map((c) => c.earnings) 
      : data.chart?.datasets?.earnings || [];
    
    import("chart.js/auto").then(({ default: Chart }) => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const textColor = isDark ? "#94a3b8" : "#475569";
      const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
      
      const ctx = chartRef.current.getContext("2d");
      
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Clicks",
              data: clicksData,
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.12)",
              borderWidth: 2.5,
              pointRadius: 4,
              pointBackgroundColor: "#fff",
              tension: 0.4,
              fill: true,
            },
            {
              label: "Conversions",
              data: conversionsData,
              borderColor: "#ec4899",
              backgroundColor: "rgba(236, 72, 153, 0.12)",
              borderWidth: 2.5,
              pointRadius: 4,
              pointBackgroundColor: "#fff",
              tension: 0.4,
              fill: true,
            },
            {
              label: "Earnings (₹)",
              data: earningsData,
              borderColor: "#f59e0b",
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              borderWidth: 2.5,
              pointRadius: 4,
              pointBackgroundColor: "#fff",
              tension: 0.4,
              fill: true,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? "#131b2e" : "#ffffff",
              titleColor: isDark ? "#ffffff" : "#0f172a",
              bodyColor: isDark ? "#94a3b8" : "#475569",
              borderColor: isDark ? "#1e293b" : "#e2e8f0",
              borderWidth: 1,
              padding: 12,
              displayColors: true,
              boxPadding: 4,
            }
          },
          scales: {
            x: {
              grid: { display: false, drawBorder: false },
              ticks: { color: textColor, font: { size: 11, weight: '600' } }
            },
            y: {
              grid: { color: gridColor, drawBorder: false },
              ticks: { color: textColor, font: { size: 11, weight: '600' } }
            }
          }
        }
      });
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (!data) return <Loader style={{ padding: 40, color: "var(--lg-violet)" }} />;

  const userName = data.user?.name || data.userName || "Affiliate";
  const liveOffers = data.liveOffers ?? 0;
  const kpis = data.kpis || { clicks: {}, conversions: {}, earnings: {} };
  const topCampaigns = Array.isArray(data.topCampaigns) ? data.topCampaigns : [];

  return (
    <div className="dashboard-page-root">
      <div style={{ marginBottom: 28 }}>
        <h1 className="dashboard-welcome-title">Welcome back, {userName} 👋</h1>
        <p style={{ color: "var(--lg-ink-soft)", fontSize: 14, margin: 0 }}>
          <span style={{ color: "var(--lg-violet)", fontWeight: 700 }}>{liveOffers} Live offers</span> available for promotion today
        </p>
      </div>

      <div className="kpi-cards-grid">
        <KpiCard
          label="Clicks"
          value={kpis.clicks?.value ?? 0}
          trend={kpis.clicks}
          mtd={kpis.clicks?.mtd ?? 0}
          gradient={ICON_GRADIENTS.clicks}
          glowKey="clicks"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>}
        />
        <KpiCard
          label="Conversions"
          value={kpis.conversions?.value ?? 0}
          trend={kpis.conversions}
          mtd={kpis.conversions?.mtd ?? 0}
          gradient={ICON_GRADIENTS.conversions}
          glowKey="conversions"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 9 3-3 3 3" /><path d="M13 18H7a4 4 0 0 1-4-4V6" /><path d="m22 15-3 3-3-3" /><path d="M11 6h6a4 4 0 0 1 4 4v8" /></svg>}
        />
        <KpiCard
          label="Earnings"
          value={`₹${kpis.earnings?.value ?? 0}`}
          trend={kpis.earnings}
          mtd={`₹${kpis.earnings?.mtd ?? 0}`}
          gradient={ICON_GRADIENTS.earnings}
          glowKey="earnings"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" /></svg>}
        />
      </div>

      <div className="chart-campaigns-grid">
        <div style={panelStyle}>
          <div className="chart-header-row">
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>7-Day Performance</h2>
            <div className="chart-legend">
              <span className="chart-legend-item"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />Clicks</span>
              <span className="chart-legend-item"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ec4899", flexShrink: 0 }} />Conversions</span>
              <span className="chart-legend-item"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />Earnings</span>
            </div>
          </div>
          <div className="chart-canvas-wrapper">
            <canvas ref={chartRef} />
          </div>
        </div>

        <div style={panelStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Top Campaigns</h2>
              <p style={{ fontSize: 12, color: "var(--lg-ink-soft)", marginTop: 2 }}>Highest converting offers this month</p>
            </div>
            <a href="/live-offers" style={{ fontSize: 12, fontWeight: 700, color: "var(--lg-violet)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              View All →
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--lg-paper-sunken)", borderRadius: "var(--lg-radius-sm)", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Campaign</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Earnings</span>
          </div>

          <div>
            {topCampaigns.length > 0 ? (
              topCampaigns.slice(0, 5).map((offer, index) => {
                const initial = (offer.offerName || "?").charAt(0).toUpperCase();
                return (
                  <div key={offer.offId || index} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 4px", borderBottom: index === topCampaigns.length - 1 ? "none" : "1px solid var(--lg-line)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "var(--lg-radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--lg-font-display)", fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0, background: Object.values(ICON_GRADIENTS)[index % 3] }}>{initial}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--lg-ink)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{offer.offerName}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "var(--lg-radius-pill)", background: "var(--lg-success-soft)", color: "var(--lg-success)", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Active</span>
                        <span style={{ fontSize: 12, color: "var(--lg-ink-soft)" }}>{offer.clicks || 0}c · {offer.conversions || 0}v</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: "var(--lg-ink)", margin: 0, fontVariantNumeric: "tabular-nums" }}>₹{(offer.earnings || 0).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--lg-ink-soft)" }}>No active campaigns found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
