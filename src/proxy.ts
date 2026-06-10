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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
