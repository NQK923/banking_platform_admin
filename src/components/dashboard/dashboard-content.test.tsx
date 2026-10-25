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

  it("renders telemetry unavailable state without incomplete release copy when query fails", async () => {
    vi.spyOn(actions, "getLiveMetrics").mockRejectedValue(new Error("Metrics endpoint unavailable"));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Live telemetry unavailable")).toBeDefined();
      expect(screen.getAllByText("Telemetry unavailable").length).toBeGreaterThan(0);
    });
    expect(screen.queryByText(["Telemetry", "pending"].join(" "))).toBeNull();
    expect(
      screen.queryByText(["Failure trend charts", "will appear", "when the", "metrics", "API", "is wired."].join(" "))
    ).toBeNull();
  });
});
