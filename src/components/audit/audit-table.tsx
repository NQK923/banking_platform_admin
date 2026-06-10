"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/actions/operations.actions";
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
import { DataTableShell } from "@/components/admin/data-table";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { Timestamp } from "@/components/admin/timestamp";
import { EmptyTableRow, ErrorTableRow, TableSkeletonRows } from "@/components/admin/state-views";

export function AuditTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page") || "1");
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`);
  }, [page, pathname, router, searchParams]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["audit", { page: page - 1, size: 15 }],
    queryFn: () => getAuditLogs(page - 1, 15),
  });

  return (
    <DataTableShell
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
              <TableHead>Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows rows={15} columns={5} />
            ) : isError ? (
              <ErrorTableRow colSpan={5} title="Error loading audit logs." onRetry={() => refetch()} />
            ) : data?.items.length === 0 ? (
              <EmptyTableRow colSpan={5} title="No audit logs found." description="Audited admin activity will appear here." />
            ) : (
              data?.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Timestamp value={log.createdAt} />
                  </TableCell>
                  <TableCell className="max-w-[9rem] font-mono text-xs">
                    {log.actorId.startsWith("sys") ? (
                      <span className="text-muted-foreground">{log.actorId}</span>
                    ) : (
                      <Link href={`/accounts/${log.actorId}`} className="text-primary hover:underline">
                        {log.actorId.substring(0, 8)}...
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[14rem] whitespace-normal break-words text-sm font-medium">
                    {log.action}
                  </TableCell>
                  <TableCell className="max-w-[9rem] font-mono text-xs">
                    {log.targetId ? (
                      log.targetType === "ACCOUNT" ? (
                        <Link href={`/accounts/${log.targetId}`} className="text-primary hover:underline">
                          {log.targetId.substring(0, 8)}...
                        </Link>
                      ) : (
                        <span>{log.targetId.substring(0, 8)}...</span>
                      )
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal break-words text-sm text-muted-foreground" title={log.details || ""}>
                    {log.details || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
    </DataTableShell>
  );
}
