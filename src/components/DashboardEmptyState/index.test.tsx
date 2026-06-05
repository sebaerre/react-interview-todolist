import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardEmptyState } from ".";

describe("DashboardEmptyState", () => {
  it('renders the "No lists yet" message', () => {
    render(<DashboardEmptyState />);
    expect(
      screen.getByText("No lists yet. Create one to get started."),
    ).toBeInTheDocument();
  });

  it("renders the empty-list icon", () => {
    render(<DashboardEmptyState />);
    expect(screen.getByLabelText("empty-list")).toBeInTheDocument();
  });
});
