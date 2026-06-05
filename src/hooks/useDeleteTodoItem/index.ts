import { useQueryClient } from "@tanstack/react-query";
import { deleteItem, qk } from "../../api";
import type { TodoItem } from "@types";
import { useMutationWithNotification } from "../useMutationWithNotification";
import { UseMutationWithNotificationOptions } from "../types";

interface Options extends Omit<
  UseMutationWithNotificationOptions<void, Error, TodoItem["id"]>,
  "onSuccess"
> {
  listId: string;
  onSuccess?: (name?: TodoItem["name"]) => void;
}

export function useDeleteTodoItem({
  listId,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: Options) {
  const queryClient = useQueryClient();
  return useMutationWithNotification<void, Error, TodoItem["id"]>({
    mutationFn: (id: TodoItem["id"]) => deleteItem(id),
    onSuccess: (_data, id) => {
      const items = queryClient.getQueryData<TodoItem[]>(qk.items(listId));
      const deletedItem = items?.find((item) => item.id === id);

      queryClient.invalidateQueries({ queryKey: qk.items(listId) });
      onSuccess?.(deletedItem?.name);
    },
    onError,
    successMessage,
    errorMessage,
  });
}
