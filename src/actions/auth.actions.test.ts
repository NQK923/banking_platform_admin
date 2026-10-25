import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { login } from "./auth.actions";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

vi.mock("@/lib/session", () => ({ createSession: vi.fn(), clearSession: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const fetchMock = vi.fn();
const jwt = (payload: object) => [
  Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
  Buffer.from(JSON.stringify(payload)).toString("base64url"),
  "signature",
].join(".");

function form() {
  const data = new FormData();
  data.set("email", "admin@example.test");
  data.set("password", "password");
  return data;
}

describe("admin login", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("reads expiry and role fallback from the JWT payload segment", async () => {
    const accessToken = jwt({ exp: 1900000000, roles: "ROLE_ADMIN" });
    fetchMock.mockResolvedValue(Response.json({ accessToken, refreshToken: "refresh", userId: "admin-id" }));
    await login(null, form());
    expect(createSession).toHaveBeenCalledWith({
      accessToken, refreshToken: "refresh", userId: "admin-id", roles: ["ROLE_ADMIN"], expiresAt: 1900000000,
    });
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("rejects a regular user without creating an admin session", async () => {
    fetchMock.mockResolvedValue(Response.json({
      accessToken: jwt({ exp: 1900000000 }), refreshToken: "refresh", userId: "user-id", roles: ["ROLE_USER"],
    }));
    expect(await login(null, form())).toEqual({ error: "Unauthorized: Admin access required" });
    expect(createSession).not.toHaveBeenCalled();
  });

  it.each([undefined, null, "", 42])("rejects an invalid access token: %s", async (accessToken) => {
    fetchMock.mockResolvedValue(Response.json({ accessToken, refreshToken: "refresh", userId: "admin", roles: ["ROLE_ADMIN"] }));
    expect(await login(null, form())).toEqual({ error: "Invalid gateway response" });
    expect(createSession).not.toHaveBeenCalled();
  });
});
