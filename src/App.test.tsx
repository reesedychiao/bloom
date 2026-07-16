import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

// Tests run without Supabase env vars, so the app should land on the
// sign-in card in its "not connected" state rather than crash.
describe("App", () => {
  it("renders the sign-in card when Supabase is not configured", async () => {
    render(<App />);
    expect(
      await screen.findByRole("heading", { name: "Bloom" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/isn’t connected/i)).toBeInTheDocument();
  });
});
