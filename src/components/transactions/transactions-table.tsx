"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/actions/transactions.actions";
import { formatMoney } from "@/lib/formatters";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTableShell } from "@/components/admin/data-table";
import { Toolbar } from "@/components/admin/toolbar";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { StatusBadge } from "@/components/admin/status-badge";
import { Timestamp } from "@/components/admin/timestamp";
import { EmptyTableRow, ErrorTableRow, TableSkeletonRows } from "@/components/admin/state-views";

export function TransactionsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page") || "1");
  const initialStatus = searchParams.get("status") || "ALL";
  const initialAccountId = searchParams.get("accountId") || "";

  const [page, setPage] = useState(initialPage);
  const [status, setStatus] = useState(initialStatus);
  const [accountId, setAccountId] = useState(initialAccountId);
  const debouncedAccountId = useDebounce(accountId, 500);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    if (status && status !== "ALL") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    if (debouncedAccountId) {
      params.set("accountId", debouncedAccountId);
    } else {
      params.delete("accountId");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [page, status, debouncedAccountId, pathname, router, searchParams]);



  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["transactions", { page: page - 1, size: 10, status, accountId: debouncedAccountId }],
    queryFn: () => getTransactions(page - 1, 10, status, debouncedAccountId),
  });

  return (
    <DataTableShell
      toolbar={
        <Toolbar
          searchPlaceholder="Filter by Account ID..."
          searchValue={accountId}
          onSearchChange={(value) => {
            setAccountId(value);
            setPage(1);
          }}
        >
        <select
          aria-label="Filter by transaction status"
          className="flex h-9 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="FAILED">Failed</option>
          <option value="COMPENSATING">Compensating</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        </Toolbar>
      }
      footer={
        <PaginationControls
          page={page}
          totalPages={data?.totalPages || 1}
          totalElements={data?.totalElements || 0}
          isLoading={isLoading}
          onPrevious={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      }
    >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={6} />
            ) : isError ? (
              <ErrorTableRow colSpan={6} title="Error loading transactions." onRetry={() => refetch()} />
            ) : data?.items.length === 0 ? (
              <EmptyTableRow colSpan={6} title="No transactions found." description="Try a different status or account filter." />
            ) : (
              data?.items.map((tx) => (
                <React.Fragment key={tx.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedRow(expandedRow === tx.id ? null : tx.id)}
                  >
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={expandedRow === tx.id ? "Collapse transaction details" : "Expand transaction details"}
                        onClick={(event) => {
                          event.stopPropagation();
                          setExpandedRow(expandedRow === tx.id ? null : tx.id);
                        }}
                      >
                        {expandedRow === tx.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Timestamp value={tx.createdAt} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.senderId ? (
                        <Link href={`/accounts/${tx.senderId}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                          {tx.senderId.substring(0, 8)}...
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">SYSTEM</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.recipientId ? (
                        <Link href={`/accounts/${tx.recipientId}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                          {tx.recipientId.substring(0, 8)}...
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">SYSTEM</span>
                      )}
                    </TableCell>
                    <TableCell className="numbers text-right font-mono font-medium">
                      {formatMoney(tx.amount, tx.currency)}
                    </TableCell>
                  </TableRow>
                  {expandedRow === tx.id && (
                    <TableRow className="bg-muted/35 hover:bg-muted/35">
                      <TableCell colSpan={6} className="p-0">
                        <div className="border-l-2 border-primary/40 p-4 text-sm">
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            <p className="font-semibold">Transaction detail</p>
                            <StatusBadge status={tx.status} />
                            {tx.compensated ? <StatusBadge status="Refunded" /> : null}
                          </div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-1 font-medium">Transaction ID</p>
                            <p className="font-mono text-xs text-muted-foreground break-all">{tx.id}</p>
                          </div>
                          <div>
                            <p className="mb-1 font-medium">Journal ID</p>
                            <p className="font-mono text-xs text-muted-foreground break-all">{tx.journalId}</p>
                          </div>
                          {tx.note && (
                            <div className="col-span-full">
                              <p className="mb-1 font-medium">Note</p>
                              <p className="text-muted-foreground italic">&quot;{tx.note}&quot;</p>
                            </div>
                          )}
                          {tx.failureReason && (
                            <div className="col-span-full flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive">
                              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">Failure Reason</p>
                                <p>{tx.failureReason}</p>
                              </div>
                            </div>
                          )}
                          {tx.compensated && (
                            <div className="col-span-full flex items-center gap-2 rounded-md border border-emerald-600/20 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">
                              <RefreshCw className="h-4 w-4" />
                              <span className="font-medium">Refunded / Compensated successfully</span>
                            </div>
                          )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
    </DataTableShell>
  );
}
