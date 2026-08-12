"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, TextInput, PrimaryButton, Pagination } from "@/components/AdminPage";
import { InlineLoader } from "@/components/Loader";

export default function UserReportPage() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  function fetchUsers(searchVal, pageVal, limitVal) {
    setLoading(true);
    api.get(`/api/emp/users?search=${encodeURIComponent(searchVal)}&page=${pageVal}&limit=${limitVal}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (activeQuery) {
      fetchUsers(activeQuery, page, limit);
    }
  }, [activeQuery, page, limit]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query) return;
    setPage(1);
    setActiveQuery(query);
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <AdminPageHeader title="User Report" subtitle="Search users by name, email, mobile, or UPI" />
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <TextInput placeholder="Name, email, mobile, UPI…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 320 }} />
        <PrimaryButton type="submit" disabled={loading}>{loading ? <><InlineLoader style={{ marginRight: 8 }} />Searching…</> : "Search"}</PrimaryButton>
      </form>
      {data && (
        <AdminCard>
          <AdminTable columns={["#", "User ID", "Name", "Email", "Mobile", "UPI", "Balance", "Action"]}>
            {data.users.map((u, i) => (
              <tr
                key={u.id}
                style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background 140ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--lg-paper-sunken)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <td style={{ padding: "12px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                <td style={{ padding: "12px 16px", fontVariantNumeric: "tabular-nums" }}>{u.user_id}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{u.name}</td>
                <td style={{ padding: "12px 16px" }}>{u.email}</td>
                <td style={{ padding: "12px 16px" }}>{u.mobile}</td>
                <td style={{ padding: "12px 16px" }}>{u.upi || "—"}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, fontVariantNumeric: "tabular-nums", fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)" }}>₹{u.balance.toLocaleString("en-IN")}</td>
                <td style={{ padding: "12px 16px" }}>
                  <a href={`/emp/user-details?user_id=${u.user_id}`} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>View</a>
                </td>
              </tr>
            ))}
          </AdminTable>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "10px 16px" }}>
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
        </AdminCard>
      )}
    </div>
  );
}
