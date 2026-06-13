"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDlqMessages, replayDlqMessage } from "@/actions/operations.actions";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, RotateCcw, ShieldAlert } from "lucide-react";
import { DataTableShell } from "@/components/admin/data-table";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { Timestamp } from "@/components/admin/timestamp";
import { EmptyTableRow, ErrorTableRow, TableSkeletonRows } from "@/components/admin/state-views";
import { useLanguage } from "@/components/language-provider";

export function DlqTable() {
  const { dictionary: t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();
  const queryClient = useQueryClient();

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
    queryKey: ["dlq", { page: page - 1, size: 10 }],
    queryFn: () => getDlqMessages(page - 1, 10),
  });
  const messages = data?.items ?? [];

  const replayMutation = useMutation({
    mutationFn: (params: { partition?: number; offset?: number; replayAll: boolean }) =>
      replayDlqMessage(params.partition, params.offset, params.replayAll),
    onSuccess: (_, variables) => {
      toast.success(variables.replayAll ? t.dlq.bulkReplayStarted : t.dlq.messageReplayed);
      queryClient.invalidateQueries({ queryKey: ["dlq"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || t.dlq.replayFailed);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <AlertDialog>
          <AlertDialogTrigger render={
            <Button variant="destructive" disabled={messages.length === 0 || replayMutation.isPending}>
              <ShieldAlert className="h-4 w-4 mr-2" />
              {t.actions.replayAll}
            </Button>
          } />
          <AlertDialogContent className="border-destructive/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                {t.dlq.replayAllQuestion}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t.dlq.replayAllDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={(e) => {
                  e.preventDefault();
                  replayMutation.mutate({ replayAll: true });
                }}
                disabled={replayMutation.isPending}
              >
                {replayMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {t.actions.replaying}
                  </>
                ) : (
                  t.actions.confirmBulkReplay
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

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
              <TableHead>{t.table.createdAt}</TableHead>
              <TableHead>{t.table.eventType}</TableHead>
              <TableHead>{t.table.location}</TableHead>
              <TableHead>{t.table.reason}</TableHead>
              <TableHead className="text-right">{t.table.action}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={5} actionColumn />
            ) : isError ? (
              <ErrorTableRow colSpan={5} title={t.state.dlqError} onRetry={() => refetch()} />
            ) : messages.length === 0 ? (
              <EmptyTableRow colSpan={5} title={t.state.dlqEmpty} description={t.state.dlqEmptyDescription} />
            ) : (
              messages.map((msg) => (
                <TableRow key={msg.eventId}>
                  <TableCell><Timestamp value={msg.createdAt} /></TableCell>
                  <TableCell>
                    <Badge variant="outline">{msg.eventType}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    p:{msg.partition} o:{msg.offset}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal break-words text-sm text-destructive" title={msg.errorReason}>
                    {msg.errorReason}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger render={
                        <Button variant="secondary" size="sm" disabled={replayMutation.isPending}>
                          <RotateCcw className="h-3 w-3 mr-1" />
                          {t.actions.replay}
                        </Button>
                      } />
                      <AlertDialogContent className="border-destructive/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                            {t.dlq.replaySingleQuestion}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.dlq.replaySingleDescription
                              .replace("{eventType}", msg.eventType)
                              .replace("{partition}", String(msg.partition))
                              .replace("{offset}", String(msg.offset))}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.preventDefault();
                              replayMutation.mutate({ partition: msg.partition, offset: msg.offset, replayAll: false });
                            }}
                            disabled={replayMutation.isPending}
                          >
                            {replayMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                {t.actions.replaying}
                              </>
                            ) : (
                              t.actions.replayMessage
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTableShell>
    </div>
  );
}
