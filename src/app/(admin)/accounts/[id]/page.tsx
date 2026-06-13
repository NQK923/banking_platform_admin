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
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
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
import { useLanguage } from "@/components/language-provider";

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { dictionary: t } = useLanguage();
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
      toast.success(t.detail.accountSuspended);
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (error) => {
      toast.error(error.message || t.detail.suspendFailed);
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.detail.accountDetails}
        description={accountId}
        breadcrumbs={[{ label: t.nav.accounts, href: "/accounts" }, { label: t.detail.accountDetails }]}
        actions={
          <>
            <Link
              href="/accounts"
              aria-label={t.actions.backToAccounts}
              className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            {account ? <StatusBadge status={account.status} /> : null}
            {account && account.kind !== "SYSTEM" && account.status !== "SUSPENDED" ? (
            <AlertDialog>
              <AlertDialogTrigger render={
                <Button variant="destructive">
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  {t.actions.suspendAccount}
                </Button>
              } />
              <AlertDialogContent className="border-destructive/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                    {t.detail.suspendAccountQuestion}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.detail.suspendAccountDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
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
                        {t.detail.suspending}
                      </>
                    ) : (
                      t.actions.confirmSuspend
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
            <CardTitle>{t.detail.accountInfo}</CardTitle>
            <CardDescription>{t.detail.accountInfoDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAccountLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : account ? (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
                <dt className="font-medium text-muted-foreground">{t.table.accountId}</dt>
                <dd className="min-w-0 break-all font-mono text-xs">{account.id}</dd>
                <dt className="font-medium text-muted-foreground">{t.table.kind}</dt>
                <dd>{account.kind || "ACCOUNT"}</dd>
                {account.code ? (
                  <>
                    <dt className="font-medium text-muted-foreground">{t.table.code}</dt>
                    <dd className="min-w-0 break-words font-mono text-xs">{account.code}</dd>
                  </>
                ) : null}
                {account.userId ? (
                  <>
                    <dt className="font-medium text-muted-foreground">{t.table.userId}</dt>
                    <dd className="min-w-0 break-all font-mono text-xs">{account.userId}</dd>
                  </>
                ) : null}
                <dt className="font-medium text-muted-foreground">{t.table.email}</dt>
                <dd className="min-w-0 break-words">{account.email || "N/A"}</dd>
                <dt className="font-medium text-muted-foreground">{t.table.phone}</dt>
                <dd className="min-w-0 break-words">{account.phoneNumber || "N/A"}</dd>
                <dt className="font-medium text-muted-foreground">{t.table.status}</dt>
                <dd>
                  <StatusBadge status={account.status} />
                </dd>
                <dt className="font-medium text-muted-foreground">{t.table.createdAt}</dt>
                <dd><Timestamp value={account.createdAt} /></dd>
              </dl>
            ) : null}
          </CardContent>
        </AppCard>

        <AppCard>
          <CardHeader>
            <CardTitle>{t.table.walletBalance}</CardTitle>
            <CardDescription>{t.detail.currentAvailableFunds}</CardDescription>
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
          <CardTitle>{t.detail.rawLedger}</CardTitle>
          <CardDescription>{t.detail.rawLedgerDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.table.createdAt}</TableHead>
                  <TableHead>{t.table.journalId}</TableHead>
                  <TableHead>{t.table.type}</TableHead>
                  <TableHead className="text-right">{t.table.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLedgerLoading ? (
                  <TableSkeletonRows rows={3} columns={4} />
                ) : ledger?.length === 0 ? (
                  <EmptyTableRow colSpan={4} title={t.detail.ledgerEmpty} description={t.detail.ledgerEmptyDescription} />
                ) : (
                  ledger?.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell><Timestamp value={entry.createdAt} /></TableCell>
                      <TableCell className="max-w-[18rem] whitespace-normal break-all font-mono text-xs">{entry.journalId}</TableCell>
                      <TableCell>
                        <StatusBadge status={entry.entryType} />
                      </TableCell>
                      <TableCell className="numbers text-right font-mono font-medium">
                        <span className={String(entry.amount).startsWith("-") ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}>
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
