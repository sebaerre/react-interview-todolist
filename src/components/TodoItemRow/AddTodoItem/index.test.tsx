import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as api from "../../../api";
import { renderWithClient, createQueryClient } from "../../../test/utils";
import { qk } from "../../../api";
import { AddTodoItem } from ".";

vi.mock("../../../api", () => import("../../../test/apiMock"));

function renderComponent() {
  const qc = createQueryClient();
  qc.setQueryData(qk.items("list-1"), []);
  renderWithClient(<AddTodoItem listId="list-1" />, qc);
}

describe("AddTodoItem", () => {
  afterEach(() => vi.clearAllMocks());

  describe("idle state", () => {
    it('renders the "+ Add todo" button', () => {
      renderComponent();
      expect(
        screen.getByRole("button", { name: "+ Add todo" }),
      ).toBeInTheDocument();
    });

    it("does NOT render the todo input while idle", () => {
      renderComponent();
      expect(screen.queryByLabelText("New todo name")).not.toBeInTheDocument();
    });
  });

  describe("entering add mode", () => {
    it('shows the "New todo name" input after clicking "+ Add todo"', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ Add todo" }));
      expect(screen.getByLabelText("New todo name")).toBeInTheDocument();
    });

    it('hides the "+ Add todo" button while the form is shown', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ Add todo" }));
      expect(
        screen.queryByRole("button", { name: "+ Add todo" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("creating a todo", () => {
    it("calls createTodoItem with listId and trimmed name on submit", async () => {
      const user = userEvent.setup();
      vi.mocked(api.createTodoItem).mockResolvedValue({
        id: 10,
        todoList: "list-1",
        name: "Buy milk",
        done: false,
      });
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ Add todo" }));
      await user.type(screen.getByLabelText("New todo name"), "Buy milk");
      await user.keyboard("{Enter}");
      await waitFor(() =>
        expect(api.createTodoItem).toHaveBeenCalledWith({
          listId: "list-1",
          name: "Buy milk",
        }),
      );
    });

    it("does NOT call createTodoItem for whitespace-only input", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ Add todo" }));
      await user.type(screen.getByLabelText("New todo name"), "   ");
      await user.keyboard("{Enter}");
      expect(api.createTodoItem).not.toHaveBeenCalled();
    });

    it("clears the input value after successful creation", async () => {
      // After creation, onSuccess calls setNewItemName('') but isAddingItem stays true,
      // so the form remains open with an empty value ready for the next entry.
      const user = userEvent.setup();
      vi.mocked(api.createTodoItem).mockResolvedValue({
        id: 10,
        todoList: "list-1",
        name: "Buy milk",
        done: false,
      });
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ Add todo" }));
      await user.type(screen.getByLabelText("New todo name"), "Buy milk");
      await user.keyboard("{Enter}");
      await waitFor(() =>
        expect(screen.getByLabelText("New todo name")).toHaveValue(""),
      );
    });

    it('shows a "Creating todo" Spinner while the mutation is pending', async () => {
      const user = userEvent.setup();
      vi.mocked(api.createTodoItem).mockReturnValue(new Promise(() => {}));
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ Add todo" }));
      await user.type(screen.getByLabelText("New todo name"), "Buy milk");
      await user.keyboard("{Enter}");
      await waitFor(() =>
        expect(
          screen.getByRole("status", { name: "Creating todo" }),
        ).toBeInTheDocument(),
      );
    });

    it("hides both the form and the button while pending", async () => {
      const user = userEvent.setup();
      vi.mocked(api.createTodoItem).mockReturnValue(new Promise(() => {}));
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ Add todo" }));
      await user.type(screen.getByLabelText("New todo name"), "Buy milk");
      await user.keyboard("{Enter}");
      await waitFor(() => {
        expect(
          screen.queryByRole("button", { name: "+ Add todo" }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByLabelText("New todo name"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("cancel via blur", () => {
    it("hides the form when the input blurs with an empty value", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ Add todo" }));
      fireEvent.blur(screen.getByLabelText("New todo name"));
      await waitFor(() =>
        expect(
          screen.queryByLabelText("New todo name"),
        ).not.toBeInTheDocument(),
      );
    });

    it("keeps the form visible when blurred with a non-empty value", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ Add todo" }));
      await user.type(screen.getByLabelText("New todo name"), "Buy eggs");
      fireEvent.blur(screen.getByLabelText("New todo name"));
      expect(screen.getByLabelText("New todo name")).toBeInTheDocument();
    });
  });
});
