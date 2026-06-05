import { useQuery } from "@tanstack/react-query";
import { fetchTodoLists, qk } from "../../api";

export function useGetTodoLists() {
  return useQuery({
    queryKey: qk.lists(),
    queryFn: fetchTodoLists,
    staleTime: Infinity,
  });
}
