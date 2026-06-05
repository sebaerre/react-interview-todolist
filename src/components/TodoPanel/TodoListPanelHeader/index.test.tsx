import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as api from "../../../api";
import { renderWithClient, createQueryClient } from "../../../test/utils";
import { qk } from "../../../api";
import { TodoListPanelHeader } from ".";
import type { TodoList } from "@types";

vi.mock("../../../api", () => import("../../../test/apiMock"));

const list: TodoList = { id: "list-42", name: "My Shopping List" };

describe("TodoListPanelHeader", () => {
  afterEach(() => vi.clearAllMocks());

  it("renders the currentList name as a heading", () => {
    render(
      <TodoListPanelHeader
        listId="list-42"
        currentList={list}
        allDone={false}
        completed={0}
        total={0}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "My Shopping List" }),
    ).toBeInTheDocument();
  });

  it("falls back to listId as heading when currentList is undefined", () => {
    render(
      <TodoListPanelHeader
        listId="list-42"
        currentList={undefined}
        allDone={false}
        completed={0}
        total={0}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "list-42" }),
    ).toBeInTheDocument();
  });

  it('shows the "Completed!" StatusBadge when allDone=true', () => {
    render(
      <TodoListPanelHeader
        listId="list-42"
        currentList={list}
        allDone={true}
        completed={3}
        total={3}
      />,
    );
    expect(screen.getByText("Completed!")).toBeInTheDocument();
  });

  it('does NOT show the "Completed!" badge when allDone=false', () => {
    render(
      <TodoListPanelHeader
        listId="list-42"
        currentList={list}
        allDone={false}
        completed={1}
        total={3}
      />,
    );
    expect(screen.queryByText("Completed!")).not.toBeInTheDocument();
  });

  it("renders a ProgressBar with the correct aria-valuenow and count text", () => {
    render(
      <TodoListPanelHeader
        listId="list-42"
        currentList={list}
        allDone={false}
        completed={3}
        total={5}
      />,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "60",
    );
    expect(screen.getByText("3 / 5")).toBeInTheDocument();
  });

  it("renders a Rename button for the list name", () => {
    render(
      <TodoListPanelHeader
        listId="list-42"
        currentList={list}
        allDone={false}
        completed={0}
        total={0}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Rename My Shopping List" }),
    ).toBeInTheDocument();
  });

  it("shows the edit form when the Rename button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(api.updateList).mockResolvedValue({
      id: "list-42",
      name: "My Shopping List",
    });
    const qc = createQueryClient();
    qc.setQueryData(qk.lists(), [list]);
    renderWithClient(
      <TodoListPanelHeader
        listId="list-42"
        currentList={list}
        allDone={false}
        completed={0}
        total={0}
      />,
      qc,
    );
    await user.click(
      screen.getByRole("button", { name: "Rename My Shopping List" }),
    );
    expect(screen.getByDisplayValue("My Shopping List")).toBeInTheDocument();
  });

  it("hides the heading while editing", async () => {
    const user = userEvent.setup();
    vi.mocked(api.updateList).mockResolvedValue({
      id: "list-42",
      name: "My Shopping List",
    });
    const qc = createQueryClient();
    qc.setQueryData(qk.lists(), [list]);
    renderWithClient(
      <TodoListPanelHeader
        listId="list-42"
        currentList={list}
        allDone={false}
        completed={0}
        total={0}
      />,
      qc,
    );
    await user.click(
      screen.getByRole("button", { name: "Rename My Shopping List" }),
    );
    expect(
      screen.queryByRole("heading", { name: "My Shopping List" }),
    ).not.toBeInTheDocument();
  });

  it("returns to view mode on Escape", async () => {
    const user = userEvent.setup();
    vi.mocked(api.updateList).mockResolvedValue({
      id: "list-42",
      name: "My Shopping List",
    });
    const qc = createQueryClient();
    qc.setQueryData(qk.lists(), [list]);
    renderWithClient(
      <TodoListPanelHeader
        listId="list-42"
        currentList={list}
        allDone={false}
        completed={0}
        total={0}
      />,
      qc,
    );
    await user.click(
      screen.getByRole("button", { name: "Rename My Shopping List" }),
    );
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "My Shopping List" }),
      ).toBeInTheDocument(),
    );
  });
});
