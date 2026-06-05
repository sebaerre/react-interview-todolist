import { apiFetch, json } from "./client";
import type { TodoItem, TodoList, CompleteAllProgressEvent } from "@types";

export function fetchTodoLists(): Promise<TodoList[]> {
  return apiFetch("/api/todolists");
}

export function fetchTodoItems(id: TodoList["id"]): Promise<TodoItem[]> {
  return apiFetch(`/api/todolists/${id}/todoitems`);
}

export function createTodoList(name: string): Promise<TodoList> {
  return apiFetch("/api/todolists", { method: "POST", ...json({ name }) });
}

export function createTodoItem({
  listId,
  name,
}: {
  listId: string;
  name: string;
}): Promise<TodoItem> {
  return apiFetch(`/api/todolists/${listId}/todoitems`, {
    method: "POST",
    ...json({ name }),
  });
}

export function deleteList(id: TodoList["id"]): Promise<void> {
  return apiFetch(`/api/todolists/${id}`, { method: "DELETE" });
}

export function updateList(
  id: TodoList["id"],
  name: string,
): Promise<TodoList> {
  return apiFetch(`/api/todolists/${id}`, { method: "PUT", ...json({ name }) });
}

/**
 * Starts the complete-all flow for a list and reads the server's streaming
 * newline-delimited JSON response. Each line is parsed and dispatched to
 * `onProgress`; the final `{ done: true }` sentinel triggers `onDone`.
 * Pass an `AbortSignal` to cancel mid-stream — the reader is always released
 * in the `finally` block regardless of how the stream ends.
 */
export const completeAll = async (
  listId: string,
  onProgress: (event: CompleteAllProgressEvent) => void,
  onDone: () => void,
  signal?: AbortSignal,
): Promise<void> => {
  const res = await fetch(`/api/todolists/${listId}/complete-all`, {
    method: "POST",
    signal,
  });
  if (!res.ok)
    throw new Error(
      `POST /api/todolists/${listId}/complete-all failed: ${res.status}`,
    );
  if (!res.body) throw new Error("No response body");

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onDone();
        break;
      }
      buffer += value;
      for (const line of buffer.split("\n").slice(0, -1)) {
        if (!line.trim()) continue;

        const data = JSON.parse(line);

        if ("error" in data) throw new Error(data.message);
        if (!("done" in data)) onProgress(data);
      }
      buffer = buffer.slice(buffer.lastIndexOf("\n") + 1);
    }
  } finally {
    reader.cancel();
  }
};
