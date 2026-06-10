import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AccountsTable } from "./accounts-table";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as actions from "@/actions/accounts.actions";

// Mock the server action
vi.mock("@/actions/accounts.actions", () => ({
  getAccounts: vi.fn(),
  suspendAccount: vi.fn(),
}));

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/accounts",
  useSearchParams: () => new URLSearchParams(),
}));

describe("AccountsTable", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AccountsTable />
      </QueryClientProvider>
    );
  };

  it("consumes backend envelope and changing page refetches with right query params", async () => {
    vi.spyOn(actions, "getAccounts").mockResolvedValue({
      items: [
        { id: "1", email: "test@example.com", phoneNumber: null, status: "ACTIVE", balance: "100.00", currency: "VND", createdAt: "2024-01-01" },
      ],
      page: 0,
      size: 10,
      totalElements: 11,
      totalPages: 2,
    });

    renderComponent();

    // Verify backend envelope is consumed (shows Total: 11)
    await waitFor(() => {
      expect(screen.getByText("Showing page 1 of 2 (Total: 11)")).toBeDefined();
    });

    // Click Next page
    const nextButton = screen.getByRole("button", { name: "Next" });
    fireEvent.click(nextButton);

    // Assert the URL is updated
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/accounts?page=2");
    });
    
    // Assert the server action is called with page 1 (0-indexed for backend)
    expect(actions.getAccounts).toHaveBeenCalledWith(1, 10, "");
  });
});
