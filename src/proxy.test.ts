import { describe, it, expect, vi, beforeEach } from "vitest";
import { proxy } from "./proxy";
import { NextRequest } from "next/server";
import * as sessionModule from "@/lib/session";

vi.mock("@/lib/session", () => ({
  decrypt: vi.fn(),
}));

describe("Middleware Role Guard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const createRequest = (pathname: string, hasSessionCookie = true) => {
    return {
      nextUrl: { pathname },
      url: `http://localhost:3000${pathname}`,
      cookies: {
        get: vi.fn().mockReturnValue(hasSessionCookie ? { value: "encrypted-token" } : undefined),
      },
    } as unknown as NextRequest;
  };

  it("uses a different CSP nonce per page and forwards it for dynamic scripts", async () => {
    vi.spyOn(sessionModule, "decrypt").mockResolvedValue(null);
    const first = await proxy(createRequest("/login", false));
    const second = await proxy(createRequest("/login", false));
    const policy = first.headers.get("Content-Security-Policy")!;
    expect(policy).toContain("'strict-dynamic'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy.split(";").find((part) => part.includes("script-src"))).not.toContain("'unsafe-inline'");
    expect(second.headers.get("Content-Security-Policy")).not.toBe(policy);
    expect(first.headers.get("x-middleware-request-x-nonce")).toBeTruthy();
    expect(first.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("redirects to /login if no session on protected route", async () => {
    const req = createRequest("/dashboard", false);
    vi.spyOn(sessionModule, "decrypt").mockResolvedValue(null);

    const response = await proxy(req);
    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toContain("/login");
  });

  it("allows access to protected route if session has ROLE_ADMIN", async () => {
    const req = createRequest("/dashboard");
    vi.spyOn(sessionModule, "decrypt").mockResolvedValue({
      accessToken: "...",
      refreshToken: "...",
      userId: "admin-user-id",
      roles: ["ROLE_ADMIN"],
      expiresAt: 9999999999,
    });

    const response = await proxy(req);
    // NextResponse.next() doesn't set status 307 or Location
    expect(response.status).toBe(200);
    expect(response.headers.get("Location")).toBeNull();
  });

  it("redirects to /forbidden if session exists but lacks admin role", async () => {
    const req = createRequest("/dashboard");
    vi.spyOn(sessionModule, "decrypt").mockResolvedValue({
      accessToken: "...",
      refreshToken: "...",
      userId: "user-id",
      roles: ["ROLE_USER"],
      expiresAt: 9999999999,
    });

    const response = await proxy(req);
    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toContain("/forbidden");
  });
});
