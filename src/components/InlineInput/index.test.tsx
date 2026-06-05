import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InlineInput } from ".";

describe("InlineInput", () => {
  describe("label rendering", () => {
    it("renders a visually-hidden label (sr-only) when hideLabel is true (default)", () => {
      render(<InlineInput label="My label" />);
      expect(screen.getByText("My label")).toHaveClass("sr-only");
    });

    it("renders a visible label when hideLabel is false", () => {
      render(<InlineInput label="My label" hideLabel={false} />);
      expect(screen.getByText("My label")).not.toHaveClass("sr-only");
    });
  });

  describe("aria attributes", () => {
    it("exposes the input via getByLabelText matching the label prop", () => {
      render(<InlineInput label="Todo name" id="todo" />);
      expect(screen.getByLabelText("Todo name")).toBeInTheDocument();
    });

    it("sets aria-invalid=false when no error prop is given", () => {
      render(<InlineInput label="Todo name" />);
      expect(screen.getByLabelText("Todo name")).toHaveAttribute(
        "aria-invalid",
        "false",
      );
    });

    it("sets aria-invalid=true when an error prop is given", () => {
      render(<InlineInput label="Todo name" error="Required" />);
      expect(screen.getByLabelText("Todo name")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it('sets aria-describedby to "{id}-error" when an error is given', () => {
      render(<InlineInput label="Todo name" id="todo" error="Required" />);
      expect(screen.getByLabelText("Todo name")).toHaveAttribute(
        "aria-describedby",
        "todo-error",
      );
    });

    it("does NOT set aria-describedby when no error is given", () => {
      render(<InlineInput label="Todo name" id="todo" />);
      expect(screen.getByLabelText("Todo name")).not.toHaveAttribute(
        "aria-describedby",
      );
    });
  });

  describe("onChange adapter", () => {
    it("calls onChange with the string value (not the SyntheticEvent)", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <InlineInput label="Todo name" onChange={onChange} defaultValue="" />,
      );
      await user.type(screen.getByLabelText("Todo name"), "hi");
      expect(onChange).toHaveBeenLastCalledWith("hi");
    });

    it("does not throw when onChange is undefined", async () => {
      const user = userEvent.setup();
      render(<InlineInput label="Todo name" defaultValue="" />);
      await expect(
        user.type(screen.getByLabelText("Todo name"), "abc"),
      ).resolves.not.toThrow();
    });
  });

  describe("autoFocus", () => {
    it("focuses the input on mount when autoFocus=true (default)", () => {
      render(<InlineInput label="Todo name" />);
      expect(screen.getByLabelText("Todo name")).toHaveFocus();
    });

    it("does NOT auto-focus when autoFocus=false", () => {
      render(<InlineInput label="Todo name" autoFocus={false} />);
      expect(screen.getByLabelText("Todo name")).not.toHaveFocus();
    });
  });

  describe("passthrough props", () => {
    it("passes disabled through to the native input", () => {
      render(<InlineInput label="Todo name" disabled />);
      expect(screen.getByLabelText("Todo name")).toBeDisabled();
    });

    it("passes value through to the native input", () => {
      render(<InlineInput label="Todo name" value="hello" readOnly />);
      expect(screen.getByLabelText("Todo name")).toHaveValue("hello");
    });
  });
});
