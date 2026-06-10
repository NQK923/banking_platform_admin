"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccountDetails, getAccountLedger, suspendAccount } from "@/actions/accounts.actions";
import { formatMoney } from "@/lib/formatters";
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
import { Skeleton } from "@/components/ui/skeleton";
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
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { AppCard } from "@/components/admin/app-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Timestamp } from "@/components/admin/timestamp";
import { DataTableShell } from "@/components/admin/data-table";
import { EmptyTableRow, TableSkeletonRows } from "@/components/admin/state-views";

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const accountId = resolvedParams.id;
  const queryClient = useQueryClient();

  const { data: account, isLoading: isAccountLoading } = useQuery({
    queryKey: ["account", accountId],
    queryFn: () => getAccountDetails(accountId),
  });

  const { data: ledger, isLoading: isLedgerLoading } = useQuery({
    queryKey: ["ledger", accountId],
    queryFn: () => getAccountLedger(accountId),
  });

  const suspendMutation = useMutation({
    mutationFn: () => suspendAccount(accountId),
    onSuccess: () => {
      toast.success("Account suspended successfully");
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to suspend account");
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Details"
        description={accountId}
        breadcrumbs={[{ label: "Accounts", href: "/accounts" }, { label: "Detail" }]}
        actions={
          <>
            <Button variant="outline" size="icon" aria-label="Back to accounts" render={
              <Link href="/accounts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            } />
            {account ? <StatusBadge status={account.status} /> : null}
            {account && account.status !== "SUSPENDED" ? (
            <AlertDialog>
              <AlertDialogTrigger render={
                <Button variant="destructive">
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Suspend Account
                </Button>
              } />
              <AlertDialogContent className="border-destructive/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                    Suspend this account?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will suspend the account. The user will no longer be able to perform transactions or login. This action is audited.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={(e) => {
                      e.preventDefault();
                      suspendMutation.mutate();
                    }}
                    disabled={suspendMutation.isPending}
                  >
                    {suspendMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Suspending...
                      </>
                    ) : (
                      "Confirm Suspend"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <AppCard>
          <CardHeader>
            <CardTitle>Profile Info</CardTitle>
            <CardDescription>Contact and status information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAccountLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : account ? (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
                <dt className="font-medium text-muted-foreground">Email</dt>
                <dd className="min-w-0 break-words">{account.email || "N/A"}</dd>
                <dt className="font-medium text-muted-foreground">Phone</dt>
                <dd className="min-w-0 break-words">{account.phoneNumber || "N/A"}</dd>
                <dt className="font-medium text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={account.status} />
                </dd>
                <dt className="font-medium text-muted-foreground">Created At</dt>
                <dd><Timestamp value={account.createdAt} /></dd>
              </dl>
            ) : null}
          </CardContent>
        </AppCard>

        <AppCard>
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription>Current available funds</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center h-full pb-10">
            {isAccountLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : account ? (
              <div className="numbers break-words font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
                {formatMoney(account.balance, account.currency)}
              </div>
            ) : null}
          </CardContent>
        </AppCard>
      </div>

      <AppCard>
        <CardHeader>
          <CardTitle>Raw Ledger</CardTitle>
          <CardDescription>Double-entry accounting records (authoritative)</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created At</TableHead>
                  <TableHead>Journal ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLedgerLoading ? (
                  <TableSkeletonRows rows={3} columns={4} />
                ) : ledger?.length === 0 ? (
                  <EmptyTableRow colSpan={4} title="No ledger entries found." description="Authoritative entries will appear after movement." />
                ) : (
                  ledger?.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell><Timestamp value={entry.createdAt} /></TableCell>
                      <TableCell className="max-w-[18rem] whitespace-normal break-all font-mono text-xs">{entry.journalId}</TableCell>
                      <TableCell>
                        <StatusBadge status={entry.entryType} />
                      </TableCell>
                      <TableCell className="numbers text-right font-mono font-medium">
                        <span className={entry.amount.startsWith("-") ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}>
                          {formatMoney(entry.amount, entry.currency)}
                        </span>
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
