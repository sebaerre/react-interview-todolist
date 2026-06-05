import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as api from "../../../../api";
import { renderWithClient, createQueryClient } from "../../../../test/utils";
import { qk } from "../../../../api";
import { TodoListEditForm } from ".";

vi.mock("../../../../api", () => import("../../../../test/apiMock"));

function renderForm(
  overrides: {
    listName?: string;
    listId?: string;
    setIsEditing?: (value: boolean) => void;
  } = {},
) {
  const setIsEditing = overrides.setIsEditing ?? vi.fn();
  const listId = overrides.listId ?? "list-1";
  const listName = overrides.listName ?? "Work Todos";

  const qc = createQueryClient();
  qc.setQueryData(qk.lists(), [{ id: listId, name: listName }]);
  renderWithClient(
    <TodoListEditForm
      listId={listId}
      listName={listName}
      setIsEditing={setIsEditing}
    />,
    qc,
  );
  return { setIsEditing, qc };
}

describe("TodoListEditForm", () => {
  afterEach(() => vi.clearAllMocks());

  describe("initial render", () => {
    it("renders the input pre-populated with the current list name", () => {
      renderForm();
      expect(screen.getByDisplayValue("Work Todos")).toBeInTheDocument();
    });

    it("renders a Save button", () => {
      renderForm();
      expect(
        screen.getByRole("button", { name: "Save todo list" }),
      ).toBeInTheDocument();
    });
  });

  describe("editing", () => {
    it("updates the input value as the user types", async () => {
      const user = userEvent.setup();
      renderForm();
      const input = screen.getByDisplayValue("Work Todos");
      await user.clear(input);
      await user.type(input, "New Name");
      expect(screen.getByDisplayValue("New Name")).toBeInTheDocument();
    });
  });

  describe("save on submit", () => {
    it("calls updateList with the trimmed new name on Enter", async () => {
      const user = userEvent.setup();
      vi.mocked(api.updateList).mockResolvedValue({
        id: "list-1",
        name: "New Name",
      });
      renderForm();
      const input = screen.getByDisplayValue("Work Todos");
      await user.clear(input);
      await user.type(input, "New Name");
      await user.keyboard("{Enter}");
      await waitFor(() =>
        expect(api.updateList).toHaveBeenCalledWith("list-1", "New Name"),
      );
    });

    it("does NOT call updateList when the name is unchanged", async () => {
      const user = userEvent.setup();
      renderForm();
      await user.keyboard("{Enter}");
      expect(api.updateList).not.toHaveBeenCalled();
    });

    it("does NOT call updateList when the trimmed value is empty", async () => {
      const user = userEvent.setup();
      renderForm();
      const input = screen.getByDisplayValue("Work Todos");
      await user.clear(input);
      await user.keyboard("{Enter}");
      expect(api.updateList).not.toHaveBeenCalled();
    });

    it("shows a Spinner while the mutation is pending", async () => {
      const user = userEvent.setup();
      vi.mocked(api.updateList).mockReturnValue(new Promise(() => {}));
      renderForm();
      const input = screen.getByDisplayValue("Work Todos");
      await user.clear(input);
      await user.type(input, "New Name");
      await user.keyboard("{Enter}");
      await waitFor(() =>
        expect(screen.getByRole("status")).toBeInTheDocument(),
      );
    });

    it("disables the input while pending", async () => {
      const user = userEvent.setup();
      vi.mocked(api.updateList).mockReturnValue(new Promise(() => {}));
      renderForm();
      const input = screen.getByDisplayValue("Work Todos");
      await user.clear(input);
      await user.type(input, "New Name");
      await user.keyboard("{Enter}");
      await waitFor(() =>
        expect(screen.getByLabelText("Rename Work Todos")).toBeDisabled(),
      );
    });
  });

  describe("cancel", () => {
    it("calls setIsEditing(false) when Escape is pressed", async () => {
      const user = userEvent.setup();
      const { setIsEditing } = renderForm();
      await user.keyboard("{Escape}");
      expect(setIsEditing).toHaveBeenCalledWith(false);
    });

    it("calls setIsEditing(false) when clicking outside the form", () => {
      const { setIsEditing } = renderForm();
      fireEvent.mouseDown(document.body);
      expect(setIsEditing).toHaveBeenCalledWith(false);
    });
  });

  describe("error state", () => {
    it('shows "Something went wrong" when the mutation rejects', async () => {
      const user = userEvent.setup();
      vi.mocked(api.updateList).mockRejectedValue(new Error("Server error"));
      renderForm();
      const input = screen.getByDisplayValue("Work Todos");
      await user.clear(input);
      await user.type(input, "New Name");
      await user.keyboard("{Enter}");
      expect(
        await screen.findByText("Something went wrong"),
      ).toBeInTheDocument();
    });
  });
});
