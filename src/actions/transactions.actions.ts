"use server";

import { apiFetch } from "@/lib/api-fetch";
import { PaginatedResponse, Transaction } from "@/lib/types";

export async function getTransactions(
  page: number = 0,
  size: number = 10,
  status?: string,
  accountId?: string
): Promise<PaginatedResponse<Transaction>> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("size", size.toString());
  if (status && status !== "ALL") searchParams.set("status", status);
  if (accountId) searchParams.set("accountId", accountId);

  const res = await apiFetch(`/api/admin/transactions?${searchParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return res.json();
}
