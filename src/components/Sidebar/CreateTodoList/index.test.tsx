import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as api from "../../../api";
import { renderWithClient, createQueryClient } from "../../../test/utils";
import { qk } from "../../../api";
import { CreateTodoList } from ".";

vi.mock("../../../api", () => import("../../../test/apiMock"));

function renderComponent(onSelect = vi.fn()) {
  const qc = createQueryClient();
  qc.setQueryData(qk.lists(), []);
  renderWithClient(<CreateTodoList onSelect={onSelect} />, qc);
  return { onSelect };
}

describe("CreateTodoList", () => {
  afterEach(() => vi.clearAllMocks());

  describe("idle state", () => {
    it('renders the "+ New list" button', () => {
      renderComponent();
      expect(
        screen.getByRole("button", { name: "+ New list" }),
      ).toBeInTheDocument();
    });

    it("does NOT render the inline input", () => {
      renderComponent();
      expect(screen.queryByLabelText("List name")).not.toBeInTheDocument();
    });
  });

  describe("entering add mode", () => {
    it('shows the input after clicking "+ New list"', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ New list" }));
      expect(screen.getByLabelText("List name")).toBeInTheDocument();
    });

    it('hides the "+ New list" button while the form is shown', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ New list" }));
      expect(
        screen.queryByRole("button", { name: "+ New list" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("creating a list", () => {
    it("calls createTodoList with the trimmed name on submit", async () => {
      const user = userEvent.setup();
      vi.mocked(api.createTodoList).mockResolvedValue({
        id: "list-99",
        name: "My List",
      });
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ New list" }));
      await user.type(screen.getByLabelText("List name"), "My List");
      await user.keyboard("{Enter}");
      await waitFor(() =>
        expect(api.createTodoList).toHaveBeenCalledWith("My List"),
      );
    });

    it("does NOT call createTodoList for whitespace-only input", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ New list" }));
      await user.type(screen.getByLabelText("List name"), "   ");
      await user.keyboard("{Enter}");
      expect(api.createTodoList).not.toHaveBeenCalled();
    });

    it("calls onSelect after successful creation", async () => {
      const user = userEvent.setup();
      vi.mocked(api.createTodoList).mockResolvedValue({
        id: "list-99",
        name: "My List",
      });
      const { onSelect } = renderComponent();
      await user.click(screen.getByRole("button", { name: "+ New list" }));
      await user.type(screen.getByLabelText("List name"), "My List");
      await user.keyboard("{Enter}");
      await waitFor(() => expect(onSelect).toHaveBeenCalledWith("list-99"));
    });

    it("resets to idle (input hidden) after successful creation", async () => {
      const user = userEvent.setup();
      vi.mocked(api.createTodoList).mockResolvedValue({
        id: "list-99",
        name: "My List",
      });
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ New list" }));
      await user.type(screen.getByLabelText("List name"), "My List");
      await user.keyboard("{Enter}");
      await waitFor(() =>
        expect(screen.queryByLabelText("List name")).not.toBeInTheDocument(),
      );
    });

    it("disables the input while the mutation is pending", async () => {
      // CreateTodoList has no Spinner — it disables the input while pending
      const user = userEvent.setup();
      vi.mocked(api.createTodoList).mockReturnValue(new Promise(() => {}));
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ New list" }));
      await user.type(screen.getByLabelText("List name"), "My List");
      await user.keyboard("{Enter}");
      await waitFor(() =>
        expect(screen.getByLabelText("List name")).toBeDisabled(),
      );
    });
  });

  describe("cancel / dismiss", () => {
    it("resets to idle on Escape key", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ New list" }));
      await user.keyboard("{Escape}");
      expect(screen.queryByLabelText("List name")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "+ New list" }),
      ).toBeInTheDocument();
    });

    it("resets to idle on click outside", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ New list" }));
      fireEvent.mouseDown(document.body);
      expect(screen.queryByLabelText("List name")).not.toBeInTheDocument();
    });

    it("does NOT call createTodoList when cancelled", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByRole("button", { name: "+ New list" }));
      await user.type(screen.getByLabelText("List name"), "Some name");
      await user.keyboard("{Escape}");
      expect(api.createTodoList).not.toHaveBeenCalled();
    });
  });
});
