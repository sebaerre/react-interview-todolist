import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as api from "../../api";
import { renderWithClient, createQueryClient } from "../../test/utils";
import { qk } from "../../api";
import { Sidebar } from ".";
import type { TodoList } from "@types";

vi.mock("../../api", () => import("../../test/apiMock"));

const listA: TodoList = { id: "list-1", name: "Shopping" };
const listB: TodoList = { id: "list-2", name: "Work" };

function renderSidebar(lists: TodoList[], selectedId = "", onSelect = vi.fn()) {
  const qc = createQueryClient();
  qc.setQueryData(qk.lists(), lists);
  // Seed empty items for each list to prevent stray fetch requests
  lists.forEach((l) => qc.setQueryData(qk.items(l.id), []));
  renderWithClient(<Sidebar selectedId={selectedId} onSelect={onSelect} />, qc);
  return { onSelect, qc };
}

describe("Sidebar", () => {
  afterEach(() => vi.clearAllMocks());

  describe("with lists in cache", () => {
    it("renders a button for each list", () => {
      renderSidebar([listA, listB]);
      expect(
        screen.getByRole("button", { name: "Shopping" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Work" })).toBeInTheDocument();
    });

    it('renders the "+ New list" button from CreateTodoList', () => {
      renderSidebar([listA]);
      expect(
        screen.getByRole("button", { name: "+ New list" }),
      ).toBeInTheDocument();
    });
  });

  describe("with empty lists cache", () => {
    it("renders no list item buttons", () => {
      renderSidebar([]);
      expect(
        screen.queryByRole("button", { name: "Shopping" }),
      ).not.toBeInTheDocument();
    });

    it('still renders the "+ New list" button', () => {
      renderSidebar([]);
      expect(
        screen.getByRole("button", { name: "+ New list" }),
      ).toBeInTheDocument();
    });
  });

  describe("list selection", () => {
    it("calls onSelect with the list id when a list button is clicked", async () => {
      const user = userEvent.setup();
      const { onSelect } = renderSidebar([listA, listB]);
      await user.click(screen.getByRole("button", { name: "Shopping" }));
      expect(onSelect).toHaveBeenCalledWith("list-1");
    });
  });

  describe("delete interaction", () => {
    it("calls deleteList when a list Delete button is clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(api.deleteList).mockResolvedValue(undefined);
      renderSidebar([listA, listB]);
      await user.click(screen.getByRole("button", { name: "Delete Shopping" }));
      await waitFor(() =>
        expect(api.deleteList).toHaveBeenCalledWith("list-1"),
      );
    });

    it("shows a delete Spinner for the item being deleted", async () => {
      const user = userEvent.setup();
      vi.mocked(api.deleteList).mockReturnValue(new Promise(() => {}));
      renderSidebar([listA, listB]);
      await user.click(screen.getByRole("button", { name: "Delete Shopping" }));
      await waitFor(() =>
        expect(
          screen.getByRole("status", { name: "Deleting Shopping" }),
        ).toBeInTheDocument(),
      );
    });

    it("does NOT show a delete Spinner on other items while one is deleting", async () => {
      const user = userEvent.setup();
      vi.mocked(api.deleteList).mockReturnValue(new Promise(() => {}));
      renderSidebar([listA, listB]);
      await user.click(screen.getByRole("button", { name: "Delete Shopping" }));
      await waitFor(() =>
        expect(
          screen.queryByRole("status", { name: "Deleting Work" }),
        ).not.toBeInTheDocument(),
      );
    });
  });

  describe("fetching from API (no pre-seeded cache)", () => {
    it("displays lists after the fetch resolves", async () => {
      vi.mocked(api.fetchTodoLists).mockResolvedValue([listA]);
      vi.mocked(api.fetchTodoItems).mockResolvedValue([]);
      const qc = createQueryClient();
      renderWithClient(<Sidebar selectedId="" onSelect={vi.fn()} />, qc);
      expect(
        await screen.findByRole("button", { name: "Shopping" }),
      ).toBeInTheDocument();
    });
  });
});
