import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RightPanel } from ".";

describe("RightPanel", () => {
  describe("remaining count text", () => {
    it('shows "1 todo remaining" (singular) when remaining=1', () => {
      render(
        <RightPanel
          remaining={1}
          onCompleteAllClick={vi.fn()}
          completeAllDisabled={false}
          completeAllPending={false}
        />,
      );
      expect(screen.getByText(/1/)).toBeInTheDocument();
      expect(screen.getByText(/todo remaining/)).toBeInTheDocument();
    });

    it('shows "todos remaining" (plural) when remaining=0', () => {
      render(
        <RightPanel
          remaining={0}
          onCompleteAllClick={vi.fn()}
          completeAllDisabled={false}
          completeAllPending={false}
        />,
      );
      expect(screen.getByText(/todos remaining/)).toBeInTheDocument();
    });

    it('shows "todos remaining" (plural) when remaining=5', () => {
      render(
        <RightPanel
          remaining={5}
          onCompleteAllClick={vi.fn()}
          completeAllDisabled={false}
          completeAllPending={false}
        />,
      );
      expect(screen.getByText(/todos remaining/)).toBeInTheDocument();
    });
  });

  describe('"Complete all" button', () => {
    it("is enabled when completeAllDisabled=false", () => {
      render(
        <RightPanel
          remaining={2}
          onCompleteAllClick={vi.fn()}
          completeAllDisabled={false}
          completeAllPending={false}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Complete all" }),
      ).toBeEnabled();
    });

    it("is disabled when completeAllDisabled=true", () => {
      render(
        <RightPanel
          remaining={0}
          onCompleteAllClick={vi.fn()}
          completeAllDisabled={true}
          completeAllPending={false}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Complete all" }),
      ).toBeDisabled();
    });

    it("calls onCompleteAllClick when clicked and enabled", async () => {
      const user = userEvent.setup();
      const onCompleteAllClick = vi.fn();
      render(
        <RightPanel
          remaining={2}
          onCompleteAllClick={onCompleteAllClick}
          completeAllDisabled={false}
          completeAllPending={false}
        />,
      );
      await user.click(screen.getByRole("button", { name: "Complete all" }));
      expect(onCompleteAllClick).toHaveBeenCalledOnce();
    });

    it("does NOT call onCompleteAllClick when the button is disabled", async () => {
      const user = userEvent.setup();
      const onCompleteAllClick = vi.fn();
      render(
        <RightPanel
          remaining={0}
          onCompleteAllClick={onCompleteAllClick}
          completeAllDisabled={true}
          completeAllPending={false}
        />,
      );
      await user.click(screen.getByRole("button", { name: "Complete all" }));
      expect(onCompleteAllClick).not.toHaveBeenCalled();
    });

    it("shows spinner if completeAllPending is true", async () => {
      const user = userEvent.setup();
      const onCompleteAllClick = vi.fn();
      render(
        <RightPanel
          remaining={0}
          onCompleteAllClick={onCompleteAllClick}
          completeAllDisabled={false}
          completeAllPending={true}
        />,
      );
      await user.click(screen.getByRole("button", { name: "Complete all" }));
      expect(screen.getByLabelText("Pending complete all")).toBeInTheDocument();
    });
  });
});
