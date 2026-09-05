"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, AdminTable, StatusBadge, PrimaryButton, TextInput } from "@/components/AdminPage";
import Loader from "@/components/Loader";

const EMPLOYEE_STATUS = "9";

const emptyForm = { name: "", email: "", mobile: "", password: "" };

export default function ManagersPage() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null);
  const [creating, setCreating] = useState(false);

  function load() {
    api.get(`/api/admin/users?status=${EMPLOYEE_STATUS}&limit=100`).then(setData).catch(() => setData(null));
  }

  useEffect(() => {
    load();
  }, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await api.post("/api/admin/users", { ...form, status: EMPLOYEE_STATUS });
      if (res.success) {
        setMessage({ type: "success", text: `Manager account created (ID: ${res.userId}).` });
        setForm(emptyForm);
        load();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this manager account? This cannot be undone.")) return;
    try {
      const res = await api.del(`/api/admin/users/${id}`);
      if (res.success) {
        load();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <AdminPageHeader title="Managers" subtitle="Manager (EMP portal) accounts" />

      {message && (
        <div style={{ padding: 12, borderRadius: "var(--lg-radius-sm)", marginBottom: 16, background: message.type === "error" ? "var(--lg-error-soft)" : "var(--lg-success-soft)", color: message.type === "error" ? "var(--lg-error)" : "var(--lg-success)", fontSize: 13, fontWeight: 600 }}>
          {message.text}
        </div>
      )}

      <AdminCard style={{ padding: 20, marginBottom: 20, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, fontFamily: "var(--lg-font-display)" }}>Add Manager</h3>
        <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }} noValidate>
          <TextInput placeholder="Name" value={form.name} onChange={(e) => set("name", e.target.value)} required style={{ borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} />
          <TextInput type="email" placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} required style={{ borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} />
          <TextInput type="tel" placeholder="Mobile" pattern="[0-9]{10}" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} required style={{ borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} />
          <TextInput type="password" placeholder="Password" value={form.password} onChange={(e) => set("password", e.target.value)} required style={{ borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} />
          <PrimaryButton type="submit" disabled={creating} style={{ gridColumn: "1 / -1", justifySelf: "start" }}>
            {creating ? "Creating…" : "Create Manager"}
          </PrimaryButton>
        </form>
      </AdminCard>

      <AdminCard style={{ borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        {!data ? (
          <Loader style={{ padding: 32 }} />
        ) : data.users.length === 0 ? (
          <div style={{ padding: 24, fontSize: 13, color: "var(--lg-ink-faint)" }}>No managers yet.</div>
        ) : (
          <AdminTable columns={["#", "ID", "Name", "Email", "Mobile", "Status", "Action"]}>
            {data.users.map((u, i) => (
              <tr key={u.id} style={{ borderTop: "1px solid var(--lg-line-soft)" }}>
                <td style={{ padding: "10px 16px", color: "var(--lg-ink-faint)", fontSize: 12.5, fontWeight: 600 }}>{i + 1}</td>
                <td style={{ padding: "10px 16px", fontVariantNumeric: "tabular-nums" }}>{u.user_id}</td>
                <td style={{ padding: "10px 16px", fontWeight: 700, color: "var(--lg-ink)" }}>{u.name}</td>
                <td style={{ padding: "10px 16px" }}>{u.email}</td>
                <td style={{ padding: "10px 16px" }}>{u.mobile}</td>
                <td style={{ padding: "10px 16px" }}><StatusBadge status={u.status === EMPLOYEE_STATUS ? "Active" : "Inactive"} /></td>
                <td style={{ padding: "10px 16px", display: "flex", gap: 14, alignItems: "center" }}>
                  <a href={`/admin/edit-user?id=${u.id}`} style={{ color: "var(--lg-violet)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>Edit</a>
                  <button onClick={() => handleDelete(u.id)} style={{ color: "var(--lg-error)", background: "none", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", padding: 0 }}>Delete</button>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminCard>
    </div>
  );
}
