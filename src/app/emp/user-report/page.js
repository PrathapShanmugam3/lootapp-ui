"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, TextInput, PrimaryButton } from "@/components/AdminPage";
import { InlineLoader } from "@/components/Loader";

export default function UserReportPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/emp/users?search=${encodeURIComponent(query)}&page=1`);
      setUsers(res.users);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <AdminPageHeader title="User Report" subtitle="Search users by name, email, mobile, or UPI" />
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <TextInput placeholder="Name, email, mobile, UPI…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 320 }} />
        <PrimaryButton type="submit" disabled={loading}>{loading ? <><InlineLoader style={{ marginRight: 8 }} />Searching…</> : "Search"}</PrimaryButton>
      </form>
      {users && (
        <AdminCard>
          <AdminTable columns={["User ID", "Name", "Email", "Mobile", "UPI", "Balance", "Action"]}>
            {users.map((u) => (
              <tr
                key={u.id}
                style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background 140ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--lg-paper-sunken)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
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
        </AdminCard>
      )}
    </div>
  );
}
