import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppHeader } from "./AppHeader";
import { PARENT_APP_URL } from "@/lib/constants";

describe("AppHeader", () => {
  it("renders the app brand and the parent-app link", () => {
    render(<AppHeader />);
    expect(screen.getByText("Soldi_Lab")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /La Famiglia/i });
    expect(link).toHaveAttribute("href", PARENT_APP_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
