import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from ".";

describe("ProgressBar", () => {
  describe("percentage calculation", () => {
    it("shows 0% when total is 0 (division-by-zero guard)", () => {
      render(<ProgressBar completed={0} total={0} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "0",
      );
    });

    it("shows 0% when completed is 0 and total > 0", () => {
      render(<ProgressBar completed={0} total={5} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "0",
      );
    });

    it("shows 50% for 2 of 4 completed", () => {
      render(<ProgressBar completed={2} total={4} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "50",
      );
    });

    it("rounds to the nearest integer (1/3 → 33)", () => {
      render(<ProgressBar completed={1} total={3} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "33",
      );
    });

    it("shows 100% when all todos are completed", () => {
      render(<ProgressBar completed={5} total={5} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "100",
      );
    });
  });

  describe("aria attributes", () => {
    it("sets aria-valuemin=0 and aria-valuemax=100", () => {
      render(<ProgressBar completed={1} total={2} />);
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuemin", "0");
      expect(bar).toHaveAttribute("aria-valuemax", "100");
    });

    it("sets a descriptive aria-label with the completed/total counts", () => {
      render(<ProgressBar completed={2} total={5} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-label",
        "2 of 5 todos completed",
      );
    });
  });

  describe("text display", () => {
    it('shows "completed / total" as a readable count', () => {
      render(<ProgressBar completed={3} total={7} />);
      expect(screen.getByText("3 / 7")).toBeInTheDocument();
    });
  });
});
