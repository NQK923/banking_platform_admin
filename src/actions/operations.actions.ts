"use server";

import { apiFetch } from "@/lib/api-fetch";
import { normalizePaginatedResponse } from "@/lib/pagination";
import {
  AuditLog,
  DlqMessage,
  PaginatedResponse,
  ReconciliationFinding,
  ReconciliationResult,
  SystemMetrics,
} from "@/lib/types";

export async function runReconciliation(): Promise<ReconciliationResult> {
  const res = await apiFetch("/api/reconciliation/run", {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to run reconciliation");
  }
  const payload = await res.json();
  const findings: ReconciliationFinding[] = Array.isArray(payload.findings)
    ? payload.findings.map((finding: unknown) => {
        if (typeof finding === "object" && finding !== null) {
          return finding as ReconciliationFinding;
        }
        const text = String(finding);
        return {
          accountId: text,
          ledgerBalance: "0",
          cachedBalance: "0",
          drift: "0",
          status: "DRIFT",
        };
      })
    : [];

  return {
    timestamp: payload.timestamp || payload.checkedAt || new Date().toISOString(),
    status: payload.status || (payload.zeroDrift ? "SUCCESS" : "DRIFT_DETECTED"),
    driftCount: typeof payload.driftCount === "number" ? payload.driftCount : findings.length,
    findings,
  };
}

export async function getDlqMessages(
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<DlqMessage>> {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("size", size.toString());

  const res = await apiFetch(`/api/admin/dlq?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch DLQ messages");
  }
  return normalizePaginatedResponse<DlqMessage>(await res.json(), page, size);
}

export async function replayDlqMessage(
  partition?: number,
  offset?: number,
  replayAll: boolean = false
): Promise<void> {
  const body = replayAll ? { replayAll: true } : { partition, offset };
  
  const res = await apiFetch("/api/admin/dlq/replay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to replay DLQ message(s)");
  }
}

export async function getAuditLogs(
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<AuditLog>> {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("size", size.toString());

  const res = await apiFetch(`/api/admin/audit?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch audit logs");
  }
  return normalizePaginatedResponse<AuditLog>(await res.json(), page, size);
}

export async function getLiveMetrics(): Promise<SystemMetrics> {
  try {
    const res = await apiFetch("/api/admin/metrics", {
      // Small timeout for fast fallback
      next: { revalidate: 0 },
    });
    
    if (!res.ok) {
      throw new Error("Metrics endpoint unavailable");
    }
    
    return res.json();
  } catch {
    // If the endpoint is completely unavailable, throw an error so the UI can catch it
    // and display "Unavailable"
    throw new Error("Metrics endpoint unavailable");
  }
}
