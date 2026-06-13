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
import { useLanguage } from "@/components/language-provider";

function shortId(value: string) {
  return value.length > 8 ? `${value.substring(0, 8)}...` : value;
}

function formatDetails(log: { details?: string | null; payload?: Record<string, string> | null }) {
  if (log.details) return log.details;
  if (!log.payload || Object.keys(log.payload).length === 0) return "-";
  if (typeof log.payload.raw === "string") return log.payload.raw;
  return JSON.stringify(log.payload);
}

export function AuditTable() {
  const { dictionary: t } = useLanguage();
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
              <TableHead>{t.table.time}</TableHead>
              <TableHead>{t.table.actor}</TableHead>
              <TableHead>{t.table.action}</TableHead>
              <TableHead>{t.table.target}</TableHead>
              <TableHead>{t.table.auditDetails}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows rows={15} columns={5} />
            ) : isError ? (
              <ErrorTableRow colSpan={5} title={t.table.auditError} onRetry={() => refetch()} />
            ) : logs.length === 0 ? (
              <EmptyTableRow colSpan={5} title={t.table.auditEmpty} description={t.table.auditEmptyDescription} />
            ) : (
              logs.map((log, index) => {
                const actorId = log.actorId ?? "";
                const targetId = log.targetId ?? log.entityId ?? "";
                const targetType = log.targetType ?? log.entityType ?? "";
                const action = log.action ?? log.eventType ?? "-";
                const details = formatDetails(log);
                const isSystemActor = actorId === "" || actorId.toLowerCase().startsWith("sys");

                return (
                <TableRow key={log.id || `${log.createdAt}-${index}`}>
                  <TableCell>
                    <Timestamp value={log.createdAt} />
                  </TableCell>
                  <TableCell className="max-w-[9rem] font-mono text-xs">
                    {isSystemActor ? (
                      <span className="text-muted-foreground">{actorId || t.common.system}</span>
                    ) : (
                      <Link href={`/accounts/${actorId}`} className="text-primary hover:underline">
                        {shortId(actorId)}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[14rem] whitespace-normal break-words text-sm font-medium">
                    {action}
                  </TableCell>
                  <TableCell className="max-w-[9rem] font-mono text-xs">
                    {targetId ? (
                      targetType === "ACCOUNT" ? (
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
                  <TableCell className="max-w-xs whitespace-normal break-words text-sm text-muted-foreground" title={details}>
                    {details}
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
