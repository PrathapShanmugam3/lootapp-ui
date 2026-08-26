import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeShell from "./HomeShell";
import "@/styles/ledger-tokens.css";
import "../admin/_shared/admin-shell.css";
import "../admin/_shared/admin-nav.css";

export default async function HomeLayout({ children }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(process.env.NEXT_PUBLIC_SESSION_COOKIE || "loothat_session");
  
  if (!sessionCookie) {
    redirect("/login");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/me`, {
    cache: "no-store",
    headers: {
      Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
    },
  });

  if (res.ok) {
    const data = await res.json();
    const status = String(data?.user?.status);
    if (status === "69") {
      redirect("/admin");
    } else if (status === "9") {
      redirect("/emp");
    }
  } else {
    redirect("/login");
  }

  return <HomeShell>{children}</HomeShell>;
}
