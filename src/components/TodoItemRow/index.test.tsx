import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as api from "../../api";
import { renderWithClient, createQueryClient } from "../../test/utils";
import { qk } from "../../api";
import { TodoItemRow } from ".";
import type { TodoItem } from "@types";

vi.mock("../../api", () => import("../../test/apiMock"));

const makeItem = (overrides: Partial<TodoItem> = {}): TodoItem => ({
  id: 1,
  todoList: "list-1",
  name: "Buy milk",
  done: false,
  ...overrides,
});

function renderRow(item: TodoItem) {
  const qc = createQueryClient();
  qc.setQueryData(qk.items("list-1"), [item]);
  return {
    ...renderWithClient(<TodoItemRow item={item} listId="list-1" />, qc),
    qc,
  };
}

describe("TodoItemRow", () => {
  afterEach(() => vi.clearAllMocks());

  describe("view mode – pending item", () => {
    it('renders role="checkbox" with the item name as aria-label', () => {
      renderRow(makeItem());
      expect(
        screen.getByRole("checkbox", { name: "Buy milk" }),
      ).toBeInTheDocument();
    });

    it("has aria-checked=false when done=false", () => {
      renderRow(makeItem({ done: false }));
      expect(
        screen.getByRole("checkbox", { name: "Buy milk" }),
      ).toHaveAttribute("aria-checked", "false");
    });

    it('renders a "Pending" StatusBadge', () => {
      renderRow(makeItem());
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("renders the Rename button", () => {
      renderRow(makeItem());
      expect(
        screen.getByRole("button", { name: "Rename Buy milk" }),
      ).toBeInTheDocument();
    });

    it("renders the Delete button", () => {
      renderRow(makeItem());
      expect(
        screen.getByRole("button", { name: "Delete Buy milk" }),
      ).toBeInTheDocument();
    });
  });

  describe("view mode – done item", () => {
    it("has aria-checked=true when done=true", () => {
      renderRow(makeItem({ done: true }));
      expect(
        screen.getByRole("checkbox", { name: "Buy milk" }),
      ).toHaveAttribute("aria-checked", "true");
    });

    it('renders a "Done" StatusBadge', () => {
      renderRow(makeItem({ done: true }));
      expect(screen.getByText("Done")).toBeInTheDocument();
    });
  });

  describe("toggle interaction", () => {
    it("calls updateItem with done toggled to true when clicking an unchecked item", async () => {
      const user = userEvent.setup();
      const item = makeItem({ done: false });
      vi.mocked(api.updateItem).mockResolvedValue({ ...item, done: true });
      renderRow(item);
      await user.click(screen.getByRole("checkbox", { name: "Buy milk" }));
      await waitFor(() =>
        expect(api.updateItem).toHaveBeenCalledWith(1, {
          name: "Buy milk",
          done: true,
        }),
      );
    });

    it("calls updateItem with done toggled to false when clicking a checked item", async () => {
      const user = userEvent.setup();
      const item = makeItem({ done: true });
      vi.mocked(api.updateItem).mockResolvedValue({ ...item, done: false });
      renderRow(item);
      await user.click(screen.getByRole("checkbox", { name: "Buy milk" }));
      await waitFor(() =>
        expect(api.updateItem).toHaveBeenCalledWith(1, {
          name: "Buy milk",
          done: false,
        }),
      );
    });

    it('shows a "Syncing" StatusBadge while the toggle mutation is pending', async () => {
      const user = userEvent.setup();
      vi.mocked(api.updateItem).mockReturnValue(new Promise(() => {}));
      renderRow(makeItem());
      await user.click(screen.getByRole("checkbox", { name: "Buy milk" }));
      await waitFor(() =>
        expect(screen.getByText("Syncing")).toBeInTheDocument(),
      );
    });

    it('shows a "Saving" Spinner while pending', async () => {
      const user = userEvent.setup();
      vi.mocked(api.updateItem).mockReturnValue(new Promise(() => {}));
      renderRow(makeItem());
      await user.click(screen.getByRole("checkbox", { name: "Buy milk" }));
      await waitFor(() =>
        expect(
          screen.getByRole("status", { name: "Saving" }),
        ).toBeInTheDocument(),
      );
    });

    it("disables the checkbox button while the mutation is pending", async () => {
      const user = userEvent.setup();
      vi.mocked(api.updateItem).mockReturnValue(new Promise(() => {}));
      renderRow(makeItem());
      await user.click(screen.getByRole("checkbox", { name: "Buy milk" }));
      await waitFor(() =>
        expect(
          screen.getByRole("checkbox", { name: "Buy milk" }),
        ).toBeDisabled(),
      );
    });
  });

  describe("delete interaction", () => {
    it("calls deleteItem with the item id when the Delete button is clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(api.deleteItem).mockResolvedValue(undefined);
      renderRow(makeItem());
      await user.click(screen.getByRole("button", { name: "Delete Buy milk" }));
      await waitFor(() => expect(api.deleteItem).toHaveBeenCalledWith(1));
    });

    it("shows a delete Spinner while deletion is pending", async () => {
      const user = userEvent.setup();
      vi.mocked(api.deleteItem).mockReturnValue(new Promise(() => {}));
      renderRow(makeItem());
      await user.click(screen.getByRole("button", { name: "Delete Buy milk" }));
      await waitFor(() =>
        expect(
          screen.getByRole("status", { name: "Deleting Buy milk" }),
        ).toBeInTheDocument(),
      );
    });

    it("hides the Delete button while the deletion Spinner is shown", async () => {
      // Rename button remains visible (it's in the left panel); only Delete is replaced
      const user = userEvent.setup();
      vi.mocked(api.deleteItem).mockReturnValue(new Promise(() => {}));
      renderRow(makeItem());
      await user.click(screen.getByRole("button", { name: "Delete Buy milk" }));
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "Delete Buy milk" }),
        ).not.toBeInTheDocument(),
      );
    });
  });

  describe("inline edit mode", () => {
    it("enters edit mode when the Rename button is clicked", async () => {
      const user = userEvent.setup();
      renderRow(makeItem());
      await user.click(screen.getByRole("button", { name: "Rename Buy milk" }));
      expect(screen.getByLabelText("Rename Buy milk")).toBeInTheDocument();
    });

    it("pre-populates the edit input with the current item name", async () => {
      const user = userEvent.setup();
      renderRow(makeItem());
      await user.click(screen.getByRole("button", { name: "Rename Buy milk" }));
      expect(screen.getByLabelText("Rename Buy milk")).toHaveValue("Buy milk");
    });

    it("hides the toggle checkbox button while editing", async () => {
      const user = userEvent.setup();
      renderRow(makeItem());
      await user.click(screen.getByRole("button", { name: "Rename Buy milk" }));
      expect(
        screen.queryByRole("checkbox", { name: "Buy milk" }),
      ).not.toBeInTheDocument();
    });

    it("hides the StatusBadge while editing", async () => {
      const user = userEvent.setup();
      renderRow(makeItem());
      await user.click(screen.getByRole("button", { name: "Rename Buy milk" }));
      expect(screen.queryByText("Pending")).not.toBeInTheDocument();
    });

    it("calls updateItem with the trimmed new name on Save click", async () => {
      const user = userEvent.setup();
      const item = makeItem();
      vi.mocked(api.updateItem).mockResolvedValue({
        ...item,
        name: "Buy almond milk",
      });
      renderRow(item);
      await user.click(screen.getByRole("button", { name: "Rename Buy milk" }));
      const input = screen.getByLabelText("Rename Buy milk");
      await user.clear(input);
      await user.type(input, "Buy almond milk");
      await user.click(screen.getByRole("button", { name: "Save todo item" }));
      await waitFor(() =>
        expect(api.updateItem).toHaveBeenCalledWith(1, {
          name: "Buy almond milk",
          done: false,
        }),
      );
    });

    it("does NOT call updateItem when the name is unchanged on Save", async () => {
      const user = userEvent.setup();
      renderRow(makeItem());
      await user.click(screen.getByRole("button", { name: "Rename Buy milk" }));
      await user.click(screen.getByRole("button", { name: "Save todo item" }));
      expect(api.updateItem).not.toHaveBeenCalled();
    });

    it("does NOT call updateItem when the name is cleared on Save", async () => {
      const user = userEvent.setup();
      renderRow(makeItem());
      await user.click(screen.getByRole("button", { name: "Rename Buy milk" }));
      await user.clear(screen.getByLabelText("Rename Buy milk"));
      await user.click(screen.getByRole("button", { name: "Save todo item" }));
      expect(api.updateItem).not.toHaveBeenCalled();
    });

    it("returns to view mode after Save", async () => {
      const user = userEvent.setup();
      renderRow(makeItem());
      await user.click(screen.getByRole("button", { name: "Rename Buy milk" }));
      await user.click(screen.getByRole("button", { name: "Save todo item" }));
      await waitFor(() =>
        expect(
          screen.getByRole("checkbox", { name: "Buy milk" }),
        ).toBeInTheDocument(),
      );
    });

    it("cancels editing and restores the original name on esc press", async () => {
      const user = userEvent.setup();
      renderRow(makeItem());
      await user.click(screen.getByRole("button", { name: "Rename Buy milk" }));
      await user.clear(screen.getByLabelText("Rename Buy milk"));
      await user.type(
        screen.getByLabelText("Rename Buy milk"),
        "Something else",
      );
      await user.keyboard("{Escape}");
      await waitFor(() =>
        expect(
          screen.getByRole("checkbox", { name: "Buy milk" }),
        ).toBeInTheDocument(),
      );
    });

    it("cancels editing when the edit input loses focus (onBlur → handleCancel)", async () => {
      const user = userEvent.setup();
      renderRow(makeItem());
      await user.click(screen.getByRole("button", { name: "Rename Buy milk" }));
      fireEvent.blur(screen.getByLabelText("Rename Buy milk"));
      await waitFor(() =>
        expect(
          screen.getByRole("checkbox", { name: "Buy milk" }),
        ).toBeInTheDocument(),
      );
    });
  });
});
