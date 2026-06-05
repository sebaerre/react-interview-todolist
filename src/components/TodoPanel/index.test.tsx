import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as api from "../../api";
import { renderWithClient, createQueryClient } from "../../test/utils";
import { qk } from "../../api";
import { TodoPanel } from ".";
import type { TodoItem, TodoList } from "@types";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../api", () => import("../../test/apiMock"));

const currentList: TodoList = { id: "list-1", name: "Shopping" };

const pendingItem: TodoItem = {
  id: 1,
  todoList: "list-1",
  name: "Buy milk",
  done: false,
};
const doneItem: TodoItem = {
  id: 2,
  todoList: "list-1",
  name: "Buy eggs",
  done: true,
};

function renderPanel(items: TodoItem[], lists: TodoList[] = [currentList]) {
  const qc = createQueryClient();
  qc.setQueryData(qk.lists(), lists);
  qc.setQueryData(qk.items("list-1"), items);
  return { ...renderWithClient(<TodoPanel listId="list-1" />, qc), qc };
}

describe("TodoPanel", () => {
  afterEach(() => vi.clearAllMocks());

  describe("loading state", () => {
    it('shows "Loading…" when items are still fetching', async () => {
      vi.mocked(api.fetchTodoItems).mockReturnValue(new Promise(() => {}));
      const qc = createQueryClient();
      qc.setQueryData(qk.lists(), [currentList]);
      renderWithClient(<TodoPanel listId="list-1" />, qc);
      expect(await screen.findByText(/Loading/i)).toBeInTheDocument();
    });

    it("does NOT render the list heading while loading", async () => {
      vi.mocked(api.fetchTodoItems).mockReturnValue(new Promise(() => {}));
      const qc = createQueryClient();
      qc.setQueryData(qk.lists(), [currentList]);
      renderWithClient(<TodoPanel listId="list-1" />, qc);
      await screen.findByText(/Loading/i);
      expect(
        screen.queryByRole("heading", { name: "Shopping" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("with items loaded", () => {
    it("renders the list name as a heading", () => {
      renderPanel([pendingItem, doneItem]);
      expect(
        screen.getByRole("heading", { name: "Shopping" }),
      ).toBeInTheDocument();
    });

    it("renders the ProgressBar showing the correct count", () => {
      renderPanel([pendingItem, doneItem]);
      expect(screen.getByText("1 / 2")).toBeInTheDocument();
    });

    it("renders item names in the list", () => {
      renderPanel([pendingItem, doneItem]);
      expect(
        screen.getByRole("checkbox", { name: "Buy milk" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("checkbox", { name: "Buy eggs" }),
      ).toBeInTheDocument();
    });

    it('renders the "+ Add todo" button', () => {
      renderPanel([pendingItem]);
      expect(
        screen.getByRole("button", { name: "+ Add todo" }),
      ).toBeInTheDocument();
    });

    it("shows the remaining todo count text", () => {
      renderPanel([pendingItem, doneItem]);
      // The <p> element's text content is "1 todo remaining"
      expect(screen.getByText(/todo remaining/)).toBeInTheDocument();
    });
  });

  describe("all done state", () => {
    it('shows the "Completed!" StatusBadge in the header', () => {
      renderPanel([
        { ...doneItem, id: 1 },
        { ...doneItem, id: 2 },
      ]);
      expect(screen.getByText("Completed!")).toBeInTheDocument();
    });

    it('disables the "Complete all" button when all todos are done', () => {
      renderPanel([
        { ...doneItem, id: 1 },
        { ...doneItem, id: 2 },
      ]);
      expect(
        screen.getByRole("button", { name: "Complete all" }),
      ).toBeDisabled();
    });
  });

  describe('"Complete all" button disabled logic', () => {
    it("disables the button when the list is empty (total=0)", () => {
      renderPanel([]);
      expect(
        screen.getByRole("button", { name: "Complete all" }),
      ).toBeDisabled();
    });

    it("enables the button when there are pending items", () => {
      renderPanel([pendingItem]);
      expect(
        screen.getByRole("button", { name: "Complete all" }),
      ).toBeEnabled();
    });
  });

  describe("completeAll trigger", () => {
    it('calls api.completeAll when "Complete all" is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(api.completeAll).mockResolvedValue(undefined);
      renderPanel([pendingItem]);
      await user.click(screen.getByRole("button", { name: "Complete all" }));
      await waitFor(() =>
        expect(api.completeAll).toHaveBeenCalledWith(
          "list-1",
          expect.any(Function),
          expect.any(Function),
          expect.any(AbortSignal),
        ),
      );
    });

    it('disables "Complete all" while the operation is pending', async () => {
      const user = userEvent.setup();
      vi.mocked(api.completeAll).mockReturnValue(new Promise(() => {}));
      renderPanel([pendingItem]);
      await user.click(screen.getByRole("button", { name: "Complete all" }));
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Complete all" }),
        ).toBeDisabled(),
      );
    });

    it("shows success notification when completeAll finishes", async () => {
      const user = userEvent.setup();

      vi.mocked(api.completeAll).mockImplementation(
        async (_listId, _onProgress, onDone) => {
          onDone();
        },
      );

      renderPanel([pendingItem]);

      await user.click(screen.getByRole("button", { name: /complete all/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("All todos completed");
      });
    });

    it("shows error notification when completeAll fails", async () => {
      const user = userEvent.setup();

      vi.mocked(api.completeAll).mockRejectedValue(
        new Error("Something went wrong"),
      );

      renderPanel([pendingItem]);

      await user.click(screen.getByRole("button", { name: /complete all/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Something went wrong");
      });
    });
  });

  describe("progress event handling", () => {
    it("updates the item in the cache to done=true when a progress event fires", async () => {
      const user = userEvent.setup();
      vi.mocked(api.completeAll).mockImplementation(
        (_listId, onProgress, _onDone, _signal) => {
          onProgress({ itemId: 1, completed: 1, total: 1 });
          return Promise.resolve(undefined);
        },
      );
      const { qc } = renderPanel([pendingItem]);
      await user.click(screen.getByRole("button", { name: "Complete all" }));
      await waitFor(() => {
        const cached = qc.getQueryData<TodoItem[]>(qk.items("list-1"));
        expect(cached?.find((i) => i.id === 1)?.done).toBe(true);
      });
    });
  });
});
