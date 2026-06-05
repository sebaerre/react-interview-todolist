import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateTodoItemForm } from ".";

function renderForm(
  value = "",
  overrides: Partial<React.ComponentProps<typeof CreateTodoItemForm>> = {},
) {
  const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
  const handleChange = vi.fn();
  const handleCancel = vi.fn();
  render(
    <CreateTodoItemForm
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      handleCancel={handleCancel}
      value={value}
      {...overrides}
    />,
  );
  return { handleSubmit, handleChange, handleCancel };
}

describe("CreateTodoItemForm", () => {
  it('renders the "New todo name" input', () => {
    renderForm();
    expect(screen.getByLabelText("New todo name")).toBeInTheDocument();
  });

  it("renders the input with the current value", () => {
    renderForm("Buy oat milk");
    expect(screen.getByLabelText("New todo name")).toHaveValue("Buy oat milk");
  });

  it("calls handleChange when the user types", async () => {
    const user = userEvent.setup();
    const { handleChange } = renderForm();
    await user.type(screen.getByLabelText("New todo name"), "a");
    expect(handleChange).toHaveBeenCalled();
  });

  it("calls handleSubmit when the form is submitted", async () => {
    const user = userEvent.setup();
    const { handleSubmit } = renderForm("Buy eggs");
    await user.type(screen.getByLabelText("New todo name"), "{Enter}");
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("calls handleCancel via onBlur when the input value is empty", () => {
    const { handleCancel } = renderForm("");
    fireEvent.blur(screen.getByLabelText("New todo name"));
    expect(handleCancel).toHaveBeenCalled();
  });

  it("does NOT call handleCancel on blur when the input value is non-empty", () => {
    const { handleCancel } = renderForm("Buy eggs");
    fireEvent.blur(screen.getByLabelText("New todo name"));
    expect(handleCancel).not.toHaveBeenCalled();
  });
});
