import { cookies } from "next/headers";

const ADMIN_COOKIE = "bomboniere_admin";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  return Boolean(token) && token === process.env.ADMIN_PASSWORD;
}

export async function requireAdmin() {
  const authenticated = await isAdminAuthenticated();
  return authenticated;
}

export async function setAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, process.env.ADMIN_PASSWORD ?? "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
