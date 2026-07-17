import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

// Force the unconfigured state so the test doesn't depend on whether
// .env.local exists on the machine running it (Vite loads it in test mode).
vi.mock("./lib/supabase", () => ({ supabase: null }));

describe("App", () => {
  it("renders the sign-in card when Supabase is not configured", async () => {
    render(<App />);
    expect(
      await screen.findByRole("heading", { name: "Bloom" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/isn’t connected/i)).toBeInTheDocument();
  });
});
