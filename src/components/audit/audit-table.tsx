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

function shortId(value: string) {
  return value.length > 8 ? `${value.substring(0, 8)}...` : value;
}

export function AuditTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();

  const initialPage = Number(searchParams.get("page") || "1");
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const params = new URLSearchParams(currentSearch);
    params.set("page", page.toString());
    const nextSearch = params.toString();
    if (nextSearch !== currentSearch) {
      router.replace(`${pathname}?${nextSearch}`);
    }
  }, [page, pathname, router, currentSearch]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["audit", { page: page - 1, size: 15 }],
    queryFn: () => getAuditLogs(page - 1, 15),
  });
  const logs = data?.items ?? [];

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
            ) : logs.length === 0 ? (
              <EmptyTableRow colSpan={5} title="No audit logs found." description="Audited admin activity will appear here." />
            ) : (
              logs.map((log, index) => {
                const actorId = log.actorId ?? "";
                const targetId = log.targetId ?? "";
                const isSystemActor = actorId === "" || actorId.toLowerCase().startsWith("sys");

                return (
                <TableRow key={log.id || `${log.createdAt}-${index}`}>
                  <TableCell>
                    <Timestamp value={log.createdAt} />
                  </TableCell>
                  <TableCell className="max-w-[9rem] font-mono text-xs">
                    {isSystemActor ? (
                      <span className="text-muted-foreground">{actorId || "SYSTEM"}</span>
                    ) : (
                      <Link href={`/accounts/${actorId}`} className="text-primary hover:underline">
                        {shortId(actorId)}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[14rem] whitespace-normal break-words text-sm font-medium">
                    {log.action || "-"}
                  </TableCell>
                  <TableCell className="max-w-[9rem] font-mono text-xs">
                    {targetId ? (
                      log.targetType === "ACCOUNT" ? (
                        <Link href={`/accounts/${targetId}`} className="text-primary hover:underline">
                          {shortId(targetId)}
                        </Link>
                      ) : (
                        <span>{shortId(targetId)}</span>
                      )
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal break-words text-sm text-muted-foreground" title={log.details || ""}>
                    {log.details || "-"}
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
