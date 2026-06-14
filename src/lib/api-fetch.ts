import { getSession, createSession, clearSession } from "./session";

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:8080";

type ApiFetchOptions = RequestInit & {
  requireAuth?: boolean;
};

export async function apiFetch(endpoint: string, options: ApiFetchOptions = {}) {
  const { requireAuth = true, ...customConfig } = options;

  const headers = new Headers(customConfig.headers);
  headers.set("Content-Type", "application/json");

  let session = await getSession();

  if (requireAuth) {
    if (!session) {
      throw new Error("unauthorized");
    }
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  const url = `${GATEWAY_URL}${endpoint}`;
  let response = await fetch(url, config);

  if (response.status === 401 && requireAuth && session) {
    // Attempt token refresh
    try {
      const refreshRes = await fetch(`${GATEWAY_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.userId, refreshToken: session.refreshToken }),
      });

      if (!refreshRes.ok) {
        throw new Error("Refresh failed");
      }

      const { accessToken, refreshToken, userId } = await refreshRes.json();
      
      // Update session
      session = {
        ...session,
        accessToken,
        refreshToken,
        userId: typeof userId === "string" && userId ? userId : session.userId,
      };
      await createSession(session);

      // Retry original request
      headers.set("Authorization", `Bearer ${accessToken}`);
      response = await fetch(url, { ...config, headers });
    } catch {
      await clearSession();
      throw new Error("unauthorized");
    }
  }

  if (response.status === 403) {
    throw new Error("forbidden");
  }

  if (!response.ok && response.status !== 400 && response.status !== 404 && response.status !== 409 && response.status !== 422) {
      const errorData = await response.text();
      console.error(`API Error ${response.status}:`, errorData);
  }

  return response;
}
