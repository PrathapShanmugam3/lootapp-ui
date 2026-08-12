"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";

const COLORS = [
  "linear-gradient(135deg, #6366f1, #a78bfa)",
  "linear-gradient(135deg, #ec4899, #f472b6)",
  "linear-gradient(135deg, #06b6d4, #38bdf8)",
  "linear-gradient(135deg, #f59e0b, #fbbf24)",
  "linear-gradient(135deg, #10b981, #34d399)",
];

const CATEGORY_COLORS = {
  Demat: { bg: "var(--lg-violet-soft)", text: "var(--lg-violet)" },
  "Bank Account": { bg: "var(--lg-info-soft)", text: "var(--lg-info)" },
  Insurance: { bg: "var(--lg-success-soft)", text: "var(--lg-success)" },
};

const ITEMS_PER_PAGE = 8;

function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initialsOf(name) {
  const words = name.trim().split(" ");
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}

export default function CampaignsPage() {
  const [offers, setOffers] = useState(null);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/api/offers").then((res) => setOffers(res.offers)).catch(() => setOffers([]));
  }, []);

  const campaigns = useMemo(() => {
    if (!offers) return [];
    return offers.map((o) => ({
      id: o.offId,
      name: o.offerName,
      payout: o.totalPayout,
      category: o.category || "Other",
      color: hashColor(o.offId),
      initials: initialsOf(o.offerName),
      logo: o.logo,
    }));
  }, [offers]);

  const categories = useMemo(() => ["All", ...new Set(campaigns.map((c) => c.category))], [campaigns]);

  const filtered = useMemo(
    () =>
      campaigns.filter((c) => {
        const matchCat = tab === "All" || c.category === tab;
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      }),
    [campaigns, tab, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const visible = filtered.slice(start, start + ITEMS_PER_PAGE);
  const totalPayoutPool = campaigns.reduce((s, c) => s + c.payout, 0);

  if (!offers) return <Loader style={{ padding: 40, color: "var(--lg-violet)" }} />;

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 40 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)", letterSpacing: "-0.02em" }}>Campaigns Directory</h1>
          <p style={{ color: "var(--lg-ink-soft)", fontSize: 14, marginTop: 4 }}>Promote verified advertiser offers and earn instant commissions</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--lg-success-soft)", color: "var(--lg-success)", padding: "6px 14px", borderRadius: "var(--lg-radius-pill)", fontSize: 12, fontWeight: 800 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--lg-success)" }} />
          {campaigns.length} Live Offers Available
        </div>
      </div>

      {/* Top Stat Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
        <div style={{ background: "var(--lg-paper-raised)", borderRadius: "var(--lg-radius)", padding: "20px 24px", border: "1px solid var(--lg-line)", boxShadow: "var(--lg-shadow-md)", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--lg-radius-sm)", background: "linear-gradient(135deg, #6366f1, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
          </div>
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: "var(--lg-ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Total Campaigns</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "var(--lg-ink)", margin: 0, fontFamily: "var(--lg-font-display)" }}>{campaigns.length}</p>
          </div>
        </div>

        <div style={{ background: "var(--lg-paper-raised)", borderRadius: "var(--lg-radius)", padding: "20px 24px", border: "1px solid var(--lg-line)", boxShadow: "var(--lg-shadow-md)", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--lg-radius-sm)", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" /></svg>
          </div>
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: "var(--lg-ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Total Payout Pool</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "var(--lg-ink)", margin: 0, fontFamily: "var(--lg-font-display)" }}>₹{totalPayoutPool.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div style={{ background: "var(--lg-paper-raised)", borderRadius: "var(--lg-radius)", padding: "20px 24px", border: "1px solid var(--lg-line)", boxShadow: "var(--lg-shadow-md)", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--lg-radius-sm)", background: "linear-gradient(135deg, #06b6d4, #38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8" /><path d="M21 8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2" /></svg>
          </div>
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: "var(--lg-ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Active Categories</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "var(--lg-ink)", margin: 0, fontFamily: "var(--lg-font-display)" }}>{categories.length - 1}</p>
          </div>
        </div>
      </div>

      {/* Main Filter & Search Control Panel */}
      <div style={{ background: "var(--lg-paper-raised)", borderRadius: "var(--lg-radius)", border: "1px solid var(--lg-line)", boxShadow: "var(--lg-shadow-md)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--lg-line)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 260 }}>
            <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ width: "100%", padding: "10px 16px 10px 38px", borderRadius: "var(--lg-radius-pill)", border: "1px solid var(--lg-line)", background: "var(--lg-paper-sunken)", fontSize: 13.5, color: "var(--lg-ink)", outline: "none" }}
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--lg-ink-faint)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>

            <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setTab(cat); setPage(1); }}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "var(--lg-radius-pill)",
                    fontSize: 12.5,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    background: tab === cat ? "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))" : "var(--lg-paper-sunken)",
                    color: tab === cat ? "#fff" : "var(--lg-ink-soft)",
                    transition: "all 0.18s ease"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--lg-ink-soft)" }}>{filtered.length} Campaigns</span>
        </div>

        {/* Campaign List */}
        <div className="lg-table-scroll" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr style={{ background: "var(--lg-paper-sunken)", borderBottom: "1px solid var(--lg-line)", textAlign: "left" }}>
                <th style={{ padding: "14px 24px", fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", textTransform: "uppercase" }}>#</th>
                <th style={{ padding: "14px 24px", fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", textTransform: "uppercase" }}>Campaign Name</th>
                <th style={{ padding: "14px 24px", fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", textTransform: "uppercase" }}>Payout</th>
                <th style={{ padding: "14px 24px", fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", textTransform: "uppercase" }}>Category</th>
                <th style={{ padding: "14px 24px", fontSize: 11, fontWeight: 800, color: "var(--lg-ink-soft)", textTransform: "uppercase", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "48px 0", textAlign: "center", color: "var(--lg-ink-soft)", fontSize: 14 }}>
                    No matching campaigns found.
                  </td>
                </tr>
              ) : (
                visible.map((c, i) => {
                  const catStyle = CATEGORY_COLORS[c.category] || { bg: "var(--lg-paper-sunken)", text: "var(--lg-ink-soft)" };
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--lg-line)", transition: "background 0.15s ease" }}>
                      <td style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "var(--lg-ink-faint)" }}>{start + i + 1}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 38, height: 38, borderRadius: "var(--lg-radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", background: c.color, color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                            {c.initials}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--lg-ink)" }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--lg-ink)", fontFamily: "var(--lg-font-display)", fontVariantNumeric: "tabular-nums" }}>₹{c.payout.toLocaleString("en-IN")}</span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ display: "inline-flex", padding: "4px 12px", borderRadius: "var(--lg-radius-pill)", background: catStyle.bg, color: catStyle.text, fontSize: 11, fontWeight: 800 }}>{c.category}</span>
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <a
                          href={`/offer-detail?o=${c.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 18px",
                            borderRadius: "var(--lg-radius-pill)",
                            background: "linear-gradient(135deg, var(--lg-violet), var(--lg-violet-deep))",
                            color: "#fff",
                            fontSize: 12.5,
                            fontWeight: 700,
                            textDecoration: "none",
                            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                          }}
                        >
                          View Offer
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
