import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from ".";

describe("Spinner", () => {
  it('renders a role="status" element', () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it('defaults aria-label to "Loading"', () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("uses a custom label when the label prop is provided", () => {
    render(<Spinner label="Saving" />);
    expect(screen.getByRole("status", { name: "Saving" })).toBeInTheDocument();
  });

  it("applies the given size via inline style", () => {
    render(<Spinner size={24} />);
    const el = screen.getByRole("status");
    expect(el).toHaveStyle({ width: "24px", height: "24px" });
  });

  it("uses the default size of 32 when no size prop is given", () => {
    render(<Spinner />);
    const el = screen.getByRole("status");
    expect(el).toHaveStyle({ width: "32px", height: "32px" });
  });
});
