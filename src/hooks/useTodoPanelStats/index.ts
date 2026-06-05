import { useMemo } from "react";
import type { TodoItem } from "@types";

interface TodoPanelStats {
  sortedItems: TodoItem[];
  done: number;
  total: number;
  remaining: number;
  allDone: boolean;
}

/**
 * Derives display statistics from a flat item list. Done items are sorted to
 * the bottom so the active tasks always appear first. `allDone` is `false`
 * when the list is empty to prevent a premature "completed" state on load.
 */
export function useTodoPanelStats(items: TodoItem[]): TodoPanelStats {
  const { sortedItems, done, total, remaining } = useMemo(() => {
    const done = items.filter((i) => i.done).length;
    return {
      sortedItems: [...items].sort((a, b) => Number(a.done) - Number(b.done)),
      done,
      total: items.length,
      remaining: items.length - done,
    };
  }, [items]);

  const allDone = total > 0 && done === total;

  return { sortedItems, done, total, remaining, allDone };
}
