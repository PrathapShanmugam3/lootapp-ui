"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/home", label: "Dashboard", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  { href: "/live-offers", label: "Campaigns", icon: "m3 11 18-5v12L3 14v-3z" },
  { href: "/report", label: "Reports", icon: "M3 3v18h18" },
  { href: "/wallet", label: "Payouts", icon: "M21 12V7H5a2 2 0 0 1 0-4h14v4" },
  { href: "/chat", label: "Chat", icon: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" },
];

function isActive(pathname, href) {
  if (pathname === href) return true;
  if (href === "/live-offers" && pathname.startsWith("/offer-detail")) return true;
  if (href === "/report" && pathname.startsWith("/detailed-report")) return true;
  return false;
}

export default function AppHeader({ userName = "User" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setProfileOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  async function handleLogout() {
    await api.post("/api/auth/logout");
    router.push("/login");
  }

  const initial = (userName || "U").charAt(0).toUpperCase();

  return (
    <div ref={rootRef}>
      <header className="lh-header flex h-16 items-center gap-4 px-6">
        <div className="flex items-center gap-2.5 mr-8">
          <div className="lh-logo-box flex h-8 w-8 items-center justify-center rounded-xl select-none">
            <svg className="h-4 w-4 text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-white" style={{ letterSpacing: "-0.01em" }}>
            Loot Hat
          </span>
        </div>

        <nav className="hidden md:flex flex-1 items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`lh-nav-item px-4 py-1.5 rounded-full text-[13px] font-medium ${
                  active ? "lh-nav-link-active lh-nav-active-pill" : "lh-nav-link"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.24)", color: "#fff" }} />
          <button className="lh-bell-btn relative p-2 rounded-full" aria-label="Notifications">
            <svg className="h-[18px] w-[18px] text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
          <div className="lh-divider h-5 w-px mx-1" />
          <div className="relative">
            <button
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.24)" }}
              onClick={(e) => {
                e.stopPropagation();
                setProfileOpen((v) => !v);
                setMobileOpen(false);
              }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold text-white border-2 border-white/25"
                style={{ background: "rgba(255,255,255,0.22)" }}
              >
                {initial}
              </span>
              <span className="text-[13px] font-medium text-white/80 hidden lg:block">{userName}</span>
              <svg className="h-3.5 w-3.5 text-white/45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {profileOpen && (
              <div className="lh-profile-dd absolute right-0" style={{ top: "calc(100% + 8px)", minWidth: 210, zIndex: 99999 }}>
                <div className="py-1.5">
                  <Link href="/my-profile" className="lh-profile-dd-item w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium" style={{ color: "var(--lg-ink-soft)" }}>
                    My Profile
                  </Link>
                  <a href="https://t.me/+p03Tb_KqMwMwNWM1" target="_blank" rel="noreferrer" className="lh-profile-dd-item w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium" style={{ color: "var(--lg-ink-soft)" }}>
                    Join Telegram
                  </a>
                  <a href="https://www.whatsapp.com/channel/0029VaDmXVGLY6dGWlmmJC2k" target="_blank" rel="noreferrer" className="lh-profile-dd-item w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium" style={{ color: "var(--lg-ink-soft)" }}>
                    Join WhatsApp
                  </a>
                  <a href="https://loothat.com/privacy-policy.php" target="_blank" rel="noreferrer" className="lh-profile-dd-item w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium" style={{ color: "var(--lg-ink-soft)" }}>
                    Privacy Policy
                  </a>
                  <button onClick={handleLogout} className="lh-profile-dd-item w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-left" style={{ color: "var(--lg-error)" }}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-full ml-1 flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.16)" }}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMobileOpen((v) => !v);
              setProfileOpen(false);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2">
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="lh-mobile-nav md:hidden" style={{ position: "relative", zIndex: 40 }}>
          <nav className="flex flex-col px-4 py-2">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="lh-mobile-nav-link"
                  style={active ? { color: "var(--lg-violet)", fontWeight: 700, background: "var(--lg-violet-soft)" } : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
