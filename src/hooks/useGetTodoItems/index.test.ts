import { describe, it, expect, vi, afterEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { useGetTodoItems } from ".";
import * as api from "../../api";
import { renderHookWithClient } from "../../test/utils";

vi.mock("../../api", () => import("../../test/apiMock"));

describe("useGetTodoItems", () => {
  afterEach(() => vi.clearAllMocks());
  describe("when enabled is true", () => {
    it("fetches and returns items for the given list id", async () => {
      const mockItems = [
        { id: 1, todoList: "list1", name: "Buy milk", done: false },
      ];
      vi.mocked(api.fetchTodoItems).mockResolvedValue(mockItems);

      const { result } = renderHookWithClient(() =>
        useGetTodoItems("list1", true),
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockItems);
      expect(vi.mocked(api.fetchTodoItems)).toHaveBeenCalledWith("list1");
      expect(vi.mocked(api.fetchTodoItems)).toHaveBeenCalledTimes(1);
    });

    describe("when fetchTodoItems rejects", () => {
      it("surfaces the error and sets isError to true", async () => {
        const error = new Error("Network error");
        vi.mocked(api.fetchTodoItems).mockRejectedValue(error);

        const { result } = renderHookWithClient(() =>
          useGetTodoItems("list1", true),
        );

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toBe(error);
        expect(result.current.data).toBeUndefined();
      });
    });
  });

  describe("when enabled is false", () => {
    it("does not call fetchTodoItems", () => {
      renderHookWithClient(() => useGetTodoItems("list1", false));
      expect(vi.mocked(api.fetchTodoItems)).not.toHaveBeenCalled();
    });

    it("returns undefined data without entering loading state", () => {
      const { result } = renderHookWithClient(() =>
        useGetTodoItems("list1", false),
      );
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.fetchStatus).toBe("idle");
    });
  });
});
