"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import ThemeToggle from "@/components/ThemeToggle";

const ICONS = {
  home: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  offer: "M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z M7 7h.01",
  report: "M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3",
  time: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
  message: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z",
  cog: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z",
  menu: "M3 6h18 M3 12h18 M3 18h18",
  close: "M18 6 6 18 M6 6l12 12",
  chevron: "m6 9 6 6 6-6",
  logout: "m16 17 5-5-5-5 M21 12H9 M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
  wallet: "M21 12V7H5a2 2 0 0 1 0-4h14v4",
};

function Icon({ path, size = 18 }) {
  if (!path) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {path.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : `M${seg}`} />
      ))}
    </svg>
  );
}

export default function SharedShell({ children, navGroups, basePath = "/home", role = "User" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileNavOpen]);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  async function confirmLogout() {
    await api.post("/api/auth/logout");
    router.replace("/login");
  }

  // Find active page title
  let pageTitle = "Dashboard";
  if (pathname.startsWith("/offer-detail")) {
    pageTitle = "Offer Details";
  } else {
    navGroups.forEach(g => {
      if (g.type === "link" && pathname === g.href) pageTitle = g.label;
      if (g.type === "group") {
        g.items.forEach(i => {
          if (pathname === i.href) pageTitle = i.label;
        });
      }
    });
  }

  return (
    <div className={`loot-hat-admin-root ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="loot-hat-admin">
        {/* Brand logo — fixed top-left */}
        <Link href={basePath} className="lh-header-brand" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, var(--lg-violet), var(--lg-pink))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
            L
          </div>
          <span className="lh-header-brand-name" style={{ fontFamily: "var(--lg-font-display)", fontWeight: 800, fontSize: "1.05rem", background: "linear-gradient(135deg, var(--lg-violet), var(--lg-pink))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em" }}>
            Loot Hat
          </span>
        </Link>

        {/* Header bar */}
        <header className="header">
          <div className="header__container">
            {/* Mobile hamburger — visible only on mobile */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileNavOpen(v => !v)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileNavOpen}
            >
              <Icon path={mobileNavOpen ? ICONS.close : ICONS.menu} />
            </button>

            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, fontFamily: "var(--lg-font-display)", color: "var(--lg-ink)", letterSpacing: "-0.01em" }}>
              {pageTitle}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <ThemeToggle style={{ background: "var(--lg-paper-sunken)", border: "1px solid var(--lg-line)", color: "var(--lg-ink)", borderRadius: "var(--lg-radius-sm)" }} />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "4px 12px 4px 4px",
                  borderRadius: "var(--lg-radius-pill)",
                  background: "var(--lg-paper-sunken)",
                  border: "1px solid var(--lg-line)"
                }}
              >
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--lg-violet), var(--lg-pink))",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 12,
                  boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)"
                }}>
                  {role.charAt(0).toUpperCase()}
                </div>
                <span className="role-label-text" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--lg-ink-soft)" }}>{role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile overlay backdrop */}
        {mobileNavOpen && (
          <div className="nav-overlay" onClick={closeMobileNav} />
        )}

        {/* Sidebar nav */}
        <div className={`nav ${mobileNavOpen ? "show" : ""}`}>
          <nav className="nav__container">
            <div>
              {/* Desktop collapse toggle — inside sidebar, hidden on mobile */}
              <div className="nav__collapse-row">
                <div className="header__toggle" onClick={() => setIsCollapsed(v => !v)}>
                  <Icon path={isCollapsed ? ICONS.menu : ICONS.close} />
                </div>
              </div>
              <div className="nav__list">
                <div className="nav__items">
                  {navGroups.map((entry, i) =>
                    entry.type === "link" ? (
                      <Link key={i} href={entry.href} className={`nav__link ${pathname === entry.href ? "active" : ""}`} onClick={closeMobileNav}>
                        <span className="nav__icon"><Icon path={ICONS[entry.icon]} /></span>
                        <span className="nav__name">{entry.label}</span>
                      </Link>
                    ) : (
                      <div key={i} className={`nav__dropdown ${openGroup === i ? "nav__dropdown--open" : ""}`}>
                        <a href="#" className="nav__link" onClick={(e) => { e.preventDefault(); setOpenGroup(openGroup === i ? null : i); }}>
                          <span className="nav__icon"><Icon path={ICONS[entry.icon]} /></span>
                          <span className="nav__name">{entry.label}</span>
                          <span className="nav__icon nav__dropdown-icon" style={{ marginLeft: "auto", marginRight: 0, transform: openGroup === i ? "rotate(180deg)" : "none", transition: "transform 180ms ease" }}>
                            <Icon path={ICONS.chevron} size={14} />
                          </span>
                        </a>
                        <div className="nav__dropdown-collapse" style={{ maxHeight: openGroup === i ? `${entry.items.length * 40 + 10}px` : "0" }}>
                          <div className="nav__dropdown-content">
                            {entry.items.map((item) => (
                              <Link key={item.href} href={item.href} className="nav__dropdown-item" onClick={closeMobileNav}>{item.label}</Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowLogoutModal(true); }} className="nav__link nav__logout">
              <span className="nav__icon"><Icon path={ICONS.logout} /></span>
              <span className="nav__name">Log Out</span>
            </a>
          </nav>
        </div>

        <main id="admin-main">
          {children}
        </main>

        {/* Logout Modal */}
        {showLogoutModal && (
          <div className="logout-modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="modal-content" style={{ background: "var(--lg-paper-raised)", width: "90%", maxWidth: 400, borderRadius: "16px", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", textAlign: "center", border: "1px solid var(--lg-line)" }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(239,68,68,0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Icon path={ICONS.logout} size={24} />
              </div>
              <h3 style={{ margin: "0 0 10px", fontSize: 20, color: "var(--lg-ink)", fontWeight: 700 }}>Log Out</h3>
              <p style={{ margin: "0 0 24px", color: "var(--lg-ink-soft)", fontSize: 14 }}>Are you sure you want to log out of your account?</p>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--lg-line)", background: "var(--lg-paper)", color: "var(--lg-ink)", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.target.style.background = "var(--lg-paper-sunken)"} onMouseOut={e => e.target.style.background = "var(--lg-paper)"}>Cancel</button>
                <button onClick={() => { setShowLogoutModal(false); confirmLogout(); }} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.target.style.background = "#dc2626"} onMouseOut={e => e.target.style.background = "#ef4444"}>Yes, Log Out</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
