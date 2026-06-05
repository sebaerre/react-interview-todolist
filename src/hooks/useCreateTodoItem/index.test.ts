import { describe, it, expect, vi, afterEach } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { useCreateTodoItem } from ".";
import * as api from "../../api";
import { renderHookWithClient, createQueryClient } from "../../test/utils";
import { qk } from "../../api";

vi.mock("../../api", () => import("../../test/apiMock"));

describe("useCreateTodoItem", () => {
  afterEach(() => vi.clearAllMocks());

  it("calls createTodoItem with listId and the item name", async () => {
    const newItem = { id: 1, todoList: "list1", name: "Buy milk", done: false };
    vi.mocked(api.createTodoItem).mockResolvedValue(newItem);

    const { result } = renderHookWithClient(() =>
      useCreateTodoItem({ listId: "list1" }),
    );

    await act(() => result.current.mutate("Buy milk"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(api.createTodoItem)).toHaveBeenCalledWith({
      listId: "list1",
      name: "Buy milk",
    });
  });

  it("invalidates qk.items(listId) on success", async () => {
    const newItem = { id: 1, todoList: "list1", name: "Buy milk", done: false };
    vi.mocked(api.createTodoItem).mockResolvedValue(newItem);

    const qc = createQueryClient();
    qc.setQueryData(qk.items("list1"), []);
    const { result } = renderHookWithClient(
      () => useCreateTodoItem({ listId: "list1" }),
      qc,
    );

    await act(() => result.current.mutate("Buy milk"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryState(qk.items("list1"))?.isInvalidated).toBe(true);
  });

  it("calls the onSuccess callback with the new item", async () => {
    const newItem = { id: 1, todoList: "list1", name: "Buy milk", done: false };
    vi.mocked(api.createTodoItem).mockResolvedValue(newItem);

    const onSuccess = vi.fn();
    const { result } = renderHookWithClient(() =>
      useCreateTodoItem({ listId: "list1", onSuccess }),
    );

    await act(() => result.current.mutate("Buy milk"));

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(newItem),
    );
  });

  it("calls the onError callback on failure", async () => {
    const error = new Error("Server error");
    vi.mocked(api.createTodoItem).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHookWithClient(() =>
      useCreateTodoItem({ listId: "list1", onError }),
    );

    await act(() => result.current.mutate("Buy milk"));

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError.mock.calls[0][0]).toEqual(error);
  });
});
