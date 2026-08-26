import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EmpShell from "./EmpShell";
import "@/styles/ledger-tokens.css";
import "./_shared/admin-shell.css";
import "./_shared/admin-nav.css";
import "./_shared/admin-index.css";
import "./_shared/admin-toast.css";

export default async function EmpLayout({ children }) {
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

  if (!res.ok) {
    redirect("/login");
  }

  const data = await res.json();
  if (String(data?.user?.status) !== "9") {
    redirect("/home"); 
  }
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" />
      <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" />
      <EmpShell>{children}</EmpShell>
    </>
  );
}
