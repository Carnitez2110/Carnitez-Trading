import { render, screen } from "@testing-library/react";
import { ConfidenceRing } from "@/components/ui/confidence-ring";

describe("ConfidenceRing", () => {
  it("renders the percentage", () => {
    render(<ConfidenceRing percentage={85} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders the label", () => {
    render(<ConfidenceRing percentage={60} />);
    expect(screen.getByText("Confidence")).toBeInTheDocument();
  });
});
