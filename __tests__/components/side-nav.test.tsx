import { render, screen } from "@testing-library/react";
import { SideNav } from "@/components/layout/side-nav";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

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

  it("renders the New Trade button", () => {
    render(<SideNav />);
    expect(screen.getByText("New Trade")).toBeInTheDocument();
  });
});
