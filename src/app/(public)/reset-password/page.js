"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import ThemeToggle from "@/components/ThemeToggle";
import { useFormValidation, FieldError } from "@/components/FormValidation";
import "../login/login.css";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const validation = useFormValidation();

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);
    setNotification(null);
    const form = new FormData(e.target);
    const password = form.get("password");
    const confirmPassword = form.get("confirm_password");

    if (!token) {
      setNotification({ type: "error", text: "Invalid or missing reset token." });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setNotification({ type: "error", text: "Passwords do not match." });
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/reset-password", {
        token,
        newPassword: password,
      });
      setSuccess(true);
    } catch (err) {
      setNotification({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
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
            Set your new <br />
            <span>password</span>
          </h1>
          <p className="auth-hero-desc">
            Choose a strong password to secure your account.
          </p>
        </div>
        <div className="auth-hero-footer">© {new Date().getFullYear()} Loot Hat. All rights reserved.</div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          
          {success ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "16px 0", gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--paper-sunken)", display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e" }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 className="auth-form-title" style={{ fontSize: 22 }}>Password Reset Successful</h2>
              <p className="auth-form-subtitle" style={{ maxWidth: 300 }}>
                Your password has been securely updated. You can now log in with your new password.
              </p>
              <button type="button" onClick={() => router.push("/login")} className="auth-btn-primary" style={{ marginTop: 20 }}>
                Go to Login
              </button>
            </div>
          ) : (
            <div>
              <div className="auth-form-header">
                <h2 className="auth-form-title">New Password 🔐</h2>
                <p className="auth-form-subtitle">Please enter your new password below.</p>
              </div>

              <form onSubmit={handleReset} noValidate>
                <div className="auth-field">
                  <label className="auth-label">New Password</label>
                  <div className="auth-input-group">
                    <input
                      type={showPass ? "text" : "password"}
                      className="auth-input"
                      placeholder="Enter new password"
                      minLength={6}
                      required
                      {...validation.fieldProps("password")}
                    />
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)}>
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                  <FieldError message={validation.errors.password} />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Confirm New Password</label>
                  <div className="auth-input-group">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="auth-input"
                      placeholder="Confirm new password"
                      minLength={6}
                      required
                      {...validation.fieldProps("confirm_password")}
                    />
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                  <FieldError message={validation.errors.confirm_password} />
                </div>

                <button type="submit" className="auth-btn-primary" disabled={loading} style={{ marginTop: 20 }}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif" }}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
