import { apiFetch, json } from "./client";
import type { TodoItem } from "@types";

export function deleteItem(id: TodoItem["id"]): Promise<void> {
  return apiFetch(`/api/todoitems/${id}`, { method: "DELETE" });
}

export function updateItem(
  id: TodoItem["id"],
  payload: Omit<TodoItem, "todoList" | "id">,
): Promise<TodoItem> {
  return apiFetch(`/api/todoitems/${id}`, { method: "PUT", ...json(payload) });
}
