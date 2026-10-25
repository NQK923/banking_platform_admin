import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./api-fetch";
import { clearSession, createSession, getSession } from "./session";

vi.mock("./session", () => ({ getSession: vi.fn(), createSession: vi.fn(), clearSession: vi.fn() }));
const fetchMock = vi.fn();
const session = { accessToken: "old", refreshToken: "refresh", userId: "admin", roles: ["ROLE_ADMIN"], expiresAt: 1900000000 };

describe("authenticated BFF requests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(getSession).mockResolvedValue(session);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("does not fetch protected data without a session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    await expect(apiFetch("/api/admin/accounts")).rejects.toThrow("unauthorized");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("disables persistent caching even when a caller requests force-cache", async () => {
    fetchMock.mockResolvedValue(Response.json([]));
    await apiFetch("/api/admin/accounts", { cache: "force-cache" });
    const config = fetchMock.mock.calls[0][1];
    expect(config.cache).toBe("no-store");
    expect(config.headers.get("Authorization")).toBe("Bearer old");
  });

  it("rotates using only the refresh token and retries with the new access token", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ accessToken: "new", refreshToken: "rotated", userId: "admin" }))
      .mockResolvedValueOnce(Response.json({ ok: true }));
    expect((await apiFetch("/api/admin/accounts")).ok).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ refreshToken: "refresh" });
    expect(fetchMock.mock.calls[1][1].cache).toBe("no-store");
    expect(fetchMock.mock.calls[2][1].headers.get("Authorization")).toBe("Bearer new");
    expect(createSession).toHaveBeenCalledWith({ ...session, accessToken: "new", refreshToken: "rotated" });
  });

  it("clears the session when refresh is revoked", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    await expect(apiFetch("/api/admin/accounts")).rejects.toThrow("unauthorized");
    expect(clearSession).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retain a session when the refreshed access token is rejected", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ accessToken: "new", refreshToken: "rotated", userId: "admin" }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }));
    await expect(apiFetch("/api/admin/accounts")).rejects.toThrow("unauthorized");
    expect(clearSession).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("rejects malformed refresh responses before storing a new session", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ accessToken: null, refreshToken: "rotated" }));
    await expect(apiFetch("/api/admin/accounts")).rejects.toThrow("unauthorized");
    expect(createSession).not.toHaveBeenCalled();
    expect(clearSession).toHaveBeenCalledOnce();
  });
});
