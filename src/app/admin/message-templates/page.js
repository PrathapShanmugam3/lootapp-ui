"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { AdminPageHeader, AdminCard, PrimaryButton, TextInput } from "@/components/AdminPage";
import Loader from "@/components/Loader";
import { showError } from "@/lib/toast";

const ROLE_LABELS = { admin: "Admin Chat", emp: "Manager Chat" };
const emptyForm = { role: "admin", label: "", text: "" };

export default function MessageTemplatesPage() {
  const [templates, setTemplates] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    api.get("/api/admin/message-templates").then((res) => setTemplates(res.templates)).catch(() => setTemplates([]));
  }

  useEffect(() => {
    load();
  }, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(t) {
    setEditingId(t.id);
    setForm({ role: t.role, label: t.label, text: t.text });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = editingId
        ? await api.put(`/api/admin/message-templates/${editingId}`, { label: form.label, text: form.text })
        : await api.post("/api/admin/message-templates", form);
      if (res.success) {
        cancelEdit();
        load();
      } else {
        showError(res.message);
      }
    } catch (err) {
      showError(err.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this template?")) return;
    await api.del(`/api/admin/message-templates/${id}`);
    if (editingId === id) cancelEdit();
    load();
  }

  const grouped = templates
    ? { admin: templates.filter((t) => t.role === "admin"), emp: templates.filter((t) => t.role === "emp") }
    : null;

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <AdminPageHeader title="Message Templates" subtitle="Preset replies available in Admin Chat and Manager Chat" />

      <AdminCard style={{ padding: 20, marginBottom: 20, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, fontFamily: "var(--lg-font-display)" }}>{editingId ? "Edit Template" : "Add Template"}</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              disabled={Boolean(editingId)}
              style={{ padding: "11px 14px", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent", fontSize: 13.5, cursor: editingId ? "not-allowed" : "pointer" }}
            >
              <option value="admin">Admin Chat</option>
              <option value="emp">Manager Chat</option>
            </select>
            <TextInput placeholder="Label" value={form.label} onChange={(e) => set("label", e.target.value)} required style={{ flex: 1, minWidth: 200, borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent" }} />
          </div>
          <textarea
            value={form.text}
            onChange={(e) => set("text", e.target.value)}
            rows={3}
            placeholder="Message text"
            required
            style={{ width: "100%", borderRadius: "var(--lg-radius-sm)", background: "var(--lg-paper-sunken)", border: "1.5px solid transparent", padding: "11px 14px", fontFamily: "var(--lg-font-body)", fontSize: 13.5, color: "var(--lg-ink)", outline: "none", resize: "vertical", marginBottom: 14 }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Update Template" : "Add Template"}</PrimaryButton>
            {editingId && (
              <button type="button" onClick={cancelEdit} style={{ background: "var(--lg-paper-raised)", border: "1.5px solid var(--lg-line)", color: "var(--lg-ink-soft)", borderRadius: "var(--lg-radius-pill)", padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </AdminCard>

      {!grouped ? (
        <Loader style={{ padding: 32 }} />
      ) : (
        ["admin", "emp"].map((role) => (
          <AdminCard key={role} style={{ padding: 20, marginBottom: 20, borderRadius: "var(--lg-radius)", boxShadow: "var(--lg-shadow-sm)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, fontFamily: "var(--lg-font-display)" }}>{ROLE_LABELS[role]}</h3>
            {grouped[role].length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--lg-ink-faint)" }}>No templates yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {grouped[role].map((t) => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: "var(--lg-paper-sunken)", borderRadius: "var(--lg-radius-sm)" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--lg-ink)" }}>{t.label}</div>
                      <div style={{ fontSize: 12.5, color: "var(--lg-ink-soft)", marginTop: 2 }}>{t.text}</div>
                    </div>
                    <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                      <button onClick={() => startEdit(t)} style={{ color: "var(--lg-violet)", background: "none", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", padding: 0 }}>Edit</button>
                      <button onClick={() => handleDelete(t.id)} style={{ color: "var(--lg-error)", background: "none", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", padding: 0 }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        ))
      )}
    </div>
  );
}
