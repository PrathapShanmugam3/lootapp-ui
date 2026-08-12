"use client";

import { useEffect, useState } from "react";
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

function StatCard({ label, value, sub, icon, gradient }) {
  return (
    <div
      style={{
        background: "var(--lg-paper-raised)",
        borderRadius: "var(--lg-radius)",
        padding: "20px 22px",
        boxShadow: "var(--lg-shadow-md)",
        border: "1px solid var(--lg-line)",
        transition: "transform 200ms ease, boxShadow 200ms ease, borderColor 200ms ease",
      }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.transform = "translateY(-4px)"; 
        e.currentTarget.style.borderColor = "var(--lg-violet)";
        e.currentTarget.style.boxShadow = "var(--lg-shadow-lg)";
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.transform = "translateY(0)"; 
        e.currentTarget.style.borderColor = "var(--lg-line)";
        e.currentTarget.style.boxShadow = "var(--lg-shadow-md)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--lg-ink-soft)", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
        <div style={{ width: 38, height: 38, borderRadius: "var(--lg-radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", background: gradient, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
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

  useEffect(() => {
    api.get("/api/admin/dashboard").then((res) => setData(res.data)).catch(() => setData(null));
  }, []);

  if (!data) return <Loader style={{ padding: 40, color: "var(--lg-violet)" }} />;

  const stats1 = [
    { label: "Clicks Today", value: data.clicks.today.toLocaleString("en-IN"), sub: `${data.clicks.yesterday} yesterday`, icon: "clicks" },
    { label: "Conversions Today", value: data.conversions.today.toLocaleString("en-IN"), sub: `${data.conversions.yesterday} yesterday`, icon: "check" },
    { label: "Success Payout", value: `₹${data.withdrawals.month.toLocaleString("en-IN")}`, sub: "This month", icon: "wallet" },
    { label: "Pending Payout", value: `₹${data.pendingAmount.toLocaleString("en-IN")}`, sub: "Awaiting approval", icon: "clock" },
    { label: "Processing Payout", value: `₹${data.processingAmount.toLocaleString("en-IN")}`, sub: "At gateway", icon: "clock" },
    { label: "Failed Payout", value: `₹${data.failedPayouts.month.toLocaleString("en-IN")}`, sub: "This month", icon: "wallet" },
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
          <StatCard key={s.label} {...s} gradient={ICON_GRADIENTS[i % ICON_GRADIENTS.length]} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 20, marginBottom: 32 }}>
        {stats2.map((s, i) => (
          <StatCard key={s.label} {...s} gradient={ICON_GRADIENTS[(i + 2) % ICON_GRADIENTS.length]} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }}>
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
