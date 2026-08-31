"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import Loader from "@/components/Loader";
import { useFormValidation, FieldError } from "@/components/FormValidation";

export default function CustomDomainsPage() {
  const [domains, setDomains] = useState(null);
  const [domain, setDomain] = useState("");
  const [message, setMessage] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const validation = useFormValidation();

  function load() {
    api.get("/api/custom-domains").then((res) => setDomains(res.domains)).catch(() => setDomains([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setInstructions(null);
    try {
      const res = await api.post("/api/custom-domains", { domain });
      if (res.success) {
        setInstructions(res);
        setDomain("");
        load();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(id) {
    const res = await api.post(`/api/custom-domains/${id}/verify`);
    setMessage(res.success ? { type: "success", text: res.alreadyVerified ? "Already verified." : "Domain verified!" } : { type: "error", text: res.message });
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this domain?")) return;
    await api.del(`/api/custom-domains/${id}`);
    load();
  }

  return (
    <main className="flex-1 px-8 py-6 max-w-3xl mx-auto w-full space-y-5">
      <div>
        <h1 className="text-[1.35rem] font-extrabold" style={{ color: "var(--lg-ink)", letterSpacing: "-0.02em" }}>Custom Domains</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--lg-ink-soft)" }}>Serve your tracking links under your own domain</p>
      </div>

      {message && (
        <div style={{ padding: 12, borderRadius: "var(--lg-radius-sm)", background: message.type === "error" ? "var(--lg-error-soft)" : "var(--lg-success-soft)", color: message.type === "error" ? "var(--lg-error)" : "var(--lg-success)", fontSize: 13 }}>
          {message.text}
        </div>
      )}
      {instructions && (
        <div style={{ padding: 16, borderRadius: "var(--lg-radius)", background: "var(--lg-violet-soft)", border: "1px solid var(--lg-line)", fontSize: 13 }}>
          <p style={{ fontWeight: 700, marginBottom: 6, color: "var(--lg-ink)" }}>Add this DNS TXT record to verify {instructions.domain}:</p>
          <code style={{ display: "block", background: "var(--lg-paper-raised)", padding: "8px 12px", borderRadius: "var(--lg-radius-sm)", wordBreak: "break-all", color: "var(--lg-ink)" }}>{instructions.verificationToken}</code>
          <p style={{ marginTop: 8, color: "var(--lg-ink-soft)" }}>Host: <code>{instructions.domain}</code> or <code>_loothat.{instructions.domain}</code></p>
        </div>
      )}

      <div className="lh-card" style={{ padding: 20 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }} noValidate>
          <div className="lh-input-wrap lh-icon-globe" style={{ flex: 1, minWidth: 200 }}>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="yourdomain.com"
              pattern="^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})+$"
              title="Enter a valid domain name (e.g. example.com)"
              style={{ fontSize: 13 }}
              required
              {...validation.fieldProps("domain")}
            />
            <FieldError message={validation.errors.domain} />
          </div>
          <button type="submit" disabled={submitting} style={{ background: "linear-gradient(135deg,var(--lg-violet),var(--lg-violet-deep))", color: "#fff", border: "none", borderRadius: "var(--lg-radius-pill)", padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", height: "fit-content" }}>
            {submitting ? "Adding…" : "Add Domain"}
          </button>
        </form>
      </div>

      <div className="lh-card" style={{ padding: 0, overflow: "hidden" }}>
        {!domains ? (
          <Loader style={{ padding: 24, fontSize: 13, color: "var(--lg-ink-faint)" }} />
        ) : domains.length === 0 ? (
          <div style={{ padding: 24, fontSize: 13, color: "var(--lg-ink-faint)" }}>No custom domains yet.</div>
        ) : (
          domains.map((d) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px dashed var(--lg-line-soft)" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--lg-ink)" }}>{d.domain}</p>
                <p style={{ fontSize: 12, color: d.verified ? "var(--lg-success)" : "var(--lg-warning)" }}>{d.verified ? "Verified" : "Pending verification"}</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {!d.verified && <button onClick={() => handleVerify(d.id)} style={{ color: "var(--lg-violet)", fontWeight: 600, fontSize: 12, background: "none", border: "none", cursor: "pointer" }}>Check DNS</button>}
                <button onClick={() => handleDelete(d.id)} style={{ color: "var(--lg-error)", fontWeight: 600, fontSize: 12, background: "none", border: "none", cursor: "pointer" }}>Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
