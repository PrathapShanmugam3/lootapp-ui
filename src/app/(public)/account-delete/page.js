"use client";

import { useState } from "react";
import Script from "next/script";
import { api } from "@/lib/apiClient";
import ThemeToggle from "@/components/ThemeToggle";
import { useFormValidation, FieldError } from "@/components/FormValidation";
import "../login/login.css";

export default function AccountDeletePage() {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const validation = useFormValidation();

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  function getRecaptchaToken() {
    if (typeof window === "undefined" || !window.grecaptcha) return "";
    try {
      return window.grecaptcha.getResponse();
    } catch {
      return "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setNotification(null);
    const form = new FormData(e.target);
    const email = form.get("email");
    const reason = form.get("reason");

    try {
      await api.post("/api/public/account-delete", {
        email,
        reason,
        recaptchaToken: getRecaptchaToken(),
      });
      setSubmitted(true);
    } catch (err) {
      setNotification({ type: "error", text: err.message });
      if (window.grecaptcha) window.grecaptcha.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <Script src="https://www.google.com/recaptcha/api.js" async defer />
      <ThemeToggle style={{ position: "fixed", top: 24, right: 24, zIndex: 100 }} />

      {notification && (
        <div className={`notification ${notification.type} show`}>
          <span className="message">{notification.text}</span>
          <button className="close-btn" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Left Hero Panel */}
      <div className="auth-hero-panel">
        <div className="auth-hero-mesh" />
        <div className="auth-brand">
          <div className="auth-brand-logo">L</div>
          <span className="auth-brand-name">Loot Hat</span>
        </div>

        <div className="auth-hero-content">
          <div className="auth-hero-badge">⚠️ Account Management</div>
          <h1 className="auth-hero-title">
            Delete your <br />
            <span>account</span>
          </h1>
          <p className="auth-hero-desc">
            Submitting this request starts the process to permanently remove your account and all associated data.
          </p>

          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Irreversible</div>
              <div style={{ color: "#c4b5fd", fontSize: 13, marginTop: 2, lineHeight: 1.4 }}>Once deleted, your data cannot be recovered.</div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Need help?</div>
              <div style={{ color: "#c4b5fd", fontSize: 13, marginTop: 2, lineHeight: 1.4 }}>Contact support@loothat.com anytime.</div>
            </div>
          </div>
        </div>
        <div className="auth-hero-footer">© {new Date().getFullYear()} Loot Hat. All rights reserved.</div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          {submitted ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "16px 0", gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--paper-sunken)", display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e" }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="auth-form-title" style={{ fontSize: 22 }}>Request submitted</h2>
              <p className="auth-form-subtitle" style={{ maxWidth: 300 }}>
                Your deletion request has been submitted. Our team will review it shortly.
              </p>
            </div>
          ) : (
            <div>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Delete account 🗑️</h2>
                <p className="auth-form-subtitle">Enter your registered email and tell us why you'd like to leave.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="auth-field">
                  <label className="auth-label">Registered Email Address</label>
                  <div className="auth-input-group">
                    <input
                      type="email"
                      name="email"
                      className="auth-input"
                      placeholder="Enter your email address"
                      required
                      {...validation.fieldProps("email")}
                    />
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </span>
                  </div>
                  <FieldError message={validation.errors.email} />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Reason for Deletion</label>
                  <div className="auth-input-group">
                    <textarea
                      name="reason"
                      className="auth-input"
                      placeholder="Please tell us why you want to delete your account."
                      required
                      maxLength={500}
                      rows={4}
                      style={{ resize: "vertical", paddingTop: 12, paddingBottom: 12 }}
                      {...validation.fieldProps("reason")}
                    />
                  </div>
                  <FieldError message={validation.errors.reason} />
                </div>

                {siteKey && <div className="g-recaptcha" data-sitekey={siteKey} style={{ marginTop: 20, marginBottom: 20 }} />}

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
