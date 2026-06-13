"use server";

import { apiFetch } from "@/lib/api-fetch";
import { normalizePaginatedResponse } from "@/lib/pagination";
import { Account, LedgerEntry, PaginatedResponse } from "@/lib/types";

export async function getAccounts(page: number = 0, size: number = 10, q?: string): Promise<PaginatedResponse<Account>> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("size", size.toString());
  if (q) searchParams.set("q", q);

  const res = await apiFetch(`/api/admin/accounts?${searchParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch accounts");
  }
  return normalizePaginatedResponse<Account>(await res.json(), page, size);
}

export async function getAccountDetails(id: string): Promise<Account> {
  const res = await apiFetch(`/api/admin/accounts/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch account details");
  }
  return res.json();
}

export async function getAccountLedger(id: string): Promise<LedgerEntry[]> {
  const res = await apiFetch(`/api/accounts/${id}/ledger`);
  if (!res.ok) {
    throw new Error("Failed to fetch account ledger");
  }
  return res.json();
}

export async function suspendAccount(id: string): Promise<void> {
  const res = await apiFetch(`/api/admin/accounts/${id}/suspend`, {
    method: "POST",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to suspend account");
  }
}
