import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeShell from "./HomeShell";
import "@/styles/ledger-tokens.css";
import "../admin/_shared/admin-shell.css";
import "../admin/_shared/admin-nav.css";

export default async function HomeLayout({ children }) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(process.env.NEXT_PUBLIC_SESSION_COOKIE || "loothat_session");
  if (!hasSession) {
    redirect("/login");
  }
  return <HomeShell>{children}</HomeShell>;
}
