import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";

describe("LoginPage", () => {
  async function renderLogin(searchParams = {}) {
    const ui = await LoginPage({ searchParams: Promise.resolve(searchParams) });
    render(ui);
  }

  it("renders the brand name", async () => {
    await renderLogin();
    expect(screen.getByText("Carnitez Trading")).toBeInTheDocument();
  });

  it("renders the email input", async () => {
    await renderLogin();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("renders the submit button", async () => {
    await renderLogin();
    expect(
      screen.getByRole("button", { name: /send magic link/i })
    ).toBeInTheDocument();
  });

  it("shows the sent confirmation when ?sent=1 is set", async () => {
    await renderLogin({ sent: "1" });
    expect(
      screen.getByText(/check your email/i)
    ).toBeInTheDocument();
  });

  it("shows an error message when ?error is set", async () => {
    await renderLogin({ error: "something broke" });
    expect(screen.getByText("something broke")).toBeInTheDocument();
  });
});
