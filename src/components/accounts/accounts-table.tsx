"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "@/actions/accounts.actions";
import { formatMoney } from "@/lib/formatters";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTableShell } from "@/components/admin/data-table";
import { Toolbar } from "@/components/admin/toolbar";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { StatusBadge } from "@/components/admin/status-badge";
import { Timestamp } from "@/components/admin/timestamp";
import { EmptyTableRow, ErrorTableRow, TableSkeletonRows } from "@/components/admin/state-views";

export function AccountsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();

  const initialPage = Number(searchParams.get("page") || "1");
  const initialQ = searchParams.get("q") || "";

  const [page, setPage] = useState(initialPage);
  const [q, setQ] = useState(initialQ);
  const debouncedQ = useDebounce(q, 500);

  useEffect(() => {
    // Update URL when page or q changes
    const params = new URLSearchParams(currentSearch);
    params.set("page", page.toString());
    if (debouncedQ) {
      params.set("q", debouncedQ);
    } else {
      params.delete("q");
    }
    const nextSearch = params.toString();
    if (nextSearch !== currentSearch) {
      router.replace(`${pathname}?${nextSearch}`);
    }
  }, [page, debouncedQ, pathname, router, currentSearch]);



  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["accounts", { page: page - 1, size: 10, q: debouncedQ }],
    queryFn: () => getAccounts(page - 1, 10, debouncedQ),
  });
  const accounts = data?.items ?? [];

  return (
    <DataTableShell
      toolbar={
        <Toolbar
          searchPlaceholder="Search email or phone..."
          searchValue={q}
          onSearchChange={(value) => {
            setQ(value);
            setPage(1);
          }}
        />
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
              <TableHead>Email / Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={4} />
            ) : isError ? (
              <ErrorTableRow colSpan={4} title="Error loading accounts." onRetry={() => refetch()} />
            ) : accounts.length === 0 ? (
              <EmptyTableRow colSpan={4} title="No accounts found." description="Try adjusting the search term." />
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    <Link href={`/accounts/${account.id}`} className="hover:underline text-primary">
                      {account.email || account.phoneNumber || account.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={account.status} />
                  </TableCell>
                  <TableCell className="numbers text-right font-mono font-medium">
                    {formatMoney(account.balance, account.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Timestamp value={account.createdAt} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
    </DataTableShell>
  );
}
