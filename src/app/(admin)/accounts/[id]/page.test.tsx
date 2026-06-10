import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AccountDetailPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as actions from "@/actions/accounts.actions";
import { toast } from "sonner";
import { Suspense } from "react";

// Mock the server action
vi.mock("@/actions/accounts.actions", () => ({
  getAccountDetails: vi.fn(),
  getAccountLedger: vi.fn(),
  suspendAccount: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Suspend Confirm Flow", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.spyOn(actions, "getAccountDetails").mockResolvedValue({
      id: "acc-123",
      email: "test@example.com",
      phoneNumber: null,
      status: "ACTIVE",
      balance: "100",
      currency: "VND",
      createdAt: "2024-01-01",
    });

    vi.spyOn(actions, "getAccountLedger").mockResolvedValue([]);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div>Loading...</div>}>
          <AccountDetailPage params={Promise.resolve({ id: "acc-123" })} />
        </Suspense>
      </QueryClientProvider>
    );
  };

  it("invokes suspend action with correct id on confirm and surfaces error", async () => {
    vi.spyOn(actions, "suspendAccount").mockRejectedValue(new Error("Suspend failed"));

    await act(async () => {
      renderComponent();
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeDefined();
    });

    // Click Suspend Account button
    fireEvent.click(screen.getByRole("button", { name: "Suspend Account" }));

    // Click Confirm
    const confirmButton = screen.getByRole("button", { name: "Confirm Suspend" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(actions.suspendAccount).toHaveBeenCalledWith("acc-123");
      expect(toast.error).toHaveBeenCalledWith("Suspend failed");
    });
  });
});
