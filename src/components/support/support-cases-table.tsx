"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupportCases } from "@/actions/support.actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableShell } from "@/components/admin/data-table";
import { Toolbar } from "@/components/admin/toolbar";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { StatusBadge } from "@/components/admin/status-badge";
import { Timestamp } from "@/components/admin/timestamp";
import { EmptyTableRow, ErrorTableRow, TableSkeletonRows } from "@/components/admin/state-views";
import { useLanguage } from "@/components/language-provider";
import { buttonVariants } from "@/components/ui/button";

const topics = [
  "ALL",
  "TRANSFER_STATUS",
  "TRANSFER_FAILED",
  "TRANSFER_REFUND",
  "PIN_HELP",
  "BALANCE_DISPLAY",
  "FRAUD_OR_SCAM",
  "HUMAN_SUPPORT",
  "GENERAL_FAQ",
];

export function SupportCasesTable() {
  const { dictionary: t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();
  const initialPage = Number(searchParams.get("page") || "1");
  const initialStatus = searchParams.get("status") || "ALL";
  const initialTopic = searchParams.get("topic") || "ALL";

  const [page, setPage] = useState(initialPage);
  const [status, setStatus] = useState(initialStatus);
  const [topic, setTopic] = useState(initialTopic);

  useEffect(() => {
    const params = new URLSearchParams(currentSearch);
    params.set("page", page.toString());
    if (status === "ALL") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    if (topic === "ALL") {
      params.delete("topic");
    } else {
      params.set("topic", topic);
    }
    const nextSearch = params.toString();
    if (nextSearch !== currentSearch) {
      router.replace(`${pathname}?${nextSearch}`);
    }
  }, [page, status, topic, pathname, router, currentSearch]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["support-cases", { page: page - 1, size: 10, status, topic }],
    queryFn: () => getSupportCases(page - 1, 10, status, topic),
  });

  return (
    <DataTableShell
      toolbar={
        <Toolbar searchPlaceholder={t.filters.supportSearchUnavailable}>
          <select
            aria-label={t.filters.caseStatus}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[180px]"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">{t.filters.allStatuses}</option>
            <option value="OPEN">{t.status.OPEN}</option>
            <option value="IN_PROGRESS">{t.status.IN_PROGRESS}</option>
            <option value="RESOLVED">{t.status.RESOLVED}</option>
            <option value="CLOSED">{t.status.CLOSED}</option>
          </select>
          <select
            aria-label={t.filters.supportTopic}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[220px]"
            value={topic}
            onChange={(event) => {
              setTopic(event.target.value);
              setPage(1);
            }}
          >
            {topics.map((item) => (
              <option key={item} value={item}>{t.topics[item] ?? item}</option>
            ))}
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
            <TableHead>{t.table.created}</TableHead>
            <TableHead>{t.table.status}</TableHead>
            <TableHead>{t.table.topic}</TableHead>
            <TableHead>{t.table.user}</TableHead>
            <TableHead>{t.table.transaction}</TableHead>
            <TableHead>{t.table.assigned}</TableHead>
            <TableHead className="text-right">{t.table.action}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows columns={7} />
          ) : isError ? (
            <ErrorTableRow colSpan={7} title={t.state.supportError} onRetry={() => refetch()} />
          ) : !data?.items.length ? (
            <EmptyTableRow colSpan={7} title={t.state.supportEmpty} description={t.state.supportEmptyDescription} />
          ) : (
            data.items.map((item) => (
              <TableRow key={item.caseId}>
                <TableCell><Timestamp value={item.createdAt} /></TableCell>
                <TableCell><StatusBadge status={item.status} /></TableCell>
                <TableCell className="font-medium">{t.topics[item.topic] ?? item.topic}</TableCell>
                <TableCell className="max-w-[9rem] break-all font-mono text-xs">{short(item.userId)}</TableCell>
                <TableCell className="max-w-[9rem] break-all font-mono text-xs">
                  {item.relatedTransactionId ? short(item.relatedTransactionId) : "-"}
                </TableCell>
                <TableCell className="max-w-[9rem] break-all font-mono text-xs">
                  {item.assignedAdminId ? short(item.assignedAdminId) : t.common.unassigned}
                </TableCell>
                <TableCell className="text-right">
                  <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={`/support/${item.caseId}`}>
                    {t.actions.open}
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}

function short(value: string) {
  return value.length <= 12 ? value : `${value.slice(0, 8)}...`;
}
