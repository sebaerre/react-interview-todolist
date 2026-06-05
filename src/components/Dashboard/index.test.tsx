import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as api from "../../api";
import { renderWithClient, createQueryClient } from "../../test/utils";
import { qk } from "../../api";
import { Dashboard } from ".";
import type { TodoList } from "@types";

vi.mock("../../api", () => import("../../test/apiMock"));

const list1: TodoList = { id: "list-1", name: "Shopping" };
const list2: TodoList = { id: "list-2", name: "Work" };

function renderDashboard(lists: TodoList[]) {
  const qc = createQueryClient();
  qc.setQueryData(qk.lists(), lists);
  lists.forEach((l) => qc.setQueryData(qk.items(l.id), []));
  return { ...renderWithClient(<Dashboard />, qc), qc };
}

describe("Dashboard", () => {
  afterEach(() => vi.clearAllMocks());
  describe("when no lists exist", () => {
    it('renders the "No lists yet" empty state message', () => {
      renderDashboard([]);
      expect(
        screen.getByText("No lists yet. Create one to get started."),
      ).toBeInTheDocument();
    });

    it("does NOT render a todo panel heading (h2)", () => {
      renderDashboard([]);
      // Sidebar always renders an h1 "My Lists"; the todo panel uses h2 for list names
      expect(
        screen.queryByRole("heading", { level: 2 }),
      ).not.toBeInTheDocument();
    });
  });

  describe("when lists exist", () => {
    it("auto-selects the first list and renders its heading", async () => {
      renderDashboard([list1]);
      expect(
        await screen.findByRole("heading", { name: "Shopping" }),
      ).toBeInTheDocument();
    });

    it("does NOT show the empty state message", async () => {
      renderDashboard([list1]);
      await screen.findByRole("heading", { name: "Shopping" });
      expect(
        screen.queryByText("No lists yet. Create one to get started."),
      ).not.toBeInTheDocument();
    });
  });

  describe("selecting a different list via the Sidebar", () => {
    it("renders the heading for the newly selected list", async () => {
      const user = userEvent.setup();
      renderDashboard([list1, list2]);
      // Wait for the first list to auto-select
      await screen.findByRole("heading", { name: "Shopping" });
      // Click Work in the sidebar
      await user.click(screen.getByRole("button", { name: "Work" }));
      await waitFor(() =>
        expect(
          screen.getByRole("heading", { name: "Work" }),
        ).toBeInTheDocument(),
      );
    });
  });

  describe("loading from API (no pre-seeded cache)", () => {
    it("shows the list heading after the fetch resolves", async () => {
      vi.mocked(api.fetchTodoLists).mockResolvedValue([list1]);
      vi.mocked(api.fetchTodoItems).mockResolvedValue([]);
      const qc = createQueryClient();
      renderWithClient(<Dashboard />, qc);
      expect(
        await screen.findByRole("heading", { name: "Shopping" }),
      ).toBeInTheDocument();
    });
  });

  describe("selectedId reset when lists become empty", () => {
    it("shows the empty state when the cache is updated to an empty list", async () => {
      const { qc } = renderDashboard([list1]);
      await screen.findByRole("heading", { name: "Shopping" });
      act(() => {
        qc.setQueryData(qk.lists(), []);
      });
      await waitFor(() =>
        expect(
          screen.getByText("No lists yet. Create one to get started."),
        ).toBeInTheDocument(),
      );
    });
  });
});
