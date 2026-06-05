import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from ".";
import { TodoStatus } from "@types";

describe("StatusBadge", () => {
  describe("default label (no children)", () => {
    it('renders "Pending" for TodoStatus.Pending', () => {
      render(<StatusBadge status={TodoStatus.Pending} />);
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it('renders "Done" for TodoStatus.Done', () => {
      render(<StatusBadge status={TodoStatus.Done} />);
      expect(screen.getByText("Done")).toBeInTheDocument();
    });

    it('renders "Syncing" for TodoStatus.Syncing', () => {
      render(<StatusBadge status={TodoStatus.Syncing} />);
      expect(screen.getByText("Syncing")).toBeInTheDocument();
    });
  });

  describe("custom children", () => {
    it("renders children instead of the status string", () => {
      render(<StatusBadge status={TodoStatus.Done}>Completed!</StatusBadge>);
      expect(screen.getByText("Completed!")).toBeInTheDocument();
      expect(screen.queryByText("Done")).not.toBeInTheDocument();
    });
  });

  describe("className passthrough", () => {
    it("merges extra className onto the badge element", () => {
      render(
        <StatusBadge status={TodoStatus.Pending} className="extra-class" />,
      );
      expect(screen.getByText("Pending")).toHaveClass("extra-class");
    });
  });
});
