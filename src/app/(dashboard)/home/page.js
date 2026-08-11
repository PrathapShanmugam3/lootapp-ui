"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";

const TREND_ICONS = {
  up: { cls: "text-green-500", svg: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></> },
  down: { cls: "text-red-500", svg: <><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></> },
  flat: { cls: "text-gray-400", svg: <line x1="5" y1="12" x2="19" y2="12" /> },
};

function AnimatedCounter({ target, prefix = "" }) {
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
      const val = Math.round((1 - Math.pow(1 - p, 3)) * target);
      setDisplay(val);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{prefix}{display.toLocaleString("en-IN")}</>;
}

function KpiCard({ label, value, prefix, trend, mtd, mtdPrefix = "", wrapClass, kpiClass, badgeClass, numClass, icon }) {
  const trendInfo = TREND_ICONS[trend.direction] || TREND_ICONS.flat;
  const sign = trend.trend > 0 ? "+" : "";
  return (
    <div className={wrapClass}>
      <div className={`lh-kpi-card ${kpiClass} p-5`}>
        <div className="flex items-start justify-between mb-5">
          <span className="lh-kpi-label">{label}</span>
          <div className={`lh-icon-wrap ${badgeClass} flex h-9 w-9 items-center justify-center rounded-xl`}>
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {icon}
            </svg>
          </div>
        </div>
        <div className={`text-[2.8rem] font-extrabold leading-none mb-4 ${numClass}`} style={{ letterSpacing: "-0.03em" }}>
          <AnimatedCounter target={value} prefix={prefix} />
        </div>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1.5 text-[12px] font-medium ${trendInfo.cls}`}>
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {trendInfo.svg}
            </svg>
            {sign}{trend.trend}% vs yesterday
          </span>
          <span className="lh-pill">MTD {mtdPrefix}{Number(mtd).toLocaleString("en-IN", { minimumFractionDigits: mtdPrefix ? 2 : 0, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [dateLabel, setDateLabel] = useState("");
  const [chartLibReady, setChartLibReady] = useState(false);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    api.get("/api/dashboard").then(setData).catch(() => setData(null));
    setDateLabel(
      new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    );
  }, []);

  useEffect(() => {
    if (!data || !chartLibReady || !chartRef.current || typeof window === "undefined" || !window.Chart) return;

    const chartData = data.chart.map((d) => ({
      name: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      clicks: d.clicks,
      conversions: d.conversions,
      earnings: d.earnings,
    }));

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const styles = getComputedStyle(document.documentElement);
    const cssVar = (name) => styles.getPropertyValue(name).trim();
    const violet = cssVar("--lg-violet") || "#10B981";
    const pink = cssVar("--lg-pink") || "#14B8A6";
    const orange = cssVar("--lg-orange") || "#FF8A4C";
    const ink = cssVar("--lg-ink") || "#14162B";
    const inkSoft = cssVar("--lg-ink-soft") || "#565B7A";
    const inkFaint = cssVar("--lg-ink-faint") || "#8D91AC";
    const paperRaised = cssVar("--lg-paper-raised") || "#FFFFFF";
    const lineSoft = cssVar("--lg-line-soft") || "#ECEDF7";

    chartInstanceRef.current = new window.Chart(chartRef.current.getContext("2d"), {
      type: "line",
      data: {
        labels: chartData.map((d) => d.name),
        datasets: [
          { label: "Clicks", data: chartData.map((d) => d.clicks), borderColor: violet, backgroundColor: "rgba(16, 185, 129, 0.1)", borderWidth: 2.5, tension: 0.4, pointRadius: 4, pointBackgroundColor: paperRaised, pointBorderWidth: 2, yAxisID: "y" },
          { label: "Conversions", data: chartData.map((d) => d.conversions), borderColor: pink, backgroundColor: "rgba(20, 184, 166, 0.1)", borderWidth: 2.5, tension: 0.4, pointRadius: 4, pointBackgroundColor: paperRaised, pointBorderWidth: 2, yAxisID: "y" },
          { label: "Earnings", data: chartData.map((d) => d.earnings), borderColor: orange, backgroundColor: "rgba(255, 138, 76, 0.1)", borderWidth: 2.5, tension: 0.4, pointRadius: 4, pointBackgroundColor: paperRaised, pointBorderWidth: 2, yAxisID: "y1" },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: paperRaised,
            titleColor: ink,
            bodyColor: inkSoft,
            borderColor: lineSoft,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 14,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || "";
                if (label) label += ": ";
                if (context.dataset.label === "Earnings") label += "₹";
                label += context.parsed.y;
                return label;
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: inkFaint, font: { size: 10 } } },
          y: { position: "left", grid: { color: lineSoft, borderDash: [3, 5] }, ticks: { color: inkFaint, font: { size: 10 } } },
          y1: { position: "right", grid: { display: false }, ticks: { color: inkFaint, font: { size: 10 }, callback: (val) => "₹" + val } },
        },
      },
    });

    return () => chartInstanceRef.current?.destroy();
  }, [data, chartLibReady]);

  if (!data) {
    return <Loader />;
  }

  return (
    <main className="flex-1 space-y-6 px-8 py-7 max-w-7xl mx-auto w-full">
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="afterInteractive" onLoad={() => setChartLibReady(true)} />

      <div className="lh-welcome flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-[1.35rem] sm:text-[1.55rem] font-bold mb-0.5" style={{ color: "var(--lg-ink)", letterSpacing: "-0.02em" }}>
            Welcome back, {data.user.name}
          </h1>
          <p className="text-[13px] font-medium" style={{ color: "var(--lg-violet)" }}>{dateLabel}</p>
        </div>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--lg-ink-soft)" }}>
          <span className="lh-live-dot" />
          Live · Updated just now
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Clicks" value={data.kpis.clicks.value} trend={data.kpis.clicks} mtd={data.kpis.clicks.mtd}
          wrapClass="lh-card-1" kpiClass="lh-kpi-purple" badgeClass="lh-badge-purple" numClass="lh-num-purple"
          icon={<><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>}
        />
        <KpiCard
          label="Conversions" value={data.kpis.conversions.value} trend={data.kpis.conversions} mtd={data.kpis.conversions.mtd}
          wrapClass="lh-card-2" kpiClass="lh-kpi-blue" badgeClass="lh-badge-blue" numClass="lh-num-blue"
          icon={<><path d="m2 9 3-3 3 3" /><path d="M13 18H7a4 4 0 0 1-4-4V6" /><path d="m22 15-3 3-3-3" /><path d="M11 6h6a4 4 0 0 1 4 4v8" /></>}
        />
        <KpiCard
          label="Earnings" value={data.kpis.earnings.value} prefix="₹" trend={data.kpis.earnings} mtd={data.kpis.earnings.mtd} mtdPrefix="₹"
          wrapClass="lh-card-3" kpiClass="lh-kpi-indigo" badgeClass="lh-badge-indigo" numClass="lh-num-indigo"
          icon={<><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" /></>}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-7">
        <div className="lh-chart-section md:col-span-4 lg:col-span-5">
          <div className="lh-content-card lh-chart-card flex flex-col h-full">
            <div className="lh-chart-header px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <span className="text-[13px] font-semibold text-white" style={{ letterSpacing: "0.005em" }}>7-Day Performance</span>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <span className="flex items-center gap-1.5 text-[11px] text-white/65"><span className="h-2 w-2 rounded-full inline-block flex-shrink-0" style={{ background: "var(--lg-violet)" }} />Clicks</span>
                <span className="flex items-center gap-1.5 text-[11px] text-white/65"><span className="h-2 w-2 rounded-full inline-block flex-shrink-0" style={{ background: "var(--lg-pink)" }} />Conversions</span>
                <span className="flex items-center gap-1.5 text-[11px] text-white/65"><span className="h-2 w-2 rounded-full inline-block flex-shrink-0" style={{ background: "var(--lg-orange)" }} />Earnings (₹)</span>
              </div>
            </div>
            <div className="flex-1 min-h-[300px] px-4 pt-4 pb-3">
              <canvas ref={chartRef} />
            </div>
          </div>
        </div>

        <div className="lh-campaigns-section md:col-span-3 lg:col-span-2">
          <div className="lh-content-card lh-campaigns-card flex flex-col h-full">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-[14px] font-semibold" style={{ color: "var(--lg-ink)" }}>Top Campaigns</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--lg-ink-soft)" }}>By Earnings/Conversions this month</p>
              </div>
              <a href="/live-offers" className="lh-view-all flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                View All
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
            <div className="lh-table-header mx-5 rounded-lg px-3 py-2 mb-1 flex items-center justify-between">
              <span className="lh-table-head">Campaign</span>
              <span className="lh-table-head">Earnings</span>
            </div>
            <div className="flex-1 overflow-auto px-3 pb-3">
              {data.topCampaigns.length > 0 ? (
                data.topCampaigns.slice(0, 5).map((offer, index) => (
                  <div key={offer.offId} className={`lh-campaign-row lh-row-${index + 1} flex items-center justify-between px-2 py-3 rounded-lg`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium truncate pr-2" style={{ color: "var(--lg-ink)" }}>{offer.offerName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold lh-status-active">Active</span>
                        <span className="text-[11px]" style={{ color: "var(--lg-ink-soft)" }}>{offer.clicks}c · {offer.conversions}v</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="lh-earnings-text text-[14px]">₹{offer.earnings.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-6 text-[12px] text-gray-400">No active campaigns found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
