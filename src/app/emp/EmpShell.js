"use client";

import SharedShell from "@/components/SharedShell";

const EMP_NAV = [
  { type: "link", href: "/emp", icon: "home", label: "Dashboard" },
  { type: "link", href: "/emp/live-offer", icon: "offer", label: "Live Offers" },
  { type: "link", href: "/emp/refer-report", icon: "report", label: "Refer Report" },
  { type: "link", href: "/emp/user-report", icon: "report", label: "User Report" },
  { type: "link", href: "/emp/user-details", icon: "cog", label: "User Details" },
  { type: "link", href: "/emp/support", icon: "message", label: "Support" },
];

export default function EmpShell({ children }) {
  return (
    <SharedShell navGroups={EMP_NAV} basePath="/emp" role="Employee">
      {children}
    </SharedShell>
  );
}
