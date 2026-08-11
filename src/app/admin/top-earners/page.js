"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function TopEarnersPage() {
  const [earners, setEarners] = useState(null);

  useEffect(() => {
    const now = new Date();
    const monthStart = `${now.toISOString().slice(0, 7)}-01`;
    api.get(`/api/admin/top-earners?dateFrom=${monthStart}`).then((res) => setEarners(res.earners)).catch(() => setEarners([]));
  }, []);

  if (!earners) return <Loader style={{ padding: 32 }} />;

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <AdminPageHeader title="Top Earners" subtitle="This month, ranked by total earnings" />
      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        <AdminTable columns={["Rank", "UPI/Pay ID", "User", "Total Earnings", "Payments", "Last Payment"]}>
          {earners.map((e, i) => (
            <tr key={`${e.aff_id}-${e.pay_id}`} style={{ borderTop: "1px solid var(--lg-line)", transition: "background-color 140ms ease" }}>
              <td style={{ padding: "10px 16px", fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>{MEDALS[i] || i + 1}</td>
              <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 12, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={e.pay_id}>{e.pay_id}</td>
              <td style={{ padding: "10px 16px" }}><a href={`/admin/user_performance?user_id=${e.aff_id}`} style={{ color: "var(--lg-violet)", fontWeight: 600, textDecoration: "none", transition: "color 150ms ease" }}>{e.name || e.aff_id}</a></td>
              <td style={{ padding: "10px 16px", fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>₹{e.total_earnings.toLocaleString("en-IN")}</td>
              <td style={{ padding: "10px 16px", fontVariantNumeric: "tabular-nums" }}>{e.total_payments}</td>
              <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--lg-ink-faint)" }}>{e.last_payment}</td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>
    </div>
  );
}
