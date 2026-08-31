"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { api } from "@/lib/apiClient";
import ThemeToggle from "@/components/ThemeToggle";
import { useFormValidation, FieldError } from "@/components/FormValidation";
import "../login/login.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [successEmail, setSuccessEmail] = useState("");
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

  async function handleForgot(e) {
    e.preventDefault();
    setLoading(true);
    setNotification(null);
    const form = new FormData(e.target);
    const email = form.get("email");

    try {
      const res = await api.post("/api/auth/forgot-password", {
        email,
        recaptchaToken: getRecaptchaToken(),
      });
      setSuccessEmail(email);
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
          <div className="auth-hero-badge">🔒 Secure Recovery</div>
          <h1 className="auth-hero-title">
            Forgot your <br />
            <span>password?</span>
          </h1>
          <p className="auth-hero-desc">
            No worries. We'll send a secure reset link to your registered email address instantly.
          </p>

          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.5px", flexShrink: 0 }}>01</div>
              <div>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Enter Email</div>
                <div style={{ color: "#c4b5fd", fontSize: 13, marginTop: 2, lineHeight: 1.4 }}>Provide your registered email address</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.5px", flexShrink: 0 }}>02</div>
              <div>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Check Inbox</div>
                <div style={{ color: "#c4b5fd", fontSize: 13, marginTop: 2, lineHeight: 1.4 }}>We'll send a secure reset link instantly</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.5px", flexShrink: 0 }}>03</div>
              <div>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Reset &amp; Login</div>
                <div style={{ color: "#c4b5fd", fontSize: 13, marginTop: 2, lineHeight: 1.4 }}>Set a new password and get back in</div>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-hero-footer">© {new Date().getFullYear()} Loot Hat. All rights reserved.</div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          
          {successEmail ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "16px 0", gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--paper-sunken)", display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e" }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 className="auth-form-title" style={{ fontSize: 22 }}>Check your inbox</h2>
              <p className="auth-form-subtitle" style={{ maxWidth: 300 }}>
                We've sent a password reset link to <strong style={{ color: "var(--ink)" }}>{successEmail}</strong>. Please check your inbox and spam folder.
              </p>
              <button type="button" onClick={() => router.push("/login")} className="auth-btn-primary" style={{ marginTop: 20 }}>
                Back to Login
              </button>
            </div>
          ) : (
            <div>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Reset password 🔐</h2>
                <p className="auth-form-subtitle">Enter the email linked to your account and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleForgot} noValidate>
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-group">
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="Enter your email address"
                      required
                      {...validation.fieldProps("email")}
                    />
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </span>
                  </div>
                  <FieldError message={validation.errors.email} />
                </div>

                {siteKey && <div className="g-recaptcha" data-sitekey={siteKey} style={{ marginTop: 20, marginBottom: 20 }} />}

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <a href="/login" style={{ fontSize: 14, fontWeight: 600, color: "var(--violet)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Login
                  </a>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
