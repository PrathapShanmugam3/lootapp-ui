"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { api } from "@/lib/apiClient";
import ThemeToggle from "@/components/ThemeToggle";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  function getRecaptchaToken() {
    if (typeof window === "undefined" || !window.grecaptcha) return "";
    try {
      return window.grecaptcha.getResponse();
    } catch {
      return "";
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setNotification(null);
    const form = new FormData(e.target);
    try {
      const res = await api.post("/api/auth/login", {
        mobile: form.get("mobile"),
        password: form.get("password"),
        recaptchaToken: getRecaptchaToken(),
      });
      router.push(res.redirectTo || "/home");
    } catch (err) {
      setNotification({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setNotification(null);
    const form = new FormData(e.target);
    const password = form.get("password");
    const confirmPassword = form.get("confirm_password");

    if (!terms) {
      setNotification({ type: "error", text: "Please accept the terms and conditions!" });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setNotification({ type: "error", text: "Passwords do not match!" });
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/signup", {
        name: form.get("name"),
        mobile: form.get("mobile"),
        email: form.get("email"),
        password,
        recaptchaToken: getRecaptchaToken(),
      });
      setNotification({ type: "success", text: res.message });
      setActiveTab("login");
    } catch (err) {
      setNotification({ type: "error", text: err.message });
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
          <div className="auth-hero-badge">⚡ India&apos;s Premium Affiliate Platform</div>
          <h1 className="auth-hero-title">
            Monetize Traffic. <br />
            <span>Maximize Earnings.</span>
          </h1>
          <p className="auth-hero-desc">
            Connect directly with top advertiser campaigns, track real-time conversions, and get automated payouts directly to your account.
          </p>

          <div className="auth-hero-stats">
            <div className="auth-stat-card">
              <div className="auth-stat-value">12,400+</div>
              <div className="auth-stat-label">Live Campaigns</div>
            </div>
            <div className="auth-stat-card">
              <div className="auth-stat-value">₹4.8 Cr+</div>
              <div className="auth-stat-label">Total Payouts</div>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          © {new Date().getFullYear()} Loot Hat. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-tabs">
            <button 
              type="button" 
              className={`auth-tab-btn ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className={`auth-tab-btn ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => setActiveTab("signup")}
            >
              Create Account
            </button>
          </div>

          {activeTab === "login" ? (
            <div>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Welcome back 👋</h2>
                <p className="auth-form-subtitle">Enter your details to sign in to your dashboard</p>
              </div>

              <form onSubmit={handleLogin}>
                <div className="auth-field">
                  <label className="auth-label">Mobile Number</label>
                  <div className="auth-input-group">
                    <input 
                      type="tel" 
                      name="mobile" 
                      className="auth-input" 
                      placeholder="Enter mobile number" 
                      required 
                    />
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </span>
                  </div>
                </div>

                <div className="auth-field">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label className="auth-label" style={{ margin: 0 }}>Password</label>
                    <a href="/forget-pass" style={{ fontSize: 12, fontWeight: 700, color: "var(--violet)", textDecoration: "none" }}>Forgot?</a>
                  </div>
                  <div className="auth-input-group">
                    <input 
                      type={showLoginPass ? "text" : "password"} 
                      name="password" 
                      className="auth-input" 
                      placeholder="Enter password" 
                      required 
                    />
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <button type="button" className="auth-eye-btn" onClick={() => setShowLoginPass(!showLoginPass)}>
                      {showLoginPass ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {siteKey && <div className="g-recaptcha" data-sitekey={siteKey} style={{ marginTop: 20, marginBottom: 20 }} />}

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In to Dashboard"}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Join Loot Hat 🚀</h2>
                <p className="auth-form-subtitle">Create your account and start earning today</p>
              </div>

              <form onSubmit={handleSignup}>
                <div className="auth-field">
                  <label className="auth-label">Full Name</label>
                  <div className="auth-input-group">
                    <input type="text" name="name" className="auth-input" placeholder="Enter your full name" required />
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </span>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Mobile Number</label>
                  <div className="auth-input-group">
                    <input type="tel" name="mobile" className="auth-input" placeholder="Enter mobile number" required />
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </span>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-group">
                    <input type="email" name="email" className="auth-input" placeholder="Enter email address" required />
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </span>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className="auth-input-group">
                    <input type={showSignupPass ? "text" : "password"} name="password" className="auth-input" placeholder="Create password" required />
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <div className="auth-input-group">
                    <input type={showSignupConfirm ? "text" : "password"} name="confirm_password" className="auth-input" placeholder="Confirm password" required />
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer" }} onClick={() => setTerms(!terms)}>
                  <input type="checkbox" checked={terms} onChange={() => {}} style={{ width: 18, height: 18, accentColor: "var(--violet)" }} />
                  <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>I agree to the <a href="#" style={{ color: "var(--violet)", fontWeight: 700 }}>Terms &amp; Conditions</a></span>
                </div>

                {siteKey && <div className="g-recaptcha" data-sitekey={siteKey} style={{ marginTop: 20, marginBottom: 20 }} />}

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
