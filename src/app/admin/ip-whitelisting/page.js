"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, PrimaryButton, TextInput } from "@/components/AdminPage";
import Loader from "@/components/Loader";
import { showSuccess, showError } from "@/lib/toast";

export default function IpWhitelistingPage() {
  const [ips, setIps] = useState(null);
  const [ip, setIp] = useState("");
  const [ipLabel, setIpLabel] = useState("");

  function load() {
    api.get("/api/admin/ip-whitelist").then((res) => setIps(res.ips)).catch(() => setIps([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/api/admin/ip-whitelist", { ip, label: ipLabel });
      showSuccess("IP added to whitelist.");
      setIp("");
      setIpLabel("");
      load();
    } catch (err) {
      showError(err.data?.message || err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this IP from the whitelist?")) return;
    await api.del(`/api/admin/ip-whitelist/${id}`);
    load();
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
      <AdminPageHeader title="IP Whitelisting" subtitle="IPs allowed to call the postback/conversion API" />

      <AdminCard style={{ padding: 20, marginBottom: 20, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }} noValidate>
          <TextInput
            placeholder="IP address"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            required
            pattern="^(([0-9]{1,3}\.){3}[0-9]{1,3}|[0-9a-fA-F:]+)$"
            title="Enter a valid IPv4 or IPv6 address"
            style={{ flex: 1, borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }}
          />
          <TextInput placeholder="Label" value={ipLabel} onChange={(e) => setIpLabel(e.target.value)} style={{ flex: 1, borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} />
          <PrimaryButton type="submit">Add IP</PrimaryButton>
        </form>
      </AdminCard>

      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        {!ips ? (
          <Loader style={{ padding: 32 }} />
        ) : (
          <AdminTable columns={["#", "ID", "IP", "Label", "Action"]}>
            {ips.map((row, i) => (
              <tr key={row.id} style={{ borderTop: "1px solid var(--lg-line)", transition: "background-color 140ms ease" }}>
                <td style={{ padding: "10px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{i + 1}</td>
                <td style={{ padding: "10px 16px", fontVariantNumeric: "tabular-nums" }}>{row.id}</td>
                <td style={{ padding: "10px 16px", fontFamily: "monospace", fontWeight: 700, color: "var(--lg-ink)" }}>{row.ip}</td>
                <td style={{ padding: "10px 16px" }}>{row.label}</td>
                <td style={{ padding: "10px 16px" }}>
                  <button
                    onClick={() => handleDelete(row.id)}
                    style={{
                      color: "var(--lg-error)",
                      background: "var(--lg-error-soft)",
                      fontWeight: 700,
                      fontSize: 12,
                      border: "none",
                      borderRadius: "var(--lg-radius-pill)",
                      padding: "6px 14px",
                      cursor: "pointer",
                      transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
                    }}
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
