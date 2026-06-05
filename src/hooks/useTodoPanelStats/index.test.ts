import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTodoPanelStats } from ".";
import type { TodoItem } from "@types";

function makeItem(id: number, done: boolean): TodoItem {
  return { id, todoList: "list1", name: `Item ${id}`, done };
}

describe("useTodoPanelStats", () => {
  describe("with an empty list", () => {
    it("returns zero counts", () => {
      const { result } = renderHook(() => useTodoPanelStats([]));
      expect(result.current.done).toBe(0);
      expect(result.current.total).toBe(0);
      expect(result.current.remaining).toBe(0);
    });

    it("returns allDone as false (vacuously false: no items means not 'all done')", () => {
      const { result } = renderHook(() => useTodoPanelStats([]));
      expect(result.current.allDone).toBe(false);
    });

    it("returns an empty sortedItems array", () => {
      const { result } = renderHook(() => useTodoPanelStats([]));
      expect(result.current.sortedItems).toEqual([]);
    });
  });

  describe("with all items undone", () => {
    it("returns done=0 and remaining=total", () => {
      const items = [makeItem(1, false), makeItem(2, false)];
      const { result } = renderHook(() => useTodoPanelStats(items));
      expect(result.current.done).toBe(0);
      expect(result.current.remaining).toBe(2);
      expect(result.current.total).toBe(2);
    });

    it("returns allDone as false", () => {
      const items = [makeItem(1, false)];
      const { result } = renderHook(() => useTodoPanelStats(items));
      expect(result.current.allDone).toBe(false);
    });
  });

  describe("with mixed done/undone items", () => {
    it("places undone items before done items in sortedItems", () => {
      // items: [done=true, done=false, done=false] → sorted: [2, 3, 1]
      const items = [makeItem(1, true), makeItem(2, false), makeItem(3, false)];
      const { result } = renderHook(() => useTodoPanelStats(items));
      expect(result.current.sortedItems[0].id).toBe(2);
      expect(result.current.sortedItems[1].id).toBe(3);
      expect(result.current.sortedItems[2].id).toBe(1);
    });

    it("correctly counts done and remaining", () => {
      const items = [makeItem(1, true), makeItem(2, false), makeItem(3, true)];
      const { result } = renderHook(() => useTodoPanelStats(items));
      expect(result.current.done).toBe(2);
      expect(result.current.remaining).toBe(1);
      expect(result.current.total).toBe(3);
    });

    it("returns allDone as false", () => {
      const items = [makeItem(1, true), makeItem(2, false)];
      const { result } = renderHook(() => useTodoPanelStats(items));
      expect(result.current.allDone).toBe(false);
    });
  });

  describe("with all items done", () => {
    it("returns allDone as true", () => {
      const items = [makeItem(1, true), makeItem(2, true)];
      const { result } = renderHook(() => useTodoPanelStats(items));
      expect(result.current.allDone).toBe(true);
    });

    it("returns remaining=0", () => {
      const items = [makeItem(1, true), makeItem(2, true)];
      const { result } = renderHook(() => useTodoPanelStats(items));
      expect(result.current.remaining).toBe(0);
    });

    it("preserves item identity in sortedItems", () => {
      // All items are done, so relative order should be stable (sort is identity)
      const items = [makeItem(1, true), makeItem(2, true)];
      const { result } = renderHook(() => useTodoPanelStats(items));
      expect(result.current.sortedItems[0].id).toBe(1);
      expect(result.current.sortedItems[1].id).toBe(2);
    });
  });

  describe("memoization", () => {
    it("returns the same sortedItems reference when the same items array instance is passed", () => {
      const items = [makeItem(1, false)];
      const { result, rerender } = renderHook(() => useTodoPanelStats(items));
      const first = result.current.sortedItems;
      rerender();
      expect(result.current.sortedItems).toBe(first);
    });

    it("returns a new sortedItems reference when a new array instance is passed, even with equal contents", () => {
      // Documents that memoization is by reference, not deep equality.
      // Callers should stabilize their array reference (e.g. with useMemo) to avoid unnecessary recomputes.
      const { result, rerender } = renderHook(
        ({ items }: { items: TodoItem[] }) => useTodoPanelStats(items),
        { initialProps: { items: [makeItem(1, false)] } },
      );
      const first = result.current.sortedItems;
      rerender({ items: [makeItem(1, false)] }); // new array reference, same content
      expect(result.current.sortedItems).not.toBe(first);
    });
  });
});
