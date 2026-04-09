import { render, screen } from "@testing-library/react";

import DashboardPage from "@/app/(app)/page";
import PortfolioPage from "@/app/(app)/portfolio/page";
import MarketsPage from "@/app/(app)/markets/page";
import InsightsPage from "@/app/(app)/insights/page";
import SettingsPage from "@/app/(app)/settings/page";

describe("Page routes", () => {
  it("renders Dashboard page", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
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
