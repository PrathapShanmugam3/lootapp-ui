"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, TextInput, PrimaryButton } from "@/components/AdminPage";
import { StatCard, DrilldownModal, AffiliateOfferBreakdown } from "@/components/AffiliateEarningsReport";
import { InlineLoader } from "@/components/Loader";

export default function UserReportPage() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [drilldown, setDrilldown] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSelectedUser(null);
    setReport(null);
    try {
      const res = await api.get(`/api/emp/users?search=${encodeURIComponent(query)}&page=1`);
      setMatches(res.users || []);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  function loadReport(user) {
    setSelectedUser(user);
    setReportLoading(true);
    api.get(`/api/emp/affiliates/${encodeURIComponent(user.user_id)}/report`)
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setReportLoading(false));
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <AdminPageHeader title="User Report" subtitle="Search a user, then view their earnings summary" />
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }} noValidate>
        <TextInput placeholder="Name, email, mobile, UPI…" value={query} onChange={(e) => setQuery(e.target.value)} required style={{ width: 320 }} />
        <PrimaryButton type="submit" disabled={loading}>{loading ? <><InlineLoader style={{ marginRight: 8 }} />Searching…</> : "Search"}</PrimaryButton>
      </form>

      {matches && !selectedUser && (
        <AdminCard>
          <AdminTable columns={["#", "User ID", "Name", "Email", "Mobile", "UPI", "Balance", "Action"]}>
            {matches.map((u, i) => (
              <tr key={u.id} style={{ borderTop: "1px solid var(--lg-line-soft)" }}>
                <td style={{ padding: "12px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{i + 1}</td>
                <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{u.user_id}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{u.name}</td>
                <td style={{ padding: "12px 16px" }}>{u.email}</td>
                <td style={{ padding: "12px 16px" }}>{u.mobile}</td>
                <td style={{ padding: "12px 16px" }}>{u.upi || "—"}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, fontVariantNumeric: "tabular-nums", fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>₹{u.balance.toLocaleString("en-IN")}</td>
                <td style={{ padding: "12px 16px", display: "flex", gap: 14 }}>
                  <button onClick={() => loadReport(u)} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}>View Report</button>
                  <a href={`/emp/user-details?user_id=${u.user_id}`} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>View Details</a>
                </td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr><td colSpan={8} style={{ padding: "16px", color: "var(--lg-ink-faint)", fontSize: 13 }}>No users found.</td></tr>
            )}
          </AdminTable>
        </AdminCard>
      )}

      {selectedUser && (
        <>
          <button onClick={() => setSelectedUser(null)} style={{ marginBottom: 16, color: "var(--lg-violet)", background: "none", border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer", padding: 0 }}>
            ← Back to results
          </button>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>
            {selectedUser.name} ({selectedUser.user_id})
          </h3>
          {reportLoading ? (
            <InlineLoader />
          ) : report ? (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <StatCard label="Total Offers" value={report.summary.totalOffers} />
                <StatCard label="Total Clicks" value={report.summary.totalClicks.toLocaleString("en-IN")} />
                <StatCard label="Total Leads" value={report.summary.totalLeads.toLocaleString("en-IN")} />
                <StatCard label="Total Paid" value={`₹${report.summary.totalPaid.toLocaleString("en-IN")}`} />
                <StatCard label="Wallet Added" value={`₹${report.summary.totalWalletAdded.toLocaleString("en-IN")}`} />
              </div>
              <AffiliateOfferBreakdown offers={report.offers} onViewMore={setDrilldown} />
            </>
          ) : (
            <p style={{ fontSize: 13, color: "var(--lg-ink-faint)" }}>Could not load report for this user.</p>
          )}
        </>
      )}

      {drilldown && selectedUser && (
        <DrilldownModal
          affId={selectedUser.user_id}
          offId={drilldown.offId}
          offName={drilldown.offName}
          onClose={() => setDrilldown(null)}
          onChanged={() => loadReport(selectedUser)}
        />
      )}
    </div>
  );
}
