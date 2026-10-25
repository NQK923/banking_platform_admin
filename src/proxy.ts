import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const publicRoutes = ["/login"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = request.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && path !== "/forbidden") {
    const roles = session.roles as string[] || [];
    if (!roles.includes("ROLE_ADMIN") && !roles.includes("ADMIN")) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
  }

  if (isPublicRoute && session && !path.startsWith("/dashboard") && path !== "/forbidden") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
