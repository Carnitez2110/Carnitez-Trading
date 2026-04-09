import { render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

jest.mock("@/lib/trading/actions", () => ({
  requestMarketScan: jest.fn(),
}));

import { SideNav } from "@/components/layout/side-nav";

describe("SideNav", () => {
  it("renders the brand subtitle", () => {
    render(<SideNav />);
    expect(screen.getByText("Private Wealth")).toBeInTheDocument();
    expect(screen.getByText("Institutional Grade")).toBeInTheDocument();
  });

  it("renders all navigation items", () => {
    render(<SideNav />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("AI Insights")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders the Run Market Scan button", () => {
    render(<SideNav />);
    expect(screen.getByText("Run Market Scan")).toBeInTheDocument();
  });
});
