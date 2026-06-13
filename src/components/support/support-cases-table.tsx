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
        <Toolbar searchPlaceholder="Search is not available for support cases yet">
          <select
            aria-label="Filter by case status"
            className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[180px]"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            aria-label="Filter by support topic"
            className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[220px]"
            value={topic}
            onChange={(event) => {
              setTopic(event.target.value);
              setPage(1);
            }}
          >
            {topics.map((item) => (
              <option key={item} value={item}>{item === "ALL" ? "All Topics" : item}</option>
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
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeletonRows columns={7} />
          ) : isError ? (
            <ErrorTableRow colSpan={7} title="Error loading support cases." onRetry={() => refetch()} />
          ) : !data?.items.length ? (
            <EmptyTableRow colSpan={7} title="No support cases found." description="Cases appear here after a user requests human support." />
          ) : (
            data.items.map((item) => (
              <TableRow key={item.caseId}>
                <TableCell><Timestamp value={item.createdAt} /></TableCell>
                <TableCell><StatusBadge status={item.status} /></TableCell>
                <TableCell className="font-medium">{item.topic}</TableCell>
                <TableCell className="max-w-[9rem] break-all font-mono text-xs">{short(item.userId)}</TableCell>
                <TableCell className="max-w-[9rem] break-all font-mono text-xs">
                  {item.relatedTransactionId ? short(item.relatedTransactionId) : "-"}
                </TableCell>
                <TableCell className="max-w-[9rem] break-all font-mono text-xs">
                  {item.assignedAdminId ? short(item.assignedAdminId) : "Unassigned"}
                </TableCell>
                <TableCell className="text-right">
                  <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={`/support/${item.caseId}`}>
                    Open
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
