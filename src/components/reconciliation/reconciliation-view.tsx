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

export function ReconciliationView() {
  const [lastResult, setLastResult] = useState<ReconciliationResult | null>(null);

  const runMutation = useMutation({
    mutationFn: runReconciliation,
    onSuccess: (data) => {
      setLastResult(data);
      if (data.status === "SUCCESS") {
        toast.success("Reconciliation completed. Books are balanced.");
      } else if (data.status === "DRIFT_DETECTED") {
        toast.warning(`Reconciliation detected ${data.driftCount} account(s) with drift!`);
      } else {
        toast.error("Reconciliation failed to complete.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to run reconciliation");
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reconciliation"
        description="Verify ledger and projection integrity."
        actions={
        <AlertDialog>
          <AlertDialogTrigger render={
            <Button disabled={runMutation.isPending}>
              {runMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Running...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Run Reconciliation
                </span>
              )}
            </Button>
          } />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Run full reconciliation?</AlertDialogTitle>
              <AlertDialogDescription>
                This will trigger a system-wide pass verifying the immutable ledger against the read-model projections and cache.
                This operation is intensive and findings will be audited.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                    Running...
                  </>
                ) : (
                  "Confirm Run"
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
            Reconciliation Findings
          </CardTitle>
          <CardDescription>
            {lastResult 
              ? `Last run at ${formatDate(lastResult.timestamp)}` 
              : "No recent runs in this session. Click 'Run Reconciliation' to verify system integrity."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lastResult && (
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-2 font-medium">
                Status:
                <StatusBadge status={lastResult.status === "SUCCESS" ? "BALANCED" : lastResult.status} />
              </div>
              <div className="text-sm text-muted-foreground">
                Total drifted accounts: <span className="font-bold text-foreground">{lastResult.driftCount}</span>
              </div>
            </div>
          )}

          <DataTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ledger (Source)</TableHead>
                  <TableHead className="text-right">Cached (Projection)</TableHead>
                  <TableHead className="text-right text-destructive">Drift Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!lastResult ? (
                  <EmptyTableRow colSpan={5} icon={ShieldCheck} title="Awaiting run." description="Run reconciliation to verify ledger, projection, and cache integrity." />
                ) : lastResult.findings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-80" />
                      Books are perfectly balanced.
                    </TableCell>
                  </TableRow>
                ) : (
                  lastResult.findings.map((finding) => (
                    <TableRow key={finding.accountId}>
                      <TableCell className="font-mono text-xs">{finding.accountId}</TableCell>
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
