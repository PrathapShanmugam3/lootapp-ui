"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, StatusBadge, PrimaryButton } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const SEARCH_ICON = "M11 3.5a7.5 7.5 0 1 0 4.65 13.4l4.72 4.72a1 1 0 0 0 1.42-1.42l-4.72-4.72A7.5 7.5 0 0 0 11 3.5Zm-5.5 7.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z";

export default function AllOffersPage() {
  const [offers, setOffers] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/api/admin/offers").then((res) => setOffers(res.offers)).catch(() => setOffers([]));
  }, []);

  if (!offers) return <Loader style={{ padding: 32, color: "var(--lg-ink-soft)" }} />;

  const filtered = offers.filter((o) => o.offer_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <AdminPageHeader
        title="All Offers"
        subtitle={`${offers.length} offers`}
        action={<PrimaryButton onClick={() => (window.location.href = "/admin/add-offer")}>+ Add Offer</PrimaryButton>}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--lg-paper-sunken)",
          border: "1.5px solid transparent",
          borderRadius: "var(--lg-radius-pill)",
          padding: "10px 16px",
          width: "100%",
          maxWidth: 300,
          marginBottom: 20,
          transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--lg-violet)"; e.currentTarget.style.background = "var(--lg-paper-raised)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "var(--lg-paper-sunken)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <svg viewBox="0 0 24 24" fill="var(--lg-ink-faint)" style={{ width: 15, height: 15, flexShrink: 0 }}><path d={SEARCH_ICON} /></svg>
        <input
          placeholder="Search offers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: "none", border: "none", outline: "none", color: "var(--lg-ink)", fontFamily: "var(--lg-font-body)", fontSize: 13, width: "100%" }}
        />
      </div>

      <AdminCard>
        <AdminTable columns={["#", "ID", "Name", "Caps", "Status", "Action"]}>
          {filtered.map((o, i) => (
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
