"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, TextInput, Pagination } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const STATUS_COLORS = {
  pending: { bg: "var(--lg-warning-soft)", fg: "var(--lg-warning)" },
  approved: { bg: "var(--lg-success-soft)", fg: "var(--lg-success)" },
  rejected: { bg: "var(--lg-error-soft)", fg: "var(--lg-error)" },
};

export default function AccountDeleteRequestsPage() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [message, setMessage] = useState(null);

  function load() {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    api.get(`/api/admin/account-delete-requests?${params}`).then(setData).catch(() => setData(null));
  }

  useEffect(() => {
    load();
  }, [search, status, page, limit]);

  async function handleAction(id, newStatus) {
    setMessage(null);
    try {
      await api.put(`/api/admin/account-delete-requests/${id}`, { status: newStatus });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <AdminPageHeader title="Account Delete Requests" subtitle={data ? `${data.totalRecords} requests` : ""} />

      {message && (
        <div style={{ padding: 14, borderRadius: "var(--lg-radius-sm)", marginBottom: 16, background: "var(--lg-error-soft)", color: "var(--lg-error)", fontSize: 13, fontWeight: 600 }}>{message.text}</div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <TextInput placeholder="Search by email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: "100%", maxWidth: 280, borderRadius: "var(--lg-radius-pill)" }} />
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{
              padding: "10px 36px 10px 16px", borderRadius: "var(--lg-radius-pill)", border: "1.5px solid var(--lg-line)",
              background: "var(--lg-paper-sunken)", fontSize: 13, color: "var(--lg-ink)", fontFamily: "var(--lg-font-body)",
              outline: "none", appearance: "none", cursor: "pointer", transition: "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--lg-violet)"; e.target.style.background = "var(--lg-paper-raised)"; e.target.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--lg-line)"; e.target.style.background = "var(--lg-paper-sunken)"; e.target.style.boxShadow = "none"; }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <span style={{ position: "absolute", right: 14, pointerEvents: "none", color: "var(--lg-ink-faint)", fontSize: 10 }}>▾</span>
        </div>
      </div>

      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-md)", border: "none" }}>
        {!data ? (
          <Loader style={{ padding: 32, color: "var(--lg-ink-faint)" }} />
        ) : (
          <>
            <AdminTable columns={["#", "Email", "Reason", "Status", "Submitted", "Actions"]}>
              {data.requests.map((r, i) => {
                const colors = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
                return (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--lg-line-soft)", transition: "background-color 140ms ease" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--lg-paper-sunken)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "12px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{r.email}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--lg-ink-soft)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.reason}>{r.reason}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, padding: "4px 11px", borderRadius: "var(--lg-radius-pill)", background: colors.bg, color: colors.fg, textTransform: "capitalize" }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--lg-ink-faint)", fontVariantNumeric: "tabular-nums" }}>{r.created_at}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {r.status === "pending" ? (
                        <div style={{ display: "flex", gap: 12 }}>
                          <button onClick={() => handleAction(r.id, "approved")} style={{ color: "var(--lg-success)", fontWeight: 700, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Approve</button>
                          <button onClick={() => handleAction(r.id, "rejected")} style={{ color: "var(--lg-error)", fontWeight: 700, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Reject</button>
                        </div>
                      ) : (
                        <button onClick={() => handleAction(r.id, "pending")} style={{ color: "var(--lg-ink-faint)", fontWeight: 700, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Reset</button>
                      )}
                    </td>
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
