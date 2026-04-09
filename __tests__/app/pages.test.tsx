import { render, screen } from "@testing-library/react";

import PortfolioPage from "@/app/(app)/portfolio/page";
import MarketsPage from "@/app/(app)/markets/page";
import InsightsPage from "@/app/(app)/insights/page";
import SettingsPage from "@/app/(app)/settings/page";

// Mock Supabase server client for the async Dashboard page.
const getUserMock = jest.fn();
const fromMock = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn().mockImplementation(async () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
  })),
}));

// Mock server actions so we don't have to pull in the real trading layer.
jest.mock("@/lib/trading/actions", () => ({
  requestSignal: jest.fn(),
  approveSignal: jest.fn(),
  skipSignal: jest.fn(),
  closePosition: jest.fn(),
  requestMarketScan: jest.fn(),
}));

import DashboardPage from "@/app/(app)/page";

describe("Page routes", () => {
  describe("Dashboard (async)", () => {
    beforeEach(() => {
      getUserMock.mockReset();
      fromMock.mockReset();
    });

    it("shows a sign-in prompt when there's no user", async () => {
      getUserMock.mockResolvedValue({ data: { user: null }, error: null });

      const ui = await DashboardPage();
      render(ui);
      expect(screen.getByText(/not signed in/i)).toBeInTheDocument();
    });

    it("renders the dashboard for an authenticated user with empty data", async () => {
      getUserMock.mockResolvedValue({
        data: { user: { id: "user-1", email: "test@example.com" } },
        error: null,
      });

      // Paper account, holdings, pending signals — all empty / defaults.
      const paperQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { balance_eur: 10000, initial_balance_eur: 10000 },
          error: null,
        }),
      };
      const holdingsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      const signalsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      fromMock.mockImplementation((table: string) => {
        if (table === "paper_account") return paperQuery;
        if (table === "portfolio_holdings") return holdingsQuery;
        if (table === "ai_signals") return signalsQuery;
        throw new Error(`Unexpected table: ${table}`);
      });

      const ui = await DashboardPage();
      render(ui);

      expect(
        screen.getByRole("heading", { name: "Dashboard" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /pending ai signals/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /open positions/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /watchlist/i })
      ).toBeInTheDocument();
    });
  });

  it("renders Portfolio page", () => {
    render(<PortfolioPage />);
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
  });

  it("renders Markets page", () => {
    render(<MarketsPage />);
    expect(screen.getByText("Markets & Watchlist")).toBeInTheDocument();
  });

  it("renders AI Insights page", () => {
    render(<InsightsPage />);
    expect(screen.getByText("AI Insights")).toBeInTheDocument();
  });

  it("renders Settings page", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Settings & Risk Management")).toBeInTheDocument();
  });
});
