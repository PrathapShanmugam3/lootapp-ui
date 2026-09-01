"use client";

import { createContext, useContext, useEffect, useState } from "react";
import SharedShell from "@/components/SharedShell";
import { api } from "@/lib/apiClient";

const UserContext = createContext(null);

export function useCurrentUser() {
  return useContext(UserContext);
}

const USER_NAV = [
  { type: "link", href: "/home", icon: "home", label: "Dashboard" },
  { type: "link", href: "/live-offers", icon: "offer", label: "Campaigns" },
  { type: "link", href: "/report", icon: "report", label: "Reports" },
  { type: "link", href: "/wallet", icon: "wallet", label: "Payouts" },
  { type: "link", href: "/chat", icon: "message", label: "Chat" },
];

export default function HomeShell({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <UserContext.Provider value={user}>
      <SharedShell navGroups={USER_NAV} basePath="/home" role={user?.name || "User"}>
        <div className="dashboard-content-wrapper">
          {children}
        </div>
      </SharedShell>
    </UserContext.Provider>
  );
}
