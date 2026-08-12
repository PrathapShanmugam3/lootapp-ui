import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "./AdminShell";
import "@/styles/ledger-tokens.css";
import "./_shared/admin-shell.css";
import "./_shared/admin-nav.css";
import "./_shared/admin-index.css";
import "./_shared/admin-toast.css";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(process.env.NEXT_PUBLIC_SESSION_COOKIE || "loothat_session");
  if (!hasSession) {
    redirect("/login");
  }
  return <AdminShell>{children}</AdminShell>;
}
