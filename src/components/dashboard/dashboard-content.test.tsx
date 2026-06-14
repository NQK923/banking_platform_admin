import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { DashboardContent } from "./dashboard-content";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as actions from "@/actions/operations.actions";
import { renderWithLanguage } from "@/test/render-with-language";

// Mock the server action
vi.mock("@/actions/operations.actions", () => ({
  getLiveMetrics: vi.fn(),
}));

// Provide a mock ResizeObserver for recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("DashboardContent", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.spyOn(actions, "getLiveMetrics").mockResolvedValue({
      transferFailedTotal: 0,
      transferCompensatingTotal: 0,
      walletSagaLatency: 12,
      walletConsumerLag: 0,
      walletDlqDepth: 0,
      reconciliationDrift: 0,
    });
  });

  const renderComponent = () => {
    return renderWithLanguage(
      <QueryClientProvider client={queryClient}>
        <DashboardContent />
      </QueryClientProvider>
    );
  };

  it("renders polling state when loading or successful", () => {
    renderComponent();
    expect(screen.getByText("Polling (5s)")).toBeDefined();
  });

  it("renders telemetry pending state gracefully when query fails", async () => {
    vi.spyOn(actions, "getLiveMetrics").mockRejectedValue(new Error("Metrics endpoint unavailable"));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Telemetry pending")).toBeDefined();
      expect(screen.getAllByText("Metrics not configured").length).toBeGreaterThan(0);
    });
  });
});
