import { useQueryClient } from "@tanstack/react-query";
import { deleteList, qk } from "../../api";
import type { TodoList } from "@types";
import { useMutationWithNotification } from "../useMutationWithNotification";
import { UseMutationWithNotificationOptions } from "../types";

export function useDeleteTodoList({
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: Omit<
  UseMutationWithNotificationOptions<void, Error, TodoList["id"]>,
  "onSuccess"
> & {
  onSuccess?: (id: TodoList["id"]) => void;
} = {}) {
  const queryClient = useQueryClient();
  return useMutationWithNotification<void, Error, TodoList["id"]>({
    mutationFn: (id: TodoList["id"]) => deleteList(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: qk.lists() });
      queryClient.removeQueries({ queryKey: qk.items(id) });
      onSuccess?.(id);
    },
    onError,
    successMessage,
    errorMessage,
  });
}
