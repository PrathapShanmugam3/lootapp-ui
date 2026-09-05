"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, Pagination, CsvExportButton, TextInput } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const MEDALS = ["🥇", "🥈", "🥉"];

function monthStartOf(date) {
  return `${date.toISOString().slice(0, 7)}-01`;
}

const RANGE_PRESETS = [
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "all_time", label: "All Time" },
  { key: "custom", label: "Custom" },
];

function presetToRange(preset) {
  const now = new Date();
  if (preset === "this_month") return { dateFrom: monthStartOf(now), dateTo: "" };
  if (preset === "last_month") {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    return { dateFrom: monthStartOf(lastMonth), dateTo: lastMonthEnd.toISOString().slice(0, 10) };
  }
  if (preset === "all_time") return { dateFrom: "", dateTo: "" };
  return null;
}

function StatCard({ label, value }) {
  return (
    <div style={{ flex: 1, minWidth: 140, background: "var(--lg-paper-sunken)", borderRadius: "var(--lg-radius)", padding: "14px 18px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--lg-ink-faint)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--lg-ink)", fontFamily: "var(--lg-font-display)", marginTop: 4 }}>{value}</div>
    </div>
  );
}

export default function TopEarnersPage() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [preset, setPreset] = useState("this_month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const range = preset === "custom" ? { dateFrom: customFrom, dateTo: customTo } : presetToRange(preset);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (range.dateFrom) params.set("dateFrom", range.dateFrom);
    if (range.dateTo) params.set("dateTo", range.dateTo);
    api.get(`/api/admin/top-earners?${params}`).then(setData).catch(() => setData(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, preset, customFrom, customTo]);

  if (!data) return <Loader style={{ padding: 32 }} />;

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <AdminPageHeader
        title="Top Earners"
        subtitle={`${RANGE_PRESETS.find((p) => p.key === preset)?.label}, ranked by total earnings`}
        action={
          data?.earners?.length > 0 && (
            <CsvExportButton
              headers={["Rank", "UPI/Pay ID", "User", "Total Earnings", "Payments", "Last Payment"]}
              rows={data.earners.map((e, i) => [(page - 1) * limit + i + 1, e.pay_id, e.name || e.aff_id, e.total_earnings, e.total_payments, e.last_payment])}
              filename="top-earners.csv"
            />
          )
        }
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => { setPreset(p.key); setPage(1); }}
            style={{
              padding: "8px 16px", borderRadius: "var(--lg-radius-pill)", border: "none", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              background: preset === p.key ? "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))" : "var(--lg-paper-sunken)",
              color: preset === p.key ? "#fff" : "var(--lg-ink-soft)",
            }}
          >
            {p.label}
          </button>
        ))}
        {preset === "custom" && (
          <>
            <TextInput type="date" value={customFrom} onChange={(e) => { setCustomFrom(e.target.value); setPage(1); }} style={{ borderRadius: "var(--lg-radius-sm)" }} />
            <span style={{ color: "var(--lg-ink-faint)", fontSize: 12 }}>to</span>
            <TextInput type="date" value={customTo} onChange={(e) => { setCustomTo(e.target.value); setPage(1); }} style={{ borderRadius: "var(--lg-radius-sm)" }} />
          </>
        )}
      </div>

      {data.stats && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatCard label="Paying Affiliates" value={data.stats.payingAffiliates.toLocaleString("en-IN")} />
          <StatCard label="Total Paid" value={`₹${data.stats.totalPaid.toLocaleString("en-IN")}`} />
          <StatCard label="Total Payments" value={data.stats.totalPayments.toLocaleString("en-IN")} />
        </div>
      )}
      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        <AdminTable columns={["Rank", "UPI/Pay ID", "User", "Total Earnings", "Payments", "Last Payment"]}>
          {data.earners.map((e, i) => (
            <tr key={`${e.aff_id}-${e.pay_id}`} style={{ borderTop: "1px solid var(--lg-line)", transition: "background-color 140ms ease" }}>
              <td style={{ padding: "10px 16px", fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>{page === 1 ? (MEDALS[i] || i + 1) : (page - 1) * limit + i + 1}</td>
              <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" }}>{e.pay_id}</td>
              <td style={{ padding: "10px 16px" }}><a href={`/admin/user_performance?user_id=${e.aff_id}`} style={{ color: "var(--lg-violet)", fontWeight: 600, textDecoration: "none", transition: "color 150ms ease" }}>{e.name || e.aff_id}</a></td>
              <td style={{ padding: "10px 16px", fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>₹{e.total_earnings.toLocaleString("en-IN")}</td>
              <td style={{ padding: "10px 16px", fontVariantNumeric: "tabular-nums" }}>{e.total_payments}</td>
              <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--lg-ink-faint)" }}>{e.last_payment}</td>
            </tr>
          ))}
        </AdminTable>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "12px 4px 0" }}>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            style={{
              padding: "7px 30px 7px 12px", borderRadius: "var(--lg-radius-pill)", border: "1.5px solid var(--lg-line)",
              background: "var(--lg-paper-sunken)", fontSize: 12.5, fontWeight: 600, color: "var(--lg-ink)",
              fontFamily: "var(--lg-font-body)", outline: "none", appearance: "none", cursor: "pointer",
              transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--lg-violet)"; e.target.style.background = "var(--lg-paper-raised)"; e.target.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--lg-line)"; e.target.style.background = "var(--lg-paper-sunken)"; e.target.style.boxShadow = "none"; }}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <Pagination page={data.currentPage} totalPages={data.totalPages} onChange={setPage} />
        </div>
      </AdminCard>
    </div>
  );
}
