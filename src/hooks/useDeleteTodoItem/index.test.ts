import { describe, it, expect, vi, afterEach } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { useDeleteTodoItem } from ".";
import * as api from "../../api";
import { renderHookWithClient, createQueryClient } from "../../test/utils";
import { qk } from "../../api";

vi.mock("../../api", () => import("../../test/apiMock"));

describe("useDeleteTodoItem", () => {
  afterEach(() => vi.clearAllMocks());
  it("calls deleteItem with the provided item id", async () => {
    vi.mocked(api.deleteItem).mockResolvedValue(undefined);

    const { result } = renderHookWithClient(() =>
      useDeleteTodoItem({ listId: "list1" }),
    );

    act(() => result.current.mutate(42));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(api.deleteItem)).toHaveBeenCalledWith(42);
  });

  it("invalidates qk.items(listId) on success", async () => {
    vi.mocked(api.deleteItem).mockResolvedValue(undefined);

    const qc = createQueryClient();
    qc.setQueryData(qk.items("list1"), []);
    const { result } = renderHookWithClient(
      () => useDeleteTodoItem({ listId: "list1" }),
      qc,
    );

    act(() => result.current.mutate(42));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryState(qk.items("list1"))?.isInvalidated).toBe(true);
  });

  it("calls the onSuccess callback on success", async () => {
    const mockItems = [
      { id: 42, name: "Buy milk" },
      { id: 43, name: "Walk dog" },
    ];

    vi.mocked(api.deleteItem).mockResolvedValue(undefined);

    const onSuccess = vi.fn();
    const { result } = renderHookWithClient(
      () => useDeleteTodoItem({ listId: "list1", onSuccess }),
      createQueryClient(),
      undefined,
      [{ queryKey: qk.items("list1"), data: mockItems }],
    );

    act(() => result.current.mutate(42));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("Buy milk"));
  });

  it("calls the onError callback on failure", async () => {
    const error = new Error("Not found");
    vi.mocked(api.deleteItem).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHookWithClient(() =>
      useDeleteTodoItem({ listId: "list1", onError }),
    );

    act(() => result.current.mutate(42));

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError.mock.calls[0][0]).toEqual(error);
  });
});
