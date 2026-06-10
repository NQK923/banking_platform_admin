"use server";

import { redirect } from "next/navigation";
import { createSession, clearSession } from "@/lib/session";

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:8080";

function decodeBackendAccessToken(accessToken: string) {
  const [payloadPart] = accessToken.split(".");
  if (!payloadPart) return {};

  try {
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    return {
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
      roles: typeof payload.roles === "string" ? payload.roles.split(",").filter(Boolean) : undefined,
    };
  } catch {
    return {};
  }
}

export async function login(prevState: { error?: string } | null, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const res = await fetch(`${GATEWAY_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier: email, password }),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: "Invalid credentials" };
      }
      return { error: "Failed to connect to gateway" };
    }

    const data = await res.json();
    const { accessToken, refreshToken, roles } = data;

    const tokenPayload = decodeBackendAccessToken(accessToken);
    const tokenRoles = Array.isArray(roles) ? roles : tokenPayload.roles || [];

    if (!tokenRoles.includes("ROLE_ADMIN") && !tokenRoles.includes("ADMIN")) {
      return { error: "Unauthorized: Admin access required" };
    }

    await createSession({
      accessToken,
      refreshToken,
      roles: tokenRoles,
      expiresAt: tokenPayload.exp || Math.floor(Date.now() / 1000) + 900,
    });
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Internal server error" };
  }

  redirect("/dashboard");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
