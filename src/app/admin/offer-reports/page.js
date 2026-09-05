"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, StatusBadge, CsvExportButton } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function OfferReportsPage() {
  const [offers, setOffers] = useState(null);

  useEffect(() => {
    api.get("/api/admin/offer-reports").then((res) => setOffers(res.offers)).catch(() => setOffers([]));
  }, []);

  if (!offers) return <Loader style={{ padding: 32 }} />;

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <AdminPageHeader
        title="Offer Reports"
        subtitle={`${offers.length} offers`}
        action={
          offers.length > 0 && (
            <CsvExportButton
              headers={["Offer", "Status", "Clicks", "Conversions", "Payout"]}
              rows={offers.map(o => [o.offer_name, o.offer_status, o.clicks, o.conversions, o.payout])}
              filename="offer-reports.csv"
            />
          )
        }
      />
      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        <AdminTable columns={["#", "Offer", "Status", "Clicks", "Conversions", "Payout", "Action"]}>
          {offers.map((o, i) => (
            <tr key={o.off_id} style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background-color 140ms ease" }}>
              <td style={{ padding: "10px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{i + 1}</td>
              <td style={{ padding: "10px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{o.offer_name}</td>
              <td style={{ padding: "10px 16px" }}><StatusBadge status={o.offer_status} /></td>
              <td style={{ padding: "10px 16px", fontVariantNumeric: "tabular-nums" }}>{o.clicks.toLocaleString("en-IN")}</td>
              <td style={{ padding: "10px 16px", fontVariantNumeric: "tabular-nums" }}>{o.conversions.toLocaleString("en-IN")}</td>
              <td style={{ padding: "10px 16px", fontWeight: 700, fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>₹{o.payout}</td>
              <td style={{ padding: "10px 16px" }}>
                <a href={`/admin/offer-detail?o=${o.off_id}`} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, textDecoration: "none", transition: "color 150ms ease" }}>Details</a>
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>
    </div>
  );
}
