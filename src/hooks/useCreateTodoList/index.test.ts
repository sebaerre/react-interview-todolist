import { describe, it, expect, vi, afterEach } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { useCreateTodoList } from ".";
import * as api from "../../api";
import { renderHookWithClient, createQueryClient } from "../../test/utils";
import { qk } from "../../api";

vi.mock("../../api", () => import("../../test/apiMock"));

describe("useCreateTodoList", () => {
  afterEach(() => vi.clearAllMocks());
  it("calls createTodoList with the provided name", async () => {
    const newList = { id: "list1", name: "My List" };
    vi.mocked(api.createTodoList).mockResolvedValue(newList);

    const { result } = renderHookWithClient(() => useCreateTodoList());

    act(() => result.current.mutate("My List"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(api.createTodoList)).toHaveBeenCalledWith("My List");
  });

  it("invalidates the lists query on success", async () => {
    const newList = { id: "list1", name: "My List" };
    vi.mocked(api.createTodoList).mockResolvedValue(newList);

    const qc = createQueryClient();
    qc.setQueryData(qk.lists(), []);
    const { result } = renderHookWithClient(() => useCreateTodoList(), qc);

    act(() => result.current.mutate("My List"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryState(qk.lists())?.isInvalidated).toBe(true);
  });

  it("calls the onSuccess callback with the new list", async () => {
    const newList = { id: "list1", name: "My List" };
    vi.mocked(api.createTodoList).mockResolvedValue(newList);

    const onSuccess = vi.fn();
    const { result } = renderHookWithClient(() =>
      useCreateTodoList({ onSuccess }),
    );

    act(() => result.current.mutate("My List"));

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(newList),
    );
  });

  it("calls the onError callback on failure", async () => {
    const error = new Error("Server error");
    vi.mocked(api.createTodoList).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHookWithClient(() =>
      useCreateTodoList({ onError }),
    );

    act(() => result.current.mutate("My List"));

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError.mock.calls[0][0]).toEqual(error);
  });
});
