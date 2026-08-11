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
  const hasSession = cookieStore.has(process.env.NEXT_PUBLIC_SESSION_COOKIE || "loothat_session");
  if (!hasSession) {
    redirect("/login");
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
