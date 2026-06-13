"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  approveRiskEvaluation,
  getRiskEvaluations,
  rejectRiskEvaluation,
} from "@/actions/risk.actions";
import { DataTableShell } from "@/components/admin/data-table";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { EmptyTableRow, ErrorTableRow, TableSkeletonRows } from "@/components/admin/state-views";
import { StatusBadge } from "@/components/admin/status-badge";
import { Timestamp } from "@/components/admin/timestamp";
import { Toolbar } from "@/components/admin/toolbar";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function riskId(item: { id?: string; riskEvaluationId?: string }) {
  return item.id ?? item.riskEvaluationId ?? "";
}

export function RiskTable() {
  const { dictionary: t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(Number(searchParams.get("page") || "1"));
  const [level, setLevel] = useState(searchParams.get("level") || "ALL");
  const [action, setAction] = useState(searchParams.get("action") || "ALL");

  useEffect(() => {
    const params = new URLSearchParams(currentSearch);
    params.set("page", page.toString());
    if (level === "ALL") {
      params.delete("level");
    } else {
      params.set("level", level);
    }
    if (action === "ALL") {
      params.delete("action");
    } else {
      params.set("action", action);
    }
    const nextSearch = params.toString();
    if (nextSearch !== currentSearch) {
      router.replace(`${pathname}?${nextSearch}`);
    }
  }, [action, currentSearch, level, page, pathname, router]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["risk-evaluations", { page: page - 1, size: 10, level, action }],
    queryFn: () => getRiskEvaluations(page - 1, 10, level, action),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      approveRiskEvaluation(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["risk-evaluations"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectRiskEvaluation(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["risk-evaluations"] }),
  });

  const evaluations = data?.items ?? [];

  const requestReason = (label: string) => {
    const reason = window.prompt(label);
    return reason && reason.trim().length > 0 ? reason.trim() : null;
  };

  return (
    <DataTableShell
      toolbar={
        <Toolbar>
          <select
            aria-label={t.filters.riskLevel}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={level}
            onChange={(event) => {
              setLevel(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">{t.filters.allLevels}</option>
            <option value="LOW">{t.status.LOW}</option>
            <option value="MEDIUM">{t.status.MEDIUM}</option>
            <option value="HIGH">{t.status.HIGH}</option>
            <option value="CRITICAL">{t.status.CRITICAL}</option>
          </select>
          <select
            aria-label={t.filters.recommendedAction}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">{t.filters.allActions}</option>
            <option value="ALLOW">{t.status.ALLOW}</option>
            <option value="WARN_USER">{t.status.WARN_USER}</option>
            <option value="STEP_UP_AUTH">{t.status.STEP_UP_AUTH}</option>
            <option value="MANUAL_REVIEW">{t.status.MANUAL_REVIEW}</option>
            <option value="BLOCK">{t.status.BLOCK}</option>
          </select>
        </Toolbar>
      }
      footer={
        <PaginationControls
          page={page}
          totalPages={data?.totalPages || 1}
          totalElements={data?.totalElements || 0}
          isLoading={isLoading}
          onPrevious={() => setPage((value) => Math.max(1, value - 1))}
          onNext={() => setPage((value) => value + 1)}
        />
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.table.created}</TableHead>
            <TableHead>{t.table.risk}</TableHead>
            <TableHead>{t.table.action}</TableHead>
            <TableHead>{t.table.status}</TableHead>
            <TableHead>{t.table.reasons}</TableHead>
            <TableHead className="text-right">{t.table.review}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows columns={6} />
          ) : isError ? (
            <ErrorTableRow colSpan={6} title={t.state.riskError} onRetry={() => refetch()} />
          ) : evaluations.length === 0 ? (
            <EmptyTableRow
              colSpan={6}
              title={t.state.riskEmpty}
              description={t.state.riskEmptyDescription}
            />
          ) : (
            evaluations.map((item) => {
              const id = riskId(item);
              const reviewable = item.decisionStatus === "MANUAL_REVIEW_REQUIRED" && id;
              return (
                <TableRow key={id || `${item.senderAccountId}-${item.createdAt}`}>
                  <TableCell>
                    <Timestamp value={item.createdAt} />
                    <p className="mt-1 max-w-[10rem] truncate font-mono text-xs text-muted-foreground">
                      {id ? `${id.substring(0, 8)}...` : "-"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{item.riskScore}</span>
                      <StatusBadge status={item.riskLevel} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.recommendedAction} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.decisionStatus} />
                  </TableCell>
                  <TableCell className="max-w-[18rem]">
                    <div className="flex flex-wrap gap-1">
                      {item.reasons.map((reason) => (
                        <span
                          key={reason.code}
                          className="rounded-md bg-muted px-2 py-1 text-xs font-medium"
                          title={reason.message}
                        >
                          {reason.code}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {reviewable ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          onClick={() => {
                            const reason = requestReason(t.detail.approveReasonPrompt);
                            if (reason) approveMutation.mutate({ id, reason });
                          }}
                        >
                          {t.actions.approve}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          onClick={() => {
                            const reason = requestReason(t.detail.rejectReasonPrompt);
                            if (reason) rejectMutation.mutate({ id, reason });
                          }}
                        >
                          {t.actions.reject}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
