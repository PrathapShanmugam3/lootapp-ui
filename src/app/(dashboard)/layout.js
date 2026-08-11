import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Script from "next/script";
import HomeShell from "./HomeShell";
import "@/styles/ledger-tokens.css";
import "./_shared/loothat-home.css";

export default async function HomeLayout({ children }) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(process.env.NEXT_PUBLIC_SESSION_COOKIE || "loothat_session");
  if (!hasSession) {
    redirect("/login");
  }
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
      />
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <HomeShell>{children}</HomeShell>
    </>
  );
}
