import { describe, it, expect, vi, afterEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { act } from "react";
import { useUpdateTodoItem } from ".";
import * as api from "../../api";
import { renderHookWithClient, createQueryClient } from "../../test/utils";
import { qk } from "../../api";
import type { TodoItem } from "@types";

vi.mock("../../api", () => import("../../test/apiMock"));

describe("useUpdateTodoItem", () => {
  afterEach(() => vi.clearAllMocks());
  it("calls updateItem with the provided id and payload", async () => {
    const updated: TodoItem = {
      id: 1,
      todoList: "list1",
      name: "New Name",
      done: false,
    };
    vi.mocked(api.updateItem).mockResolvedValue(updated);

    const { result } = renderHookWithClient(() =>
      useUpdateTodoItem({ listId: "list1" }),
    );

    await act(async () =>
      result.current.mutate({
        id: 1,
        payload: { name: "New Name", done: false },
      }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(api.updateItem)).toHaveBeenCalledWith(1, {
      name: "New Name",
      done: false,
    });
  });

  it("updates the matching item name and done in the cache on success", async () => {
    const updated: TodoItem = {
      id: 1,
      todoList: "list1",
      name: "Renamed",
      done: false,
    };
    vi.mocked(api.updateItem).mockResolvedValue(updated);

    const qc = createQueryClient();
    const initialItems: TodoItem[] = [
      { id: 1, todoList: "list1", name: "Original", done: false },
      { id: 2, todoList: "list1", name: "Other", done: false },
    ];
    qc.setQueryData(qk.items("list1"), initialItems);

    const { result } = renderHookWithClient(
      () => useUpdateTodoItem({ listId: "list1" }),
      qc,
    );

    await act(async () =>
      result.current.mutate({
        id: 1,
        payload: { name: "Renamed", done: false },
      }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = qc.getQueryData(qk.items("list1")) as TodoItem[];
    expect(cached.find((i) => i.id === 1)?.name).toBe("Renamed");
    expect(cached.find((i) => i.id === 2)?.name).toBe("Other");
  });

  it("updates the done field in the cache on toggle", async () => {
    const updated: TodoItem = {
      id: 1,
      todoList: "list1",
      name: "Buy milk",
      done: true,
    };
    vi.mocked(api.updateItem).mockResolvedValue(updated);

    const qc = createQueryClient();
    const initialItems: TodoItem[] = [
      { id: 1, todoList: "list1", name: "Buy milk", done: false },
    ];
    qc.setQueryData(qk.items("list1"), initialItems);

    const { result } = renderHookWithClient(
      () => useUpdateTodoItem({ listId: "list1" }),
      qc,
    );

    await act(async () =>
      result.current.mutate({
        id: 1,
        payload: { name: "Buy milk", done: true },
      }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = qc.getQueryData(qk.items("list1")) as TodoItem[];
    expect(cached.find((i) => i.id === 1)?.done).toBe(true);
  });

  it("falls back to an empty array when there is no cached data", async () => {
    const updated: TodoItem = {
      id: 1,
      todoList: "list1",
      name: "New Name",
      done: false,
    };
    vi.mocked(api.updateItem).mockResolvedValue(updated);

    const qc = createQueryClient();
    // intentionally no setQueryData call

    const { result } = renderHookWithClient(
      () => useUpdateTodoItem({ listId: "list1" }),
      qc,
    );

    await act(async () =>
      result.current.mutate({
        id: 1,
        payload: { name: "New Name", done: false },
      }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = qc.getQueryData(qk.items("list1")) as TodoItem[];
    expect(cached).toEqual([]);
  });

  it("calls the onSuccess callback with the updated item", async () => {
    const updated: TodoItem = {
      id: 1,
      todoList: "list1",
      name: "New Name",
      done: false,
    };
    vi.mocked(api.updateItem).mockResolvedValue(updated);

    const onSuccess = vi.fn();
    const { result } = renderHookWithClient(() =>
      useUpdateTodoItem({ listId: "list1", onSuccess }),
    );

    await act(async () =>
      result.current.mutate({
        id: 1,
        payload: { name: "New Name", done: false },
      }),
    );

    // The hook calls onSuccess?.({ data }), so the argument is wrapped
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(updated));
  });

  it("calls the onError callback on failure", async () => {
    const error = new Error("Server error");
    vi.mocked(api.updateItem).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHookWithClient(() =>
      useUpdateTodoItem({ listId: "list1", onError }),
    );

    await act(async () =>
      result.current.mutate({
        id: 1,
        payload: { name: "New Name", done: false },
      }),
    );

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError.mock.calls[0][0]).toEqual(error);
  });
});
