"use server";

import { apiFetch } from "@/lib/api-fetch";
import { normalizePaginatedResponse } from "@/lib/pagination";
import { PaginatedResponse, RiskEvaluation, Transaction } from "@/lib/types";

export async function getRiskEvaluations(
  page: number = 0,
  size: number = 10,
  level?: string,
  action?: string
): Promise<PaginatedResponse<RiskEvaluation>> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("size", size.toString());
  if (level && level !== "ALL") searchParams.set("level", level);
  if (action && action !== "ALL") searchParams.set("action", action);

  const res = await apiFetch(`/api/admin/risk?${searchParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch risk evaluations");
  }
  return normalizePaginatedResponse<RiskEvaluation>(await res.json(), page, size);
}

export async function approveRiskEvaluation(id: string, reason: string): Promise<Transaction> {
  const res = await apiFetch(`/api/admin/risk/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    throw new Error("Failed to approve risk review");
  }
  return (await res.json()) as Transaction;
}

export async function rejectRiskEvaluation(id: string, reason: string): Promise<Transaction> {
  const res = await apiFetch(`/api/admin/risk/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    throw new Error("Failed to reject risk review");
  }
  return (await res.json()) as Transaction;
}
