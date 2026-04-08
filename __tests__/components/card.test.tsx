import { render, screen } from "@testing-library/react";
import { Card } from "@/components/ui/card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("applies nested variant", () => {
    const { container } = render(<Card variant="nested">Nested</Card>);
    expect(container.firstChild).toHaveClass("bg-surface-container-high");
  });
});
