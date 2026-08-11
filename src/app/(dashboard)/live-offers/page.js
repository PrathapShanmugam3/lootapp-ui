"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";

const COLORS = ["var(--lg-violet)", "var(--lg-violet-deep)", "var(--lg-pink)", "var(--lg-cyan)", "var(--lg-blue)", "var(--lg-orange)", "var(--lg-yellow)", "var(--lg-success)", "var(--lg-error)"];
const CATEGORY_COLORS = {
  Demat: { bg: "var(--lg-violet-soft)", text: "var(--lg-violet-deep)", border: "transparent" },
  "Bank Account": { bg: "var(--lg-info-soft)", text: "var(--lg-info)", border: "transparent" },
  Insurance: { bg: "var(--lg-success-soft)", text: "var(--lg-success)", border: "transparent" },
};
const ITEMS_PER_PAGE = 7;

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

  if (!offers) {
    return <Loader />;
  }

  return (
    <main className="flex-1 px-8 py-7 max-w-7xl mx-auto w-full space-y-5">
      <div className="lh-cp-title flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-[1.45rem] font-bold mb-0.5" style={{ color: "var(--lg-ink)", letterSpacing: "-0.02em" }}>Campaigns</h1>
          <p className="text-[13px] font-medium" style={{ color: "var(--lg-violet)" }}>Browse and join affiliate offers</p>
        </div>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--lg-ink-soft)" }}>
          <span className="lh-live-dot" />
          Live · {campaigns.length} offers available
        </div>
      </div>

      <div className="lh-cp-statbar grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="lh-cp-stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,var(--lg-violet),var(--lg-pink))", boxShadow: "0 4px 14px -4px color-mix(in srgb, var(--lg-violet) 45%, transparent)" }}>
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--lg-ink-soft)" }}>Total Campaigns</p>
              <p className="text-[1.25rem] font-extrabold leading-tight" style={{ color: "var(--lg-violet)", letterSpacing: "-0.02em" }}>{campaigns.length}</p>
            </div>
          </div>
        </div>
        <div className="lh-cp-stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,var(--lg-orange),var(--lg-yellow))", boxShadow: "0 4px 14px -4px color-mix(in srgb, var(--lg-orange) 45%, transparent)" }}>
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" /></svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--lg-ink-soft)" }}>Total Payout Pool</p>
              <p className="text-[1.25rem] font-extrabold leading-tight" style={{ color: "var(--lg-orange)", letterSpacing: "-0.02em" }}>₹{totalPayoutPool.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
        <div className="lh-cp-stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,var(--lg-cyan),var(--lg-blue))", boxShadow: "0 4px 14px -4px color-mix(in srgb, var(--lg-blue) 45%, transparent)" }}>
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8" /><path d="M21 8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2" /></svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--lg-ink-soft)" }}>Active Categories</p>
              <p className="text-[1.25rem] font-extrabold leading-tight" style={{ color: "var(--lg-blue)", letterSpacing: "-0.02em" }}>{categories.length - 1}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lh-cp-table-card">
        <div className="lh-cp-card-head flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1 min-w-0">
            <div className="lh-input-wrap is-pill lh-icon-search flex-shrink-0 w-full sm:w-52">
              <input
                type="text"
                placeholder="Search campaigns…"
                className="lh-cp-search text-[13px]"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setTab(cat);
                    setPage(1);
                  }}
                  className={`lh-cp-tab whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-semibold ${tab === cat ? "lh-cp-tab-active" : "lh-cp-tab-inactive"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] flex-shrink-0 sm:ml-3" style={{ color: "var(--lg-ink-soft)" }}>
            {filtered.length} results
          </div>
        </div>

        <div className="lh-table-scroll">
          <div className="min-w-[640px]">
            <div className="lh-cp-col-head grid px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider" style={{ gridTemplateColumns: "48px 1fr 120px 130px 110px" }}>
              <span style={{ color: "var(--lg-ink-soft)" }}>#</span>
              <span style={{ color: "var(--lg-violet)" }}>Campaign</span>
              <span style={{ color: "var(--lg-violet)" }}>Payout</span>
              <span style={{ color: "var(--lg-violet)" }}>Category</span>
              <span style={{ color: "var(--lg-violet)", textAlign: "right" }}>Action</span>
            </div>

            <div className="px-3 pb-3">
              {visible.length === 0 ? (
                <div className="py-16 text-center" style={{ color: "var(--lg-ink-soft)" }}>
                  <p className="text-[13px]">No campaigns found</p>
                </div>
              ) : (
                visible.map((c, i) => {
                  const catStyle = CATEGORY_COLORS[c.category] || { bg: "var(--lg-paper-sunken)", text: "var(--lg-ink-soft)", border: "transparent" };
                  return (
                    <div key={c.id} className="lh-cp-row grid items-center px-2 py-3 rounded-xl" style={{ gridTemplateColumns: "48px 1fr 120px 130px 110px" }}>
                      <span className="text-[12px] font-medium pl-1" style={{ color: "var(--lg-ink-faint)" }}>{start + i + 1}</span>
                      <div className="flex items-center gap-3 min-w-0">
                        {c.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.logo}
                            alt={c.initials}
                            className="h-10 w-10 flex-shrink-0 rounded-xl object-cover shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="lh-cp-logo h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[12px] font-bold text-white select-none"
                          style={{ background: c.color, display: c.logo ? "none" : "flex" }}
                        >
                          {c.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold truncate" style={{ color: "var(--lg-ink)" }}>{c.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="lh-cp-payout text-[15px]">₹{c.payout.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}` }}>{c.category}</span>
                      </div>
                      <div className="flex justify-end">
                        <a href={`/offer-detail?o=${c.id}`} className="lh-cp-view-btn flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] font-semibold">
                          View
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="lh-cp-footer flex flex-col sm:flex-row items-center justify-between px-5 py-3 gap-3 sm:gap-0">
            <span className="text-[12px]" style={{ color: "var(--lg-ink-soft)" }}>
              Showing {start + 1}–{Math.min(start + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button className="lh-cp-page-btn p-1.5 rounded-lg" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`lh-cp-page-num text-[12px] font-semibold h-7 w-7 rounded-lg ${safePage === p ? "lh-cp-page-active" : "lh-cp-page-inactive"}`}
                >
                  {p}
                </button>
              ))}
              <button className="lh-cp-page-btn p-1.5 rounded-lg" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
