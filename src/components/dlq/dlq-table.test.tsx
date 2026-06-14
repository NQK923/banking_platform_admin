import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { DlqTable } from "./dlq-table";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as actions from "@/actions/operations.actions";
import { toast } from "sonner";
import { renderWithLanguage } from "@/test/render-with-language";

vi.mock("@/actions/operations.actions", () => ({
  getDlqMessages: vi.fn(),
  replayDlqMessage: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/dlq",
  useSearchParams: () => new URLSearchParams(),
}));

describe("DlqTable Replay Flows", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.spyOn(actions, "getDlqMessages").mockResolvedValue({
      items: [
        {
          eventId: "ev-1",
          partition: 0,
          offset: 123,
          topic: "wallet.events",
          eventType: "TransferCompleted",
          errorReason: "DB connection failed",
          attempts: 1,
          createdAt: "2024-01-01",
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
  });

  const renderComponent = () => {
    return renderWithLanguage(
      <QueryClientProvider client={queryClient}>
        <DlqTable />
      </QueryClientProvider>
    );
  };

  it("invokes replay single message with right payload", async () => {
    vi.spyOn(actions, "replayDlqMessage").mockResolvedValue(undefined);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("DB connection failed")).toBeDefined();
    });

    // Click row-level Replay button
    fireEvent.click(screen.getByRole("button", { name: "Replay" }));

    // Click Confirm
    const confirmButton = screen.getByRole("button", { name: "Replay Message" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(actions.replayDlqMessage).toHaveBeenCalledWith(0, 123, false);
      expect(toast.success).toHaveBeenCalledWith("Message replayed successfully");
    });
  });

  it("invokes replay all with right payload and handles error", async () => {
    vi.spyOn(actions, "replayDlqMessage").mockRejectedValue(new Error("Bulk replay failed"));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("DB connection failed")).toBeDefined();
    });

    // Click global Replay All button
    fireEvent.click(screen.getByRole("button", { name: "Replay All" }));

    // Click Confirm
    const confirmButton = screen.getByRole("button", { name: "Confirm Bulk Replay" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(actions.replayDlqMessage).toHaveBeenCalledWith(undefined, undefined, true);
      expect(toast.error).toHaveBeenCalledWith("Bulk replay failed");
    });
  });
});
