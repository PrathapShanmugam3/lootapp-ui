"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { api } from "@/lib/apiClient";
import ThemeToggle from "@/components/ThemeToggle";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [activePage, setActivePage] = useState("login");
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
    } catch (err) {
      setNotification({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://www.google.com/recaptcha/api.js" async defer />

      <ThemeToggle style={{ position: "fixed", top: 20, right: 20, zIndex: 10000 }} />

      {notification && (
        <div className={`notification ${notification.type} show`}>
          <span className="message">{notification.text}</span>
          <button className="close-btn" onClick={() => setNotification(null)}>
            ×
          </button>
        </div>
      )}

      <div id="login-page" className={`page ${activePage === "login" ? "active" : ""}`}>
        <div className="left-panel">
          <div className="blob-1" />
          <div className="blob-2" />
          <div className="logo">
            <div className="logo-box">
              <span>
                LOOT
                <br />
                HAT
              </span>
            </div>
            <span className="logo-name">Loot Hat</span>
          </div>
          <div className="hero">
            <h1>
              Earn More.
              <br />
              Promote Smarter.
            </h1>
            <p>Join India&apos;s fastest-growing affiliate platform and turn your traffic into real earnings.</p>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-value">12,400+</div>
                <div className="stat-label">Active Campaigns</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">₹</div>
                <div className="stat-value">₹4.8 Cr</div>
                <div className="stat-label">Paid Out</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value">85,000+</div>
                <div className="stat-label">Affiliates</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-value">&lt; 24 hrs</div>
                <div className="stat-label">Avg. Payout</div>
              </div>
            </div>
          </div>
          <div className="left-footer">© {new Date().getFullYear()} Loot Hat. All rights reserved.</div>
        </div>

        <div className="right-panel">
          <div className="form-wrapper">
            <div className="mobile-logo">
              <div className="mobile-logo-box">
                <span>
                  LOOT
                  <br />
                  HAT
                </span>
              </div>
              <span className="mobile-logo-name">Loot Hat</span>
            </div>
            <h2 className="form-title">Welcome back 👋</h2>
            <p className="form-subtitle">Sign in to your Loot Hat account</p>

            <form onSubmit={handleLogin}>
              <div className="field-group">
                <label>Mobile Number</label>
                <div className="input-wrap">
                  <input type="tel" name="mobile" placeholder="Enter mobile number" autoComplete="tel" required />
                </div>
              </div>

              <div className="field-group">
                <div className="field-header">
                  <label>Password</label>
                  <a href="/forget-pass" className="forgot-btn">
                    Forgot password?
                  </a>
                </div>
                <div className="input-wrap">
                  <input
                    type={showLoginPass ? "text" : "password"}
                    name="password"
                    className="with-eye"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowLoginPass((v) => !v)}>
                    {showLoginPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="check-row" onClick={() => setRememberMe((v) => !v)}>
                <div className={`chk ${rememberMe ? "on" : ""}`}>
                  <svg width="11" height="11" fill="none" viewBox="0 0 11 11">
                    <path d="M1.5 5.5l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="check-label">Remember me for 30 days</span>
              </div>

              {siteKey && <div className="g-recaptcha" data-sitekey={siteKey} />}

              <button type="submit" className={`primary-btn ${loading ? "loading" : ""}`} disabled={loading}>
                {loading ? "Processing..." : "Login"}
              </button>

              <div className="text-link-row">
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => setActivePage("signup")}>
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="signup-page" className={`page ${activePage === "signup" ? "active" : ""}`}>
        <div className="left-panel">
          <div className="blob-1" />
          <div className="blob-2" />
          <div className="logo">
            <div className="logo-box">
              <span>
                LOOT
                <br />
                HAT
              </span>
            </div>
            <span className="logo-name">Loot Hat</span>
          </div>
          <div className="hero">
            <h1>
              Start Earning
              <br />
              in Minutes 🚀
            </h1>
            <p>Create your free account and access thousands of campaigns across top brands.</p>
          </div>
          <div className="left-footer">© {new Date().getFullYear()} Loot Hat. All rights reserved.</div>
        </div>

        <div className="right-panel">
          <div className="form-wrapper">
            <h2 className="form-title">Create account</h2>
            <p className="form-subtitle">Join 85,000+ affiliates and start earning today</p>

            <form onSubmit={handleSignup}>
              <div className="field-group">
                <label>Full Name</label>
                <div className="input-wrap">
                  <input type="text" name="name" placeholder="Enter your full name" autoComplete="name" required />
                </div>
              </div>

              <div className="field-group">
                <label>Mobile Number</label>
                <div className="input-wrap">
                  <input type="tel" name="mobile" placeholder="Enter mobile number" autoComplete="tel" required />
                </div>
              </div>

              <div className="field-group">
                <label>Email Address</label>
                <div className="input-wrap">
                  <input type="email" name="email" placeholder="Enter email address" autoComplete="email" required />
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Password</label>
                  <div className="input-wrap">
                    <input
                      type={showSignupPass ? "text" : "password"}
                      name="password"
                      className="with-eye"
                      placeholder="Create password"
                      autoComplete="new-password"
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowSignupPass((v) => !v)}>
                      {showSignupPass ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div className="field-group">
                  <label>Confirm</label>
                  <div className="input-wrap">
                    <input
                      type={showSignupConfirm ? "text" : "password"}
                      name="confirm_password"
                      className="with-eye"
                      placeholder="Confirm"
                      autoComplete="new-password"
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowSignupConfirm((v) => !v)}>
                      {showSignupConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              {siteKey && <div className="g-recaptcha" data-sitekey={siteKey} />}

              <div className="check-row" onClick={() => setTerms((v) => !v)}>
                <div className={`chk ${terms ? "on" : ""}`}>
                  <svg width="11" height="11" fill="none" viewBox="0 0 11 11">
                    <path d="M1.5 5.5l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="check-label">
                  I agree to the{" "}
                  <a href="https://loothat.com/terms-and-conditions.php" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                    Terms &amp; Conditions
                  </a>
                </span>
              </div>

              <button type="submit" className={`primary-btn ${loading ? "loading" : ""}`} disabled={loading}>
                {loading ? "Processing..." : "Create Account"}
              </button>

              <div className="text-link-row">
                Already have an account?{" "}
                <button type="button" onClick={() => setActivePage("login")}>
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
