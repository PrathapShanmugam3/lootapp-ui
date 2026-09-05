"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, StatusBadge, PrimaryButton } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function LiveOffersPage() {
  const [offers, setOffers] = useState(null);

  useEffect(() => {
    api.get("/api/admin/offers?status=live").then((res) => setOffers(res.offers)).catch(() => setOffers([]));
  }, []);

  if (!offers) return <Loader style={{ padding: 32, color: "var(--lg-ink-soft)" }} />;

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <AdminPageHeader
        title="Live Offers"
        subtitle={`${offers.length} currently live`}
        action={<PrimaryButton onClick={() => (window.location.href = "/admin/add-offer")}>+ Add Offer</PrimaryButton>}
      />
      <AdminCard>
        <AdminTable columns={["#", "ID", "Name", "Caps", "Status", "Action"]}>
          {offers.map((o, i) => (
            <tr
              key={o.off_id}
              style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background 140ms ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--lg-paper-sunken)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{i + 1}</td>
              <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12.5, color: "var(--lg-ink-faint)" }}>{o.off_id}</td>
              <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{o.offer_name}</td>
              <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{o.caps}</td>
              <td style={{ padding: "12px 16px" }}><StatusBadge status={o.offer_status} /></td>
              <td style={{ padding: "12px 16px" }}>
                <a href={`/admin/offer-detail?o=${o.off_id}`} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, textDecoration: "none", transition: "color 150ms ease" }}>View</a>
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>
    </div>
  );
}
