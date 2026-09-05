"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, StatusBadge, Pagination, TextInput, CsvExportButton } from "@/components/AdminPage";
import Loader from "@/components/Loader";

export default function EmpClickLogsPage() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(null);
  const [search, setSearch] = useState("");
  const [offId, setOffId] = useState("");
  const [event, setEvent] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    api.get("/api/emp/clicks/filters").then(setFilters).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (offId) params.set("offId", offId);
    if (event) params.set("event", event);
    api.get(`/api/emp/clicks?${params}`).then(setData).catch(() => setData(null));
  }, [search, offId, event, page, limit]);

  return (
    <div style={{ padding: "2rem", maxWidth: 1300, margin: "0 auto" }}>
      <AdminPageHeader
        title="Click Logs"
        subtitle={data ? `${data.totalRecords.toLocaleString("en-IN")} clicks` : ""}
        action={
          data?.clicks?.length > 0 && (
            <CsvExportButton
              headers={["Click ID", "Offer", "Affiliate", "Event", "IP", "Date", "Time", "Status"]}
              rows={data.clicks.map(c => [c.click_id, c.off_name, c.aff_id, c.current_event, c.ip, c.date, c.time, c.click_status === "1" ? "Converted" : "Pending"])}
              filename="click-logs.csv"
            />
          )
        }
      />
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <TextInput placeholder="Search click ID, affiliate, UPI…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: "100%", maxWidth: 260, borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} />
        <select
          value={offId}
          onChange={(e) => { setOffId(e.target.value); setPage(1); }}
          style={{
            padding: "9px 13px",
            borderRadius: "var(--lg-radius-sm)",
            border: "1.5px solid transparent",
            fontSize: 13,
            fontFamily: "var(--lg-font-body)",
            color: "var(--lg-ink)",
            background: "var(--lg-paper-sunken)",
            outline: "none",
            cursor: "pointer",
            transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
          }}
        >
          <option value="">All offers</option>
          {filters?.offers.map((o) => <option key={o.off_id} value={o.off_id}>{o.off_name}</option>)}
        </select>
        <select
          value={event}
          onChange={(e) => { setEvent(e.target.value); setPage(1); }}
          style={{
            padding: "9px 13px",
            borderRadius: "var(--lg-radius-sm)",
            border: "1.5px solid transparent",
            fontSize: 13,
            fontFamily: "var(--lg-font-body)",
            color: "var(--lg-ink)",
            background: "var(--lg-paper-sunken)",
            outline: "none",
            cursor: "pointer",
            transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
          }}
        >
          <option value="">All events</option>
          {filters?.events.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      <AdminCard>
        {!data ? (
          <Loader style={{ padding: 32 }} />
        ) : (
          <>
            <AdminTable columns={[
              "#", "Click ID", "Date", "Time", "Affiliate", "Offer", "IP", "Stage",
              "User UPI", "Refer UPI", "Input1", "Input2", "Input4",
              "Eve1 Status", "Eve2 Status", "Eve3 Status", "Eve4 Status", "Eve5 Status",
              "User Pay", "Refer Pay",
            ]}>
              {data.clicks.map((c, i) => {
                const eventStatusCell = (n) => {
                  const done = c[`eve_${n}_status`] === "1";
                  const hasEvent = (c[`eve_${n}`] || "").trim().length > 0;
                  if (!hasEvent) return <span style={{ color: "var(--lg-ink-faint)", fontSize: 12 }}>-</span>;
                  return <StatusBadge status={done ? "Done" : "Pending"} />;
                };
                const payCell = (pay) => {
                  if (!pay) return <span style={{ color: "var(--lg-ink-faint)", fontSize: 12 }}>-</span>;
                  return (
                    <div style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 700, color: "var(--lg-ink)" }}>₹{pay.amount}</div>
                      <div style={{ color: "var(--lg-ink-faint)" }}>{pay.destination} · {pay.status}</div>
                    </div>
                  );
                };
                return (
                  <tr key={c.id} style={{ borderTop: "1px solid var(--lg-line-soft)" }}>
                    <td style={{ padding: "10px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                    <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 12 }}>{c.click_id}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--lg-ink-faint)" }}>{c.date}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--lg-ink-faint)" }}>{c.time}</td>
                    <td style={{ padding: "10px 16px" }}>{c.aff_id}</td>
                    <td style={{ padding: "10px 16px" }}>{c.off_name}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--lg-ink-faint)" }}>{c.ip}</td>
                    <td style={{ padding: "10px 16px" }}>{c.current_event}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{c.aff_sub_1 || "-"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{c.aff_sub_2 || "-"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{c.aff_sub_3 || "-"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{c.aff_sub_4 || "-"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{c.aff_sub_5 || "-"}</td>
                    <td style={{ padding: "10px 16px" }}>{eventStatusCell(1)}</td>
                    <td style={{ padding: "10px 16px" }}>{eventStatusCell(2)}</td>
                    <td style={{ padding: "10px 16px" }}>{eventStatusCell(3)}</td>
                    <td style={{ padding: "10px 16px" }}>{eventStatusCell(4)}</td>
                    <td style={{ padding: "10px 16px" }}>{eventStatusCell(5)}</td>
                    <td style={{ padding: "10px 16px" }}>{payCell(c.user_pay_status)}</td>
                    <td style={{ padding: "10px 16px" }}>{payCell(c.refer_pay_status)}</td>
                  </tr>
                );
              })}
            </AdminTable>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "0 4px" }}>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                style={{
                  padding: "7px 30px 7px 12px", borderRadius: "var(--lg-radius-pill)", border: "1.5px solid var(--lg-line)",
                  background: "var(--lg-paper-sunken)", fontSize: 12.5, fontWeight: 600, color: "var(--lg-ink)",
                  fontFamily: "var(--lg-font-body)", outline: "none", appearance: "none", cursor: "pointer",
                  transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--lg-violet)"; e.target.style.background = "var(--lg-paper-raised)"; e.target.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--lg-line)"; e.target.style.background = "var(--lg-paper-sunken)"; e.target.style.boxShadow = "none"; }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <Pagination page={data.currentPage} totalPages={data.totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </AdminCard>
    </div>
  );
}
