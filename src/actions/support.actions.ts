"use server";

import { apiFetch } from "@/lib/api-fetch";
import { normalizePaginatedResponse } from "@/lib/pagination";
import { PaginatedResponse, SupportCase, SupportCaseDetail } from "@/lib/types";

export async function getSupportCases(
  page: number = 0,
  size: number = 10,
  status?: string,
  topic?: string
): Promise<PaginatedResponse<SupportCase>> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("size", size.toString());
  if (status && status !== "ALL") searchParams.set("status", status);
  if (topic && topic !== "ALL") searchParams.set("topic", topic);

  const res = await apiFetch(`/api/admin/support/cases?${searchParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch support cases");
  }
  return normalizePaginatedResponse<SupportCase>(await res.json(), page, size);
}

export async function getSupportCase(caseId: string): Promise<SupportCaseDetail> {
  const res = await apiFetch(`/api/admin/support/cases/${caseId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch support case");
  }
  return res.json();
}

export async function replyToSupportCase(caseId: string, message: string) {
  const res = await apiFetch(`/api/admin/support/cases/${caseId}/reply`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    throw new Error("Failed to reply to support case");
  }
  return res.json();
}

export async function closeSupportCase(caseId: string, resolution: string) {
  const res = await apiFetch(`/api/admin/support/cases/${caseId}/close`, {
    method: "POST",
    body: JSON.stringify({ resolution }),
  });
  if (!res.ok) {
    throw new Error("Failed to close support case");
  }
  return res.json();
}
