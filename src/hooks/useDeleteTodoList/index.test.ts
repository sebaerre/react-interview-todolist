import { describe, it, expect, vi, afterEach } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { useDeleteTodoList } from ".";
import * as api from "../../api";
import { renderHookWithClient, createQueryClient } from "../../test/utils";
import { qk } from "../../api";

vi.mock("../../api", () => import("../../test/apiMock"));

describe("useDeleteTodoList", () => {
  afterEach(() => vi.clearAllMocks());
  it("calls deleteList with the provided id", async () => {
    vi.mocked(api.deleteList).mockResolvedValue(undefined);

    const { result } = renderHookWithClient(() => useDeleteTodoList());

    await act(() => result.current.mutate("list1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(api.deleteList)).toHaveBeenCalledWith("list1");
  });

  it("invalidates the lists query on success", async () => {
    vi.mocked(api.deleteList).mockResolvedValue(undefined);

    const qc = createQueryClient();
    qc.setQueryData(qk.lists(), []);
    const { result } = renderHookWithClient(() => useDeleteTodoList(), qc);

    await act(() => result.current.mutate("list1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryState(qk.lists())?.isInvalidated).toBe(true);
  });

  it("removes the items query for the deleted list on success", async () => {
    vi.mocked(api.deleteList).mockResolvedValue(undefined);

    const qc = createQueryClient();
    qc.setQueryData(qk.items("list1"), []);
    const { result } = renderHookWithClient(() => useDeleteTodoList(), qc);

    await act(() => result.current.mutate("list1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryState(qk.items("list1"))).toBeUndefined();
  });

  it("calls onSuccess with the deleted id", async () => {
    vi.mocked(api.deleteList).mockResolvedValue(undefined);

    const onSuccess = vi.fn();
    const { result } = renderHookWithClient(() =>
      useDeleteTodoList({ onSuccess }),
    );

    act(() => result.current.mutate("list1"));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("list1"));
  });

  it("calls the onError callback on failure", async () => {
    const error = new Error("Not found");
    vi.mocked(api.deleteList).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHookWithClient(() =>
      useDeleteTodoList({ onError }),
    );

    act(() => result.current.mutate("list1"));

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError.mock.calls[0][0]).toEqual(error);
  });
});
