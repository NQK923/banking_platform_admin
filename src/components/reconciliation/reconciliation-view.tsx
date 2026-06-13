"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { runReconciliation } from "@/actions/operations.actions";
import { formatMoney, formatDate } from "@/lib/formatters";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ShieldCheck, Play, CheckCircle2, Loader2 } from "lucide-react";
import { ReconciliationResult } from "@/lib/types";
import { PageHeader } from "@/components/admin/page-header";
import { AppCard } from "@/components/admin/app-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { DataTableShell } from "@/components/admin/data-table";
import { EmptyTableRow } from "@/components/admin/state-views";
import { useLanguage } from "@/components/language-provider";

export function ReconciliationView() {
  const { dictionary: t } = useLanguage();
  const [lastResult, setLastResult] = useState<ReconciliationResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const runMutation = useMutation({
    mutationFn: runReconciliation,
    onSuccess: (data) => {
      setLastResult(data);
      if (data.status === "SUCCESS") {
        toast.success(t.reconciliation.completed);
      } else if (data.status === "DRIFT_DETECTED") {
        toast.warning(t.reconciliation.driftDetected.replace("{count}", String(data.driftCount)));
      } else {
        toast.error(t.reconciliation.failed);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t.reconciliation.runFailed);
    },
    onSettled: () => {
      setConfirmOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.reconciliation.title}
        description={t.reconciliation.description}
        actions={
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger render={
            <Button disabled={runMutation.isPending}>
              {runMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {t.common.running}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  {t.actions.runReconciliation}
                </span>
              )}
            </Button>
          } />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.reconciliation.runQuestion}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.reconciliation.runDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  runMutation.mutate();
                }}
                disabled={runMutation.isPending}
              >
                {runMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {t.common.running}
                  </>
                ) : (
                  t.actions.confirmRun
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        }
      />

      <AppCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t.reconciliation.findings}
          </CardTitle>
          <CardDescription>
            {lastResult 
              ? t.reconciliation.lastRunAt.replace("{time}", formatDate(lastResult.timestamp))
              : t.reconciliation.noRecentRuns}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lastResult && (
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 font-medium">
                {t.reconciliation.status}
                <StatusBadge status={lastResult.status === "SUCCESS" ? "BALANCED" : lastResult.status} />
              </div>
              <div className="text-sm text-muted-foreground">
                {t.reconciliation.totalDriftedAccounts} <span className="font-bold text-foreground">{lastResult.driftCount}</span>
              </div>
            </div>
          )}

          <DataTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.table.account} ID</TableHead>
                  <TableHead>{t.table.status}</TableHead>
                  <TableHead className="text-right">{t.table.ledgerSource}</TableHead>
                  <TableHead className="text-right">{t.table.cachedProjection}</TableHead>
                  <TableHead className="text-right text-destructive">{t.table.driftAmount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!lastResult ? (
                  <EmptyTableRow colSpan={5} icon={ShieldCheck} title={t.reconciliation.awaitingRun} description={t.reconciliation.awaitingRunDescription} />
                ) : lastResult.findings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-80" />
                      {t.reconciliation.booksBalanced}
                    </TableCell>
                  </TableRow>
                ) : (
                  lastResult.findings.map((finding) => (
                    <TableRow key={finding.accountId}>
                      <TableCell className="max-w-[14rem] whitespace-normal break-all font-mono text-xs">{finding.accountId}</TableCell>
                      <TableCell>
                        <StatusBadge status={finding.status} />
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatMoney(finding.ledgerBalance, "VND")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatMoney(finding.cachedBalance, "VND")}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-destructive">
                        {formatMoney(finding.drift, "VND")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </DataTableShell>
        </CardContent>
      </AppCard>
    </div>
  );
}
