import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DashboardContent } from "./dashboard-content";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as actions from "@/actions/operations.actions";

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
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DashboardContent />
      </QueryClientProvider>
    );
  };

  it("renders polling state when loading or successful", () => {
    renderComponent();
    expect(screen.getByText("Polling (5s)")).toBeDefined();
  });

  it("renders unavailable state gracefully when query fails", async () => {
    vi.spyOn(actions, "getLiveMetrics").mockRejectedValue(new Error("Metrics endpoint unavailable"));

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0);
    });
  });
});
