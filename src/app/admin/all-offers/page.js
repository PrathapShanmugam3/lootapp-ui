"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, StatusBadge, PrimaryButton } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const SEARCH_ICON = "M11 3.5a7.5 7.5 0 1 0 4.65 13.4l4.72 4.72a1 1 0 0 0 1.42-1.42l-4.72-4.72A7.5 7.5 0 0 0 11 3.5Zm-5.5 7.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z";

export default function AllOffersPage() {
  const [offers, setOffers] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  function load() {
    api.get("/api/admin/offers").then((res) => setOffers(res.offers)).catch(() => setOffers([]));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  async function handleDuplicate(offId) {
    const res = await api.post(`/api/admin/offers/${offId}/duplicate`);
    if (res.success) {
      load();
    } else {
      alert(res.message || "Failed to duplicate offer.");
    }
  }

  if (!offers) return <Loader style={{ padding: 32, color: "var(--lg-ink-soft)" }} />;

  const filtered = offers.filter((o) => o.offer_name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedOffers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <AdminPageHeader
        title="All Offers"
        subtitle={`${offers.length} total offers`}
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
          {paginatedOffers.map((o, i) => (
            <tr
              key={o.off_id}
              style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background 140ms ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--lg-paper-sunken)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
              <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12.5, color: "var(--lg-ink-faint)" }}>{o.off_id}</td>
              <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{o.offer_name}</td>
              <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{o.caps}</td>
              <td style={{ padding: "12px 16px" }}><StatusBadge status={o.offer_status} /></td>
              <td style={{ padding: "12px 16px", display: "flex", gap: 14, alignItems: "center" }}>
                <a href={`/admin/offer-detail?o=${o.off_id}`} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, textDecoration: "none", transition: "color 150ms ease" }}>View</a>
                <button
                  onClick={() => handleDuplicate(o.off_id)}
                  style={{ color: "var(--lg-ink-soft)", background: "none", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", padding: 0 }}
                >
                  Duplicate
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
        
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderTop: "1px solid var(--lg-line-soft)" }}>
            <span style={{ fontSize: 13, color: "var(--lg-ink-soft)", fontWeight: 500 }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--lg-line)",
                  background: currentPage === 1 ? "var(--lg-paper-sunken)" : "var(--lg-paper)",
                  color: currentPage === 1 ? "var(--lg-ink-faint)" : "var(--lg-ink)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
              >
                Previous
              </button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px", fontSize: 13, fontWeight: 700, color: "var(--lg-ink)" }}>
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--lg-line)",
                  background: currentPage === totalPages ? "var(--lg-paper-sunken)" : "var(--lg-paper)",
                  color: currentPage === totalPages ? "var(--lg-ink-faint)" : "var(--lg-ink)",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
