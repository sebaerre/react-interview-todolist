import { describe, it, expect, vi, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithClient, createQueryClient } from "../../test/utils";
import { qk } from "../../api";
import { ListNavItem } from ".";
import type { TodoItem } from "@types";

vi.mock("../../api", () => import("../../test/apiMock"));

const defaultProps = {
  listId: "list-1",
  listName: "Shopping",
  selectedId: "",
  onSelect: vi.fn(),
  onDelete: vi.fn(),
  isDeleting: false,
};

function renderItem(overrides: Partial<typeof defaultProps> = {}) {
  const props = {
    ...defaultProps,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
  const qc = createQueryClient();
  return { ...renderWithClient(<ListNavItem {...props} />, qc), props, qc };
}

describe("ListNavItem", () => {
  afterEach(() => vi.clearAllMocks());

  describe("inactive item (selectedId !== listId)", () => {
    it("renders a button with the list name as accessible label", () => {
      renderItem();
      expect(
        screen.getByRole("button", { name: "Shopping" }),
      ).toBeInTheDocument();
    });

    it('does NOT have aria-current="page" when inactive', () => {
      renderItem();
      expect(
        screen.getByRole("button", { name: "Shopping" }),
      ).not.toHaveAttribute("aria-current");
    });

    it('shows "-/-" counts when items are not loaded (inactive item, no fetch)', () => {
      renderItem();
      expect(screen.getByText("-/-")).toBeInTheDocument();
    });

    it("calls onSelect with listId when clicked", async () => {
      const user = userEvent.setup();
      const { props } = renderItem();
      await user.click(screen.getByRole("button", { name: "Shopping" }));
      expect(props.onSelect).toHaveBeenCalledWith("list-1");
    });

    it("renders a Delete button", () => {
      renderItem();
      expect(
        screen.getByRole("button", { name: "Delete Shopping" }),
      ).toBeInTheDocument();
    });
  });

  describe("active item (selectedId === listId)", () => {
    function renderActive(items: TodoItem[]) {
      const qc = createQueryClient();
      qc.setQueryData(qk.items("list-1"), items);
      renderWithClient(
        <ListNavItem
          listId="list-1"
          listName="Shopping"
          selectedId="list-1"
          onSelect={vi.fn()}
          onDelete={vi.fn()}
        />,
        qc,
      );
    }

    it('marks the button with aria-current="page"', () => {
      renderActive([]);
      expect(screen.getByRole("button", { name: "Shopping" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    it("shows correct done/total count from cached items", () => {
      const items: TodoItem[] = [
        { id: 1, todoList: "list-1", name: "A", done: true },
        { id: 2, todoList: "list-1", name: "B", done: false },
      ];
      renderActive(items);
      expect(screen.getByText("1/2")).toBeInTheDocument();
    });

    it("renders the Done StatusBadge when all items are done", () => {
      const items: TodoItem[] = [
        { id: 1, todoList: "list-1", name: "A", done: true },
        { id: 2, todoList: "list-1", name: "B", done: true },
      ];
      renderActive(items);
      expect(screen.getByLabelText("todolist-done")).toBeInTheDocument();
    });

    it("does NOT render the Done badge when not all items are done", () => {
      const items: TodoItem[] = [
        { id: 1, todoList: "list-1", name: "A", done: true },
        { id: 2, todoList: "list-1", name: "B", done: false },
      ];
      renderActive(items);
      expect(screen.queryByLabelText("todolist-done")).not.toBeInTheDocument();
    });

    it("does NOT render the Done badge when the list is empty (total=0)", () => {
      renderActive([]);
      expect(screen.queryByLabelText("todolist-done")).not.toBeInTheDocument();
    });
  });

  describe("delete state", () => {
    it("shows the delete Spinner when isDeleting=true", () => {
      renderItem({ isDeleting: true });
      expect(
        screen.getByRole("status", { name: "Deleting Shopping" }),
      ).toBeInTheDocument();
    });

    it("hides the Delete button while isDeleting=true", () => {
      renderItem({ isDeleting: true });
      expect(
        screen.queryByRole("button", { name: "Delete Shopping" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("delete action", () => {
    it("calls onDelete with listId when the Delete button is clicked", async () => {
      const user = userEvent.setup();
      const { props } = renderItem();
      await user.click(screen.getByRole("button", { name: "Delete Shopping" }));
      expect(props.onDelete).toHaveBeenCalledWith("list-1", "Shopping");
    });
  });
});
