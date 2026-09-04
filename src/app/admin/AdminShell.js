"use client";

import SharedShell from "@/components/SharedShell";

const ADMIN_NAV = [
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
      { href: "/admin/upload-report", label: "Upload Report" },
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
      { href: "/admin/account-delete-requests", label: "Account Delete Requests" },
    ],
  },
];

export default function AdminShell({ children }) {
  return <SharedShell navGroups={ADMIN_NAV} basePath="/admin" role="Admin">{children}</SharedShell>;
}
