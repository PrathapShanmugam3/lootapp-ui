"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, StatusBadge, Pagination } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const SEARCH_ICON = "M11 3.5a7.5 7.5 0 1 0 4.65 13.4l4.72 4.72a1 1 0 0 0 1.42-1.42l-4.72-4.72A7.5 7.5 0 0 0 11 3.5Zm-5.5 7.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z";

export default function AllUsersPage() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    api.get(`/api/admin/users?${params}`).then(setData).catch(() => setData(null));
  }, [search, page, limit]);

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <AdminPageHeader title="Manage Users" subtitle={data ? `${data.totalRecords.toLocaleString("en-IN")} total users` : ""} />

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
          maxWidth: 340,
          marginBottom: 20,
          transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--lg-violet)"; e.currentTarget.style.background = "var(--lg-paper-raised)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "var(--lg-paper-sunken)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <svg viewBox="0 0 24 24" fill="var(--lg-ink-faint)" style={{ width: 15, height: 15, flexShrink: 0 }}><path d={SEARCH_ICON} /></svg>
        <input
          placeholder="Search name, email, mobile, UPI…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ background: "none", border: "none", outline: "none", color: "var(--lg-ink)", fontFamily: "var(--lg-font-body)", fontSize: 13, width: "100%" }}
        />
      </div>

      <AdminCard>
        {!data ? (
          <Loader style={{ padding: 32, color: "var(--lg-ink-soft)" }} />
        ) : (
          <>
            <AdminTable columns={["ID", "Name", "Email", "Mobile", "UPI", "Balance", "Status", "Last Login", "Action"]}>
              {data.users.map((u) => (
                <tr
                  key={u.id}
                  style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background 140ms ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--lg-paper-sunken)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{u.user_id}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{u.name}</td>
                  <td style={{ padding: "12px 16px" }}><a href={`/admin/user_performance?user_id=${u.user_id}`} style={{ color: "var(--lg-violet)", textDecoration: "none", transition: "color 150ms ease" }}>{u.email}</a></td>
                  <td style={{ padding: "12px 16px" }}>{u.mobile}</td>
                  <td style={{ padding: "12px 16px" }}>{u.upi || "—"}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, fontVariantNumeric: "tabular-nums", fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>₹{u.balance.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={u.status === "1" ? "Active" : "Inactive"} /></td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--lg-ink-faint)" }}>{u.last_login || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <a href={`/admin/edit-user?id=${u.id}`} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, textDecoration: "none", transition: "color 150ms ease" }}>Edit</a>
                  </td>
                </tr>
              ))}
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
