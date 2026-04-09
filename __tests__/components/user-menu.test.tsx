import { render, screen } from "@testing-library/react";
import { UserMenu } from "@/components/layout/user-menu";

const getUserMock = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn().mockImplementation(async () => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}));

jest.mock("@/lib/auth/actions", () => ({
  signOut: jest.fn(),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    getUserMock.mockReset();
  });

  it("renders the user email when signed in", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { email: "trader@example.com" } },
      error: null,
    });

    const ui = await UserMenu();
    render(ui!);
    expect(screen.getByText("trader@example.com")).toBeInTheDocument();
  });

  it("renders a sign out button when signed in", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { email: "trader@example.com" } },
      error: null,
    });

    const ui = await UserMenu();
    render(ui!);
    expect(
      screen.getByRole("button", { name: /sign out/i })
    ).toBeInTheDocument();
  });

  it("returns null when no user is signed in", async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const ui = await UserMenu();
    expect(ui).toBeNull();
  });
});
