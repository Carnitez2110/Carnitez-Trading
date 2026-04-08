import { render, screen } from "@testing-library/react";
import { TopNav } from "@/components/layout/top-nav";

describe("TopNav", () => {
  it("renders the brand name", () => {
    render(<TopNav />);
    expect(screen.getByText("The Financial Architect")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<TopNav />);
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Markets")).toBeInTheDocument();
    expect(screen.getByText("Signals")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<TopNav />);
    expect(screen.getByPlaceholderText("Search markets...")).toBeInTheDocument();
  });
});
