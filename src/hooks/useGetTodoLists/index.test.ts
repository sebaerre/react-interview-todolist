import { describe, it, expect, vi, afterEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { useGetTodoLists } from ".";
import * as api from "../../api";
import { renderHookWithClient } from "../../test/utils";

vi.mock("../../api", () => import("../../test/apiMock"));

describe("useGetTodoLists", () => {
  afterEach(() => vi.clearAllMocks());
  it("fetches and returns the list of todo lists on success", async () => {
    const mockLists = [{ id: "list1", name: "Shopping" }];
    vi.mocked(api.fetchTodoLists).mockResolvedValue(mockLists);

    const { result } = renderHookWithClient(() => useGetTodoLists());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockLists);
  });

  it("transitions to error status when fetch fails", async () => {
    vi.mocked(api.fetchTodoLists).mockRejectedValue(new Error("Network error"));

    const { result } = renderHookWithClient(() => useGetTodoLists());

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
