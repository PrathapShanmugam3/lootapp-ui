"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";

const ITEMS_PER_PAGE = 8;

function AnimatedNumber({ target, prefix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!target) {
      setDisplay(0);
      return;
    }
    const dur = 1100;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{prefix}{display.toLocaleString("en-IN")}</>;
}

function exportCsv(rows, offerName) {
  const header = ["Sr No.", "Click ID", "User", "Refer", "Status", "Date", "Time"];
  const lines = [header.join(",")];
  rows.forEach((r, i) => {
    lines.push(
      [i + 1, r.clickId, r.userIdentity.value, r.referIdentity.value, r.status, r.date, r.time]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${offerName || "report"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function DetailedReportContent() {
  const searchParams = useSearchParams();
  const offId = searchParams.get("o");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  const [data, setData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!offId) return;
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    api.get(`/api/reports/${offId}?${params.toString()}`).then(setData).catch(() => setData(null));
  }, [offId, startDate, endDate]);

  const statusCounts = useMemo(() => {
    if (!data) return {};
    const counts = {};
    data.rows.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.rows.filter((r) => {
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q || r.userIdentity.value.toLowerCase().includes(q) || r.referIdentity.value.toLowerCase().includes(q) || r.clickId.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [data, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const visible = filtered.slice(start, start + ITEMS_PER_PAGE);

  if (!offId) {
    return <main className="flex-1 px-8 py-7 max-w-7xl mx-auto w-full text-sm text-red-500">No offer selected.</main>;
  }
  if (!data) {
    return <Loader />;
  }

  return (
    <main className="flex-1 px-8 py-6 max-w-7xl mx-auto w-full space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--lg-ink-soft)" }}>
            <a href="/report" style={{ color: "var(--lg-violet)" }}>Reports</a> / {data.offerName}
          </div>
          <h1 className="text-[1.35rem] font-extrabold mt-1" style={{ color: "var(--lg-ink)", letterSpacing: "-0.02em" }}>{data.offerName}</h1>
        </div>
        <button onClick={() => exportCsv(filtered, data.offerName)} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold" style={{ background: "linear-gradient(135deg,var(--lg-violet),var(--lg-violet-deep))", color: "#fff", boxShadow: "0 4px 14px -4px color-mix(in srgb, var(--lg-violet) 45%, transparent)" }}>
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="lh-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--lg-ink-soft)" }}>Total Clicks</p>
          <p className="text-[1.6rem] font-extrabold" style={{ color: "var(--lg-ink)" }}><AnimatedNumber target={data.stats.totalClicks} /></p>
        </div>
        <div className="lh-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--lg-ink-soft)" }}>Total Conversions</p>
          <p className="text-[1.6rem] font-extrabold" style={{ color: "var(--lg-ink)" }}><AnimatedNumber target={data.stats.totalConversions} /></p>
        </div>
        <div className="lh-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--lg-ink-soft)" }}>Total Earnings</p>
          <p className="text-[1.6rem] font-extrabold" style={{ color: "var(--lg-ink)" }}><AnimatedNumber target={data.stats.totalEarnings} prefix="₹" /></p>
        </div>
      </div>

      <div className="lh-card px-5 py-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setStatusFilter("All"); setPage(1); }} className="text-[12px] font-semibold px-3 py-1.5 rounded-full" style={statusFilter === "All" ? { background: "linear-gradient(135deg,var(--lg-violet),var(--lg-violet-deep))", color: "#fff" } : { background: "var(--lg-paper-sunken)", color: "var(--lg-ink-soft)" }}>
            All ({data.rows.length})
          </button>
          {Object.entries(statusCounts).map(([status, count]) => (
            <button key={status} onClick={() => { setStatusFilter(status); setPage(1); }} className="text-[12px] font-semibold px-3 py-1.5 rounded-full" style={statusFilter === status ? { background: "linear-gradient(135deg,var(--lg-violet),var(--lg-violet-deep))", color: "#fff" } : { background: "var(--lg-paper-sunken)", color: "var(--lg-ink-soft)" }}>
              {status} ({count})
            </button>
          ))}
          <div className="lh-input-wrap is-pill lh-icon-search ml-auto" style={{ width: 200 }}>
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="text-[13px]"
            />
          </div>
        </div>

        <div className="lh-table-scroll">
          <div className="min-w-[640px]">
            <div className="grid px-3 py-2 text-[11px] font-bold uppercase tracking-wider" style={{ gridTemplateColumns: "60px 130px 1fr 1fr 130px 100px 90px", color: "var(--lg-ink-soft)" }}>
              <span>Sr No.</span>
              <span>Click ID</span>
              <span>User</span>
              <span>Refer</span>
              <span>Status</span>
              <span>Date</span>
              <span>Time</span>
            </div>
            {visible.length === 0 ? (
              <div className="py-10 text-center text-sm" style={{ color: "var(--lg-ink-faint)" }}>No records found.</div>
            ) : (
              visible.map((r, i) => (
                <div key={r.clickId} className="lh-rdt-row grid px-3 py-2.5 text-[12px] items-center" style={{ gridTemplateColumns: "60px 130px 1fr 1fr 130px 100px 90px", borderTop: "1px dashed var(--lg-line-soft)", color: "var(--lg-ink-soft)" }}>
                  <span>{filtered.length - (start + i)}</span>
                  <span className="font-mono truncate">{r.clickId}</span>
                  <span>{r.userIdentity.label}: {r.userIdentity.value}</span>
                  <span>{r.referIdentity.label}: {r.referIdentity.value}</span>
                  <span className="font-semibold" style={{ color: "var(--lg-violet)" }}>{r.status}</span>
                  <span>{r.date}</span>
                  <span>{r.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 pt-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className="text-[12px] font-semibold h-7 w-7 rounded-lg" style={p === safePage ? { background: "linear-gradient(135deg,var(--lg-violet),var(--lg-violet-deep))", color: "#fff" } : { background: "var(--lg-paper-sunken)", color: "var(--lg-ink-soft)" }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function DetailedReportPage() {
  return (
    <Suspense fallback={<Loader />}>
      <DetailedReportContent />
    </Suspense>
  );
}
