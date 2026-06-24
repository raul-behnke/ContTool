import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

function ctEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function expectedGate(): Promise<string> {
  const secret = `${process.env.ADMIN_ACCESS_TOKEN ?? ""}:${process.env.AUTH_SECRET ?? ""}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Atrás do nginx, o host interno (localhost:4100) vaza no redirect.
// Reescreve host/proto a partir dos headers encaminhados.
function fixHost(req: { headers: Headers }, u: URL): void {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) {
    u.protocol = (req.headers.get("x-forwarded-proto") ?? "https") + ":";
    u.host = host;
    u.port = "";
  }
}

export default auth(async (req) => {
  const url = req.nextUrl;
  const pathname = url.pathname; // basePath already stripped here
  const isLogin = pathname === "/admin/login";

  const expected = await expectedGate();
  const gateCookie = req.cookies.get("admin_gate")?.value ?? "";
  const hasGate = !!gateCookie && ctEq(gateCookie, expected);

  // 1) Token in URL: validate, set httpOnly cookie, strip token from URL
  const token = url.searchParams.get("token");
  if (token) {
    if (process.env.ADMIN_ACCESS_TOKEN && ctEq(token, process.env.ADMIN_ACCESS_TOKEN)) {
      const clean = url.clone();
      clean.searchParams.delete("token");
      fixHost(req, clean);
      const res = NextResponse.redirect(clean);
      res.cookies.set("admin_gate", expected, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/blog/admin",
        maxAge: 60 * 60 * 8,
      });
      return res;
    }
    // wrong token -> hide admin
    return new NextResponse(null, { status: 404 });
  }

  // 2) No gate cookie -> admin is hidden (404), even login
  if (!hasGate) {
    return new NextResponse(null, { status: 404 });
  }

  // 3) Gate ok but not authenticated -> force login (except the login page itself)
  if (!req.auth && !isLogin) {
    const login = url.clone();
    login.pathname = "/admin/login";
    login.search = "";
    fixHost(req, login);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = { matcher: ["/admin/:path*"] };
