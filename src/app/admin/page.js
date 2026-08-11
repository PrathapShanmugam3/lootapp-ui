"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";

const ICON_GRADIENTS = [
  "linear-gradient(135deg, var(--lg-violet), #20C997)",
  "linear-gradient(135deg, var(--lg-pink), #5EEAD4)",
  "linear-gradient(135deg, var(--lg-cyan), #4CE0C9)",
  "linear-gradient(135deg, var(--lg-yellow), var(--lg-orange))",
  "linear-gradient(135deg, var(--lg-blue), #5CA5FF)",
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17, color: "#fff" }}>
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
        padding: 20,
        boxShadow: "var(--lg-shadow-lg)",
        transition: "transform 180ms ease, box-shadow 180ms ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ width: 36, height: 36, borderRadius: "var(--lg-radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, background: gradient }}>
        <Icon name={icon} />
      </div>
      <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--lg-ink-faint)", margin: 0 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: "var(--lg-ink)", margin: "4px 0 0", fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "var(--lg-ink-faint)", margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

const panelStyle = {
  background: "var(--lg-paper-raised)",
  borderRadius: "var(--lg-radius)",
  padding: 24,
  boxShadow: "var(--lg-shadow-md)",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/admin/dashboard").then((res) => setData(res.data)).catch(() => setData(null));
  }, []);

  if (!data) return <Loader style={{ padding: 32, color: "var(--lg-ink-soft)" }} />;

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
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)", letterSpacing: "-0.01em" }}>Admin Dashboard</h1>
      <p style={{ color: "var(--lg-ink-faint)", marginBottom: 28, fontSize: 13.5 }}>Loot Hat operations overview</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 24 }}>
        {stats1.map((s, i) => (
          <StatCard key={s.label} {...s} gradient={ICON_GRADIENTS[i % ICON_GRADIENTS.length]} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
        {stats2.map((s, i) => (
          <StatCard key={s.label} {...s} gradient={ICON_GRADIENTS[(i + 2) % ICON_GRADIENTS.length]} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={panelStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ fontSize: 16.5, fontWeight: 700, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Top Offers by Conversion Rate</h2>
          </div>
          {data.topOffers.map((o, i) => {
            const pct = Number(o.cr) || 0;
            const pctColor = pct >= 20 ? "var(--lg-success)" : pct >= 5 ? "var(--lg-warning)" : "var(--lg-ink-faint)";
            return (
              <div key={o.offId} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i === data.topOffers.length - 1 ? "none" : "1px solid var(--lg-line)" }}>
                <div style={{ width: 26, height: 26, borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--lg-font-display)", fontSize: 12, fontWeight: 700, color: "var(--lg-ink-soft)", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--lg-ink)", flex: 1 }}>{o.offerName}</div>
                <div style={{ fontSize: 11.5, color: "var(--lg-ink-faint)", flexShrink: 0 }}>{o.clicks} clicks · {o.conversions} conv.</div>
                <div style={{ flex: 1, height: 6, borderRadius: 4, background: "var(--lg-paper-sunken)", overflow: "hidden", margin: "0 12px", maxWidth: 100 }}>
                  <div style={{ width: `${Math.min(100, (pct / maxCr) * 100)}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg, var(--lg-violet), var(--lg-pink))" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, fontVariantNumeric: "tabular-nums", width: 46, textAlign: "right", color: pctColor }}>{o.cr}%</div>
              </div>
            );
          })}
        </div>

        <div style={panelStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ fontSize: 16.5, fontWeight: 700, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Recent Payments</h2>
          </div>
          <div>
            {data.recentPayments.slice(0, 5).map((p, i, arr) => {
              const initial = (p.offName || "?").charAt(0).toUpperCase();
              const success = p.status === "Success";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--lg-line)" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "var(--lg-radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--lg-font-display)", fontWeight: 700, fontSize: 12, color: "#fff", flexShrink: 0, background: ICON_GRADIENTS[i % ICON_GRADIENTS.length] }}>{initial}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--lg-ink)" }}>{p.offName}</div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "3px 9px",
                        borderRadius: "var(--lg-radius-pill)",
                        marginTop: 3,
                        background: success ? "var(--lg-success-soft)" : p.status === "Failed" ? "var(--lg-error-soft)" : "var(--lg-warning-soft)",
                        color: success ? "var(--lg-success)" : p.status === "Failed" ? "var(--lg-error)" : "var(--lg-warning)",
                      }}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div style={{ marginLeft: "auto", fontFamily: "var(--lg-font-display)", fontWeight: 700, fontSize: 14, color: "var(--lg-ink)", fontVariantNumeric: "tabular-nums" }}>₹{p.amount}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
