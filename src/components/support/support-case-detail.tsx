"use client";

import { closeSupportCase, getSupportCase, replyToSupportCase } from "@/actions/support.actions";
import { AppCard } from "@/components/admin/app-card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Timestamp } from "@/components/admin/timestamp";
import { Button } from "@/components/ui/button";
import { SupportChatMessage } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, MessageSquareReply, RefreshCw } from "lucide-react";
import { useState } from "react";

export function SupportCaseDetail({ caseId }: { caseId: string }) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const [resolution, setResolution] = useState("");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["support-case", caseId],
    queryFn: () => getSupportCase(caseId),
  });

  const replyMutation = useMutation({
    mutationFn: () => replyToSupportCase(caseId, reply),
    onSuccess: async () => {
      setReply("");
      await queryClient.invalidateQueries({ queryKey: ["support-case", caseId] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => closeSupportCase(caseId, resolution || "Resolved by support operator."),
    onSuccess: async () => {
      setResolution("");
      await queryClient.invalidateQueries({ queryKey: ["support-case", caseId] });
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading support case...</div>;
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <AppCard className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Could not load support case.</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </AppCard>
      </div>
    );
  }

  const isClosed = data.status === "CLOSED";

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Support Case"
        description="Review AI transcript, transaction facts, and operator actions."
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <AppCard>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={data.status} />
            <StatusBadge status={data.topic} />
          </div>
          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <Info label="Case ID" value={data.caseId} mono />
            <Info label="Session ID" value={data.sessionId} mono />
            <Info label="Related transaction" value={data.relatedTransactionId || "-"} mono />
            <Info label="Summary" value={data.summary} />
          </dl>
        </AppCard>

        <AppCard>
          <h2 className="mb-3 text-base font-semibold">Transaction Snapshot</h2>
          {data.transactionSnapshot ? (
            <div className="space-y-3 text-sm">
              <Info label="Transaction ID" value={data.transactionSnapshot.id} mono />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={data.transactionSnapshot.status} />
              </div>
              <Info label="Failure reason" value={data.transactionSnapshot.failureReason || "-"} />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Compensated</span>
                {data.transactionSnapshot.compensated ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmed
                  </span>
                ) : (
                  <span>No</span>
                )}
              </div>
              <Info label="TraceId" value={data.transactionSnapshot.traceId || "-"} mono />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No transaction linked to this case.</p>
          )}
        </AppCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <AppCard>
          <h2 className="mb-4 text-base font-semibold">Conversation Transcript</h2>
          <div className="space-y-3">
            {data.messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages recorded.</p>
            ) : (
              data.messages.map((message) => (
                <TranscriptMessage key={message.id} message={message} />
              ))
            )}
          </div>
        </AppCard>

        <AppCard>
          <h2 className="mb-4 text-base font-semibold">Operator Actions</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="support-reply">
                Reply to user
              </label>
              <textarea
                id="support-reply"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                disabled={isClosed || replyMutation.isPending}
                placeholder="Write a concise support response..."
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                className="mt-2 w-full"
                disabled={isClosed || !reply.trim() || replyMutation.isPending}
                onClick={() => replyMutation.mutate()}
              >
                <MessageSquareReply className="mr-2 h-4 w-4" />
                Send Reply
              </Button>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="support-resolution">
                Resolution
              </label>
              <textarea
                id="support-resolution"
                value={resolution}
                onChange={(event) => setResolution(event.target.value)}
                disabled={isClosed || closeMutation.isPending}
                placeholder="Refund status explained to user."
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                className="mt-2 w-full"
                variant="outline"
                disabled={isClosed || closeMutation.isPending}
                onClick={() => closeMutation.mutate()}
              >
                Close Case
              </Button>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="mb-1 text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className={mono ? "break-all font-mono text-xs" : "break-words"}>{value}</dd>
    </div>
  );
}

function TranscriptMessage({ message }: { message: SupportChatMessage }) {
  const isUser = message.senderType === "USER";
  const isAdmin = message.senderType === "ADMIN";
  return (
    <div className={`rounded-md border p-3 ${isUser ? "bg-primary/5" : isAdmin ? "bg-emerald-500/10" : "bg-muted/40"}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold">{message.senderType}</span>
        <Timestamp value={message.createdAt} />
      </div>
      <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>
    </div>
  );
}
