import { describe, it, expect, vi, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithClient, createQueryClient } from "../../../test/utils";
import { qk } from "../../../api";
import { TodoItemsList } from ".";
import type { TodoItem } from "@types";

vi.mock("../../../api", () => import("../../../test/apiMock"));

const makeItem = (id: number, name: string, done = false): TodoItem => ({
  id,
  todoList: "list-1",
  name,
  done,
});

describe("TodoItemsList", () => {
  afterEach(() => vi.clearAllMocks());

  it("renders nothing when todoItems is empty", () => {
    const qc = createQueryClient();
    qc.setQueryData(qk.items("list-1"), []);
    renderWithClient(<TodoItemsList todoItems={[]} listId="list-1" />, qc);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("renders one row per item showing each item name", () => {
    const items = [
      makeItem(1, "Buy milk"),
      makeItem(2, "Do laundry"),
      makeItem(3, "Cook dinner"),
    ];
    const qc = createQueryClient();
    qc.setQueryData(qk.items("list-1"), items);
    renderWithClient(<TodoItemsList todoItems={items} listId="list-1" />, qc);
    expect(
      screen.getByRole("checkbox", { name: "Buy milk" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Do laundry" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Cook dinner" }),
    ).toBeInTheDocument();
  });

  it("renders items in the order provided", () => {
    const items = [
      makeItem(1, "First"),
      makeItem(2, "Second"),
      makeItem(3, "Third"),
    ];
    const qc = createQueryClient();
    qc.setQueryData(qk.items("list-1"), items);
    renderWithClient(<TodoItemsList todoItems={items} listId="list-1" />, qc);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toHaveAttribute("aria-label", "First");
    expect(checkboxes[1]).toHaveAttribute("aria-label", "Second");
    expect(checkboxes[2]).toHaveAttribute("aria-label", "Third");
  });
});
