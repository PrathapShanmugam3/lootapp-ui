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
  chart: "M3 3v18h18 M7 15l4-6 4 3 4-8",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  message: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z",
  menu: "M3 6h18 M3 12h18 M3 18h18",
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

const NAV_LINKS = [
  { href: "/emp", icon: "home", label: "Dashboard" },
  { href: "/emp/live-offer", icon: "offer", label: "Live Offers" },
  { href: "/emp/refer-report", icon: "report", label: "Refer Report" },
  { href: "/emp/user-report", icon: "chart", label: "User Report" },
  { href: "/emp/user-details", icon: "user", label: "User Details" },
  { href: "/emp/support", icon: "message", label: "Support" },
];

export default function EmpShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  async function handleLogout() {
    await api.post("/api/auth/logout");
    router.push("/login");
  }

  return (
    <div className="loot-hat-admin">
      <header className="header">
        <div className="header__container">
          <Link href="/emp" className="header__img">Loot Hat — Support</Link>
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
            <Link href="/emp" className="nav__link nav__logo">
              <span className="nav__logo-name">Loot Hat</span>
            </Link>
            <div className="nav__list">
              <div className="nav__items">
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className={`nav__link ${pathname === link.href ? "active" : ""}`}>
                    <span className="nav__icon"><Icon path={ICONS[link.icon]} /></span>
                    <span className="nav__name">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="nav__link nav__logout">
            <span className="nav__icon"><Icon path={ICONS.logout} /></span>
            <span className="nav__name">Log Out</span>
          </a>
        </nav>
      </div>

      <main className="height-100 bd-grid" id="admin-main">{children}</main>
    </div>
  );
}
