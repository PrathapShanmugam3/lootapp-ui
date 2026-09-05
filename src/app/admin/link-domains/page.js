"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, PrimaryButton, TextInput } from "@/components/AdminPage";
import Loader from "@/components/Loader";
import { showError } from "@/lib/toast";

export default function LinkDomainsPage() {
  const [domains, setDomains] = useState(null);
  const [domain, setDomain] = useState("");
  const [label, setLabel] = useState("");

  function load() {
    api.get("/api/link-domains/admin/all").then((res) => setDomains(res.domains)).catch(() => setDomains([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/api/link-domains/admin", { domain, label });
      if (res.success) {
        setDomain("");
        setLabel("");
        load();
      } else {
        showError(res.message);
      }
    } catch (err) {
      showError(err.data?.message || err.message);
    }
  }

  async function handleToggleActive(row) {
    await api.put(`/api/link-domains/admin/${row.id}`, { isActive: !row.is_active });
    load();
  }

  async function handleSetDefault(id) {
    await api.post(`/api/link-domains/admin/${id}/default`);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this domain from the pool?")) return;
    await api.del(`/api/link-domains/admin/${id}`);
    load();
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <AdminPageHeader
        title="Link Domains"
        subtitle="Domains affiliates can choose from when generating offer / referral links"
      />

      <AdminCard style={{ padding: 20, marginBottom: 20, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }} noValidate>
          <TextInput
            placeholder="yourdomain.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
            pattern="^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})+$"
            title="Enter a valid domain name (e.g. example.com)"
            style={{ flex: 1, minWidth: 200, borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }}
          />
          <TextInput
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{ flex: 1, minWidth: 160, borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }}
          />
          <PrimaryButton type="submit">Add Domain</PrimaryButton>
        </form>
        <p style={{ marginTop: 10, fontSize: 12, color: "var(--lg-ink-faint)" }}>
          Before adding a domain here, point its DNS (A/CNAME record) at the server this app is hosted on. Adding it to this pool only makes it selectable in the offer/refer link generator — it does not configure DNS or hosting for you. Once DNS is pointed correctly, the app will automatically serve pages and API calls on that domain (no extra setup needed).
        </p>
      </AdminCard>

      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        {!domains ? (
          <Loader style={{ padding: 32 }} />
        ) : domains.length === 0 ? (
          <div style={{ padding: 24, fontSize: 13, color: "var(--lg-ink-faint)" }}>No domains in the pool yet.</div>
        ) : (
          <AdminTable columns={["#", "Domain", "Label", "Default", "Active", "Action"]}>
            {domains.map((row, i) => (
              <tr key={row.id} style={{ borderTop: "1px solid var(--lg-line)" }}>
                <td style={{ padding: "10px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{i + 1}</td>
                <td style={{ padding: "10px 16px", fontFamily: "monospace", fontWeight: 700, color: "var(--lg-ink)" }}>{row.domain}</td>
                <td style={{ padding: "10px 16px" }}>{row.label || "-"}</td>
                <td style={{ padding: "10px 16px" }}>
                  {row.is_default ? (
                    <span style={{ color: "var(--lg-success)", fontWeight: 700, fontSize: 12 }}>Default</span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(row.id)}
                      disabled={!row.is_active}
                      style={{ color: "var(--lg-violet)", fontWeight: 600, fontSize: 12, background: "none", border: "none", cursor: row.is_active ? "pointer" : "not-allowed", opacity: row.is_active ? 1 : 0.5 }}
                    >
                      Make default
                    </button>
                  )}
                </td>
                <td style={{ padding: "10px 16px" }}>
                  <button
                    onClick={() => handleToggleActive(row)}
                    style={{ color: row.is_active ? "var(--lg-success)" : "var(--lg-ink-faint)", fontWeight: 700, fontSize: 12, background: "none", border: "none", cursor: "pointer" }}
                  >
                    {row.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td style={{ padding: "10px 16px" }}>
                  <button
                    onClick={() => handleDelete(row.id)}
                    style={{ color: "var(--lg-error)", background: "var(--lg-error-soft)", fontWeight: 700, fontSize: 12, border: "none", borderRadius: "var(--lg-radius-pill)", padding: "6px 14px", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminCard>
    </div>
  );
}
