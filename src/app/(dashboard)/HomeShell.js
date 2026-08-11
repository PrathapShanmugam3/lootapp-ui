"use client";

import { createContext, useContext, useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { api } from "@/lib/apiClient";

const UserContext = createContext(null);

export function useCurrentUser() {
  return useContext(UserContext);
}

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
      <div className="loot-hat-theme flex flex-col min-h-screen">
        <div className="lh-bg-pattern" aria-hidden="true" />
        <AppHeader userName={user?.name || "User"} />
        {children}
      </div>
    </UserContext.Provider>
  );
}
