"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, TextInput, PrimaryButton } from "@/components/AdminPage";
import { StatCard, DrilldownModal, AffiliateOfferBreakdown } from "@/components/AffiliateEarningsReport";
import { InlineLoader } from "@/components/Loader";

export default function ReferReportPage() {
  const [affId, setAffId] = useState("");
  const [activeAffId, setActiveAffId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drilldown, setDrilldown] = useState(null);

  function loadReport(id) {
    setLoading(true);
    api.get(`/api/emp/affiliates/${encodeURIComponent(id)}/report`)
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!affId.trim()) {
      setError("Search query is missing.");
      return;
    }
    setError("");
    setActiveAffId(affId);
    loadReport(affId);
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <AdminPageHeader title="Referrer Report" subtitle="Search an affiliate ID to see their earnings summary" />
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "flex-start" }} noValidate>
        <div>
          <TextInput
            placeholder="Affiliate ID…"
            value={affId}
            onChange={(e) => { setAffId(e.target.value); if (error) setError(""); }}
            required
            style={{ width: 320 }}
          />
          {error && <span style={{ display: "block", color: "#dc2626", fontSize: 12, fontWeight: 600, marginTop: 6 }}>{error}</span>}
        </div>
        <PrimaryButton type="submit" disabled={loading}>{loading ? <><InlineLoader style={{ marginRight: 8 }} />Searching…</> : "Search"}</PrimaryButton>
      </form>

      {report && (
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
      )}

      {drilldown && (
        <DrilldownModal
          affId={activeAffId}
          offId={drilldown.offId}
          offName={drilldown.offName}
          onClose={() => setDrilldown(null)}
          onChanged={() => loadReport(activeAffId)}
        />
      )}
    </div>
  );
}
