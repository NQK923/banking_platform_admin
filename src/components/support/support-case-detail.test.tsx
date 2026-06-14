import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SupportCaseDetail } from "./support-case-detail";
import * as actions from "@/actions/support.actions";
import { renderWithLanguage } from "@/test/render-with-language";

vi.mock("@/actions/support.actions", () => ({
  getSupportCase: vi.fn(),
  replyToSupportCase: vi.fn(),
  closeSupportCase: vi.fn(),
}));

describe("SupportCaseDetail", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.spyOn(actions, "getSupportCase").mockResolvedValue({
      caseId: "case-1",
      sessionId: "session-1",
      status: "OPEN",
      topic: "TRANSFER_REFUND",
      relatedTransactionId: "tx-1",
      summary: "User asked whether a failed transfer was refunded.",
      transactionSnapshot: {
        id: "tx-1",
        status: "FAILED",
        failureReason: "CREDIT_FAILED_COMPENSATED",
        compensated: true,
        traceId: "trace-1",
      },
      messages: [
        {
          id: "msg-1",
          sessionId: "session-1",
          senderType: "USER",
          message: "Has my money been refunded?",
          createdAt: "2026-06-13T10:30:00Z",
        },
        {
          id: "msg-2",
          sessionId: "session-1",
          senderType: "AI",
          message: "The transaction shows compensated = true.",
          createdAt: "2026-06-13T10:30:03Z",
        },
      ],
    });
  });

  it("renders case summary, transaction facts, and transcript", async () => {
    renderWithLanguage(
      <QueryClientProvider client={queryClient}>
        <SupportCaseDetail caseId="case-1" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("TRANSFER_REFUND")).toBeDefined();
      expect(screen.getByText("CREDIT_FAILED_COMPENSATED")).toBeDefined();
      expect(screen.getByText("Has my money been refunded?")).toBeDefined();
      expect(screen.getByText("The transaction shows compensated = true.")).toBeDefined();
      expect(screen.getByRole("button", { name: /Send Reply/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /Close Case/i })).toBeDefined();
    });
  });
});
