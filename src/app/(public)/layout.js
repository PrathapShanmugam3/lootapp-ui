import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Public-route layout — guards login / signup / forgot-password pages.
 * If the user already has a valid session, redirect them to their
 * role-specific dashboard instead of showing the login form again.
 */
export default async function PublicLayout({ children }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(
    process.env.NEXT_PUBLIC_SESSION_COOKIE || "loothat_session"
  );

  if (sessionCookie) {
    // Verify the session is still valid with the backend
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/me`,
        {
          cache: "no-store",
          headers: {
            Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const status = String(data?.user?.status);

        // Redirect to the appropriate dashboard based on role
        if (status === "69") {
          redirect("/admin");
        } else if (status === "9") {
          redirect("/emp");
        } else {
          redirect("/home");
        }
      }
    } catch {
      // Session invalid or backend unreachable — let them see the login page
    }
  }

  return <>{children}</>;
}
