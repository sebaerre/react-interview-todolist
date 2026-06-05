import { describe, it, expect, vi, afterEach } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { useUpdateTodoList } from ".";
import * as api from "../../api";
import { renderHookWithClient, createQueryClient } from "../../test/utils";
import { qk } from "../../api";
import { toast } from "sonner";

vi.mock("../../api", () => import("../../test/apiMock"));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("useUpdateTodoList", () => {
  afterEach(() => vi.clearAllMocks());
  it("calls updateList with the provided id and name", async () => {
    const updated = { id: "list1", name: "New Name" };
    vi.mocked(api.updateList).mockResolvedValue(updated);

    const { result } = renderHookWithClient(() => useUpdateTodoList());

    await act(async () =>
      result.current.mutate({ id: "list1", name: "New Name" }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(api.updateList)).toHaveBeenCalledWith("list1", "New Name");
  });

  it("updates only the matching list in the cache via setQueryData", async () => {
    const updated = { id: "list1", name: "Updated" };
    vi.mocked(api.updateList).mockResolvedValue(updated);

    const qc = createQueryClient();
    qc.setQueryData(qk.lists(), [
      { id: "list1", name: "Original" },
      { id: "list2", name: "Other" },
    ]);

    const { result } = renderHookWithClient(() => useUpdateTodoList(), qc);

    await act(async () =>
      result.current.mutate({ id: "list1", name: "Updated" }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const lists = qc.getQueryData(qk.lists()) as { id: string; name: string }[];
    expect(lists.find((l) => l.id === "list1")?.name).toBe("Updated");
    expect(lists.find((l) => l.id === "list2")?.name).toBe("Other");
  });

  it("falls back to an empty array when cache is empty", async () => {
    const updated = { id: "list1", name: "New Name" };
    vi.mocked(api.updateList).mockResolvedValue(updated);

    const qc = createQueryClient();
    const { result } = renderHookWithClient(() => useUpdateTodoList(), qc);

    await act(async () =>
      result.current.mutate({ id: "list1", name: "New Name" }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const lists = qc.getQueryData(qk.lists());
    expect(lists).toEqual([]);
  });

  it("calls the onSuccess callback with the updated list", async () => {
    const updated = { id: "list1", name: "New Name" };
    vi.mocked(api.updateList).mockResolvedValue(updated);

    const onSuccess = vi.fn();
    const { result } = renderHookWithClient(() =>
      useUpdateTodoList({ onSuccess }),
    );

    await act(async () =>
      result.current.mutate({ id: "list1", name: "New Name" }),
    );

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith({ data: updated }),
    );
  });

  it("calls the onError callback on failure", async () => {
    const error = new Error("Server error");
    vi.mocked(api.updateList).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHookWithClient(() =>
      useUpdateTodoList({ onError }),
    );

    await act(async () =>
      result.current.mutate({ id: "list1", name: "New Name" }),
    );

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(
        error,
        { id: "list1", name: "New Name" },
        undefined,
        expect.objectContaining({
          client: expect.any(Object),
        }),
      ),
    );
  });

  it("shows error notification on failure", async () => {
    const error = new Error("Server error");
    vi.mocked(api.updateList).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHookWithClient(() =>
      useUpdateTodoList({ onError, errorMessage: "Failed to rename list" }),
    );

    await act(async () =>
      result.current.mutate({ id: "list1", name: "New Name" }),
    );

    await waitFor(() =>
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        "Failed to rename list",
      ),
    );
    expect(onError).toHaveBeenCalledWith(
      error,
      { id: "list1", name: "New Name" },
      undefined,
      expect.objectContaining({
        client: expect.any(Object),
      }),
    );
  });

  it("shows success notification on success", async () => {
    const updated = { id: "list1", name: "New Name" };
    vi.mocked(api.updateList).mockResolvedValue(updated);

    const { result } = renderHookWithClient(() =>
      useUpdateTodoList({ successMessage: "List renamed" }),
    );

    await act(async () =>
      result.current.mutate({ id: "list1", name: "New Name" }),
    );

    await waitFor(() =>
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith("List renamed"),
    );
  });
});
