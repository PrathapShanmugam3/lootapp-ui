"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, StatusBadge } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function EmpLiveOffersPage() {
  const [offers, setOffers] = useState(null);

  useEffect(() => {
    api.get("/api/emp/offers?status=live").then((res) => setOffers(res.offers)).catch(() => setOffers([]));
  }, []);

  if (!offers) return <Loader style={{ padding: 32 }} />;

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <AdminPageHeader title="Live Offers" subtitle={`${offers.length} currently live (read-only)`} />
      <AdminCard>
        <AdminTable columns={["#", "ID", "Name", "Caps", "Status", "Action"]}>
          {offers.map((o, i) => (
            <tr
              key={o.off_id}
              style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background 140ms ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--lg-paper-sunken)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <td style={{ padding: "12px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{i + 1}</td>
              <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums", color: "var(--lg-ink-faint)", fontSize: 12.5 }}>{o.off_id}</td>
              <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{o.offer_name}</td>
              <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{o.caps}</td>
              <td style={{ padding: "12px 16px" }}><StatusBadge status={o.offer_status} /></td>
              <td style={{ padding: "12px 16px" }}>
                <a href={`/emp/offer-detail?o=${o.off_id}`} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, textDecoration: "none", transition: "color 150ms ease" }}>View Details</a>
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>
    </div>
  );
}
