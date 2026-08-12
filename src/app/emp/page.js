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

function StatCard({ label, value, gradient }) {
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
      <div style={{ width: 10, height: 10, borderRadius: "50%", marginBottom: 14, background: gradient }} />
      <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--lg-ink-faint)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: "var(--lg-ink)", margin: "4px 0 0", fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>{value}</p>
    </div>
  );
}

export default function EmpDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/emp/dashboard").then((res) => setData(res.data)).catch(() => setData(null));
  }, []);

  if (!data) return <Loader style={{ padding: 32 }} />;

  const stats = [
    { label: "Clicks Today", value: data.clicks.today },
    { label: "Conversions Today", value: data.conversions.today },
    { label: "Live Offers", value: data.liveOffers },
    { label: "Total Users", value: data.totalUsers.toLocaleString("en-IN") },
    { label: "Logged In Today", value: data.todayLoggedUsers },
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)", letterSpacing: "-0.01em" }}>Support Dashboard</h1>
      <p style={{ color: "var(--lg-ink-faint)", marginBottom: 28, fontSize: 13.5 }}>Read-only operations overview</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} gradient={ICON_GRADIENTS[i % ICON_GRADIENTS.length]} />
        ))}
      </div>

      <div style={{ background: "var(--lg-paper-raised)", borderRadius: "var(--lg-radius)", padding: 24, boxShadow: "var(--lg-shadow-md)" }}>
        <h2 style={{ fontSize: 16.5, fontWeight: 700, marginBottom: 18, margin: "0 0 18px", fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Recent Payments</h2>
        <div className="lg-table-scroll" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", minWidth: 420 }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ paddingBottom: 10, fontSize: 10.5, fontWeight: 800, color: "var(--lg-ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em", width: 50 }}>#</th>
                <th style={{ paddingBottom: 10, fontSize: 10.5, fontWeight: 800, color: "var(--lg-ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Offer</th>
                <th style={{ paddingBottom: 10, fontSize: 10.5, fontWeight: 800, color: "var(--lg-ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Amount</th>
                <th style={{ paddingBottom: 10, fontSize: 10.5, fontWeight: 800, color: "var(--lg-ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentPayments.slice(0, 15).map((p, i) => {
                const success = p.status === "Success";
                const failed = p.status === "Failed";
                return (
                  <tr key={i} style={{ borderTop: "1px solid var(--lg-line-soft)" }}>
                    <td style={{ padding: "10px 0", color: "var(--lg-ink-faint)", fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: "10px 0", fontWeight: 600, color: "var(--lg-ink)" }}>{p.offName}</td>
                    <td style={{ padding: "10px 0", fontWeight: 700, fontVariantNumeric: "tabular-nums", fontFamily: "var(--lg-font-display)" }}>₹{p.amount}</td>
                    <td style={{ padding: "10px 0" }}>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: "4px 12px",
                          borderRadius: "var(--lg-radius-pill)",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          background: success ? "var(--lg-success-soft)" : failed ? "var(--lg-error-soft)" : "var(--lg-warning-soft)",
                          color: success ? "var(--lg-success)" : failed ? "var(--lg-error)" : "var(--lg-warning)",
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
