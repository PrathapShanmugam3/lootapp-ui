"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, StatusBadge } from "@/components/AdminPage";
import Loader from "@/components/Loader";

function StatBox({ label, value }) {
  return (
    <div
      style={{
        background: "var(--lg-paper-raised)",
        borderRadius: "var(--lg-radius)",
        padding: 18,
        boxShadow: "var(--lg-shadow-md)",
        transition: "transform 180ms ease, box-shadow 180ms ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--lg-ink-faint)", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>{label}</p>
      <p style={{ fontSize: 21, fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums", margin: "6px 0 0", color: "var(--lg-ink)" }}>{value}</p>
    </div>
  );
}

function UserPerformanceContent() {
  const userId = useSearchParams().get("user_id");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!userId) return;
    api.get(`/api/admin/users/${userId}/performance`).then(setData).catch(() => setData(null));
  }, [userId]);

  if (!data) return <Loader style={{ padding: 32, color: "var(--lg-ink-soft)" }} />;
  if (!data.user) return <div style={{ padding: 32, color: "var(--lg-ink-soft)" }}>User not found.</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <AdminPageHeader title={data.user.name} subtitle={`${data.user.email} · ${data.user.mobile} · UPI: ${data.user.upi || "—"}`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatBox label="Balance" value={`₹${data.user.balance.toLocaleString("en-IN")}`} />
        <StatBox label="Total Credited" value={`₹${data.totalCredited.toLocaleString("en-IN")}`} />
        <StatBox label="Total Clicks" value={data.totalClicks.toLocaleString("en-IN")} />
        <StatBox label="Total Conversions" value={data.totalConversions.toLocaleString("en-IN")} />
        <StatBox label="Conversion Rate" value={`${data.conversionRate}%`} />
      </div>

      <AdminCard style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>Withdrawal Breakdown</h3>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {Object.entries(data.withdrawalBreakdown).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusBadge status={k} /> <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--lg-ink)" }}>₹{v.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <div style={{ padding: "20px 20px 4px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)", margin: 0 }}>Recent Transactions</h3>
        </div>
        <AdminTable columns={["#", "Type", "Amount", "Comment", "Status", "Date"]}>
          {data.transactions.map((t, i) => (
            <tr
              key={t.id}
              style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background 140ms ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--lg-paper-sunken)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <td style={{ padding: "12px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{i + 1}</td>
              <td style={{ padding: "12px 16px", textTransform: "capitalize", color: "var(--lg-ink)" }}>{t.type}</td>
              <td style={{ padding: "12px 16px", fontWeight: 700, fontVariantNumeric: "tabular-nums", fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>₹{t.amount}</td>
              <td style={{ padding: "12px 16px" }}>{t.comment}</td>
              <td style={{ padding: "12px 16px" }}><StatusBadge status={t.status} /></td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--lg-ink-faint)" }}>{t.date} {t.time}</td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>
    </div>
  );
}

export default function UserPerformancePage() {
  return (
    <Suspense fallback={<Loader style={{ padding: 32, color: "var(--lg-ink-soft)" }} />}>
      <UserPerformanceContent />
    </Suspense>
  );
}
