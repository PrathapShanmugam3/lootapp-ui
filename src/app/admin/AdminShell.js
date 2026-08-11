"use client";

import { useState } from "react";
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
  chevron: "m6 9 6 6 6-6",
  logout: "m16 17 5-5-5-5 M21 12H9 M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
};

function Icon({ path, size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {path.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : `M${seg}`} />
      ))}
    </svg>
  );
}

const NAV_GROUPS = [
  { type: "link", href: "/admin", icon: "home", label: "Dashboard" },
  {
    type: "group", icon: "offer", label: "Offers",
    items: [
      { href: "/admin/add-offer", label: "Add Offer" },
      { href: "/admin/live-offer", label: "Live Offers" },
      { href: "/admin/all-offers", label: "All Offers" },
    ],
  },
  {
    type: "group", icon: "report", label: "Reports",
    items: [
      { href: "/admin/click-logs", label: "Click Logs" },
      { href: "/admin/pending-conversion", label: "Pending Conversion" },
      { href: "/admin/offer-reports", label: "Offer Reports" },
    ],
  },
  {
    type: "group", icon: "time", label: "Payments",
    items: [
      { href: "/admin/payment-logs", label: "Payment Logs" },
      { href: "/admin/pending-payments", label: "Pending Payments" },
      { href: "/admin/failed-payments", label: "Failed Payments" },
    ],
  },
  {
    type: "group", icon: "shield", label: "Security",
    items: [
      { href: "/admin/api", label: "API" },
      { href: "/admin/ip-whitelisting", label: "IP Whitelisting" },
      { href: "/admin/blocked-attempts", label: "Blocked Attempts" },
    ],
  },
  { type: "link", href: "/admin/chat", icon: "message", label: "Chat" },
  {
    type: "group", icon: "cog", label: "Manage",
    items: [
      { href: "/admin/all-users", label: "Manage Users" },
      { href: "/admin/all-referrals", label: "Manage Referrals" },
      { href: "/admin/top-earners", label: "Top Earners" },
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/gateway", label: "Gateway" },
      { href: "/admin/redeem-codes", label: "Redeem Codes" },
    ],
  },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

  async function handleLogout() {
    await api.post("/api/auth/logout");
    router.push("/login");
  }

  return (
    <div className="loot-hat-admin">
      <header className="header">
        <div className="header__container">
          <Link href="/admin" className="header__img">Loot Hat</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ThemeToggle style={{ background: "transparent", border: "1.5px solid var(--lg-line)", color: "var(--lg-ink)" }} />
            <div className="header__toggle" onClick={() => setNavOpen((v) => !v)}>
              <Icon path={ICONS.menu} />
            </div>
          </div>
        </div>
      </header>

      <div className={`nav ${navOpen ? "show" : ""}`}>
        <nav className="nav__container">
          <div>
            <Link href="/admin" className="nav__link nav__logo">
              <span className="nav__logo-name">Loot Hat</span>
            </Link>
            <div className="nav__list">
              <div className="nav__items">
                {NAV_GROUPS.map((entry, i) =>
                  entry.type === "link" ? (
                    <Link key={i} href={entry.href} className={`nav__link ${pathname === entry.href ? "active" : ""}`}>
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
                            <Link key={item.href} href={item.href} className="nav__dropdown-item">{item.label}</Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="nav__link nav__logout">
            <span className="nav__icon"><Icon path={ICONS.logout} /></span>
            <span className="nav__name">Log Out</span>
          </a>
        </nav>
      </div>

      <main className="height-100 bd-grid" id="admin-main">
        {children}
      </main>
    </div>
  );
}
