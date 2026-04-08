import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders bullish badge", () => {
    render(<Badge sentiment="bullish" />);
    expect(screen.getByText("BULLISH")).toBeInTheDocument();
  });

  it("renders bearish badge", () => {
    render(<Badge sentiment="bearish" />);
    expect(screen.getByText("BEARISH")).toBeInTheDocument();
  });

  it("renders neutral badge", () => {
    render(<Badge sentiment="neutral" />);
    expect(screen.getByText("NEUTRAL")).toBeInTheDocument();
  });
});
