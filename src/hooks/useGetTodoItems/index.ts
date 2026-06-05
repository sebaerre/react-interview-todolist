import { useQuery } from "@tanstack/react-query";
import { fetchTodoItems, qk } from "../../api";
import type { TodoList } from "@types";

export function useGetTodoItems(id: TodoList["id"], enabled: boolean) {
  return useQuery({
    queryKey: qk.items(id),
    queryFn: () => fetchTodoItems(id),
    staleTime: Infinity,
    enabled,
  });
}
