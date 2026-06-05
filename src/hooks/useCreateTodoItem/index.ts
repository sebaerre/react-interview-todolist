import { useQueryClient } from "@tanstack/react-query";
import { createTodoItem, qk } from "../../api";
import type { TodoItem } from "@types";
import { useMutationWithNotification } from "../useMutationWithNotification";
import { UseMutationWithNotificationOptions } from "../types";

interface Options extends Omit<UseMutationWithNotificationOptions<TodoItem, Error, TodoItem["name"]>, "onSuccess"> {
  listId: string;
  onSuccess?: (data: TodoItem) => void;
}

export function useCreateTodoItem({ listId, onSuccess, onError, successMessage, errorMessage }: Options) {
  const queryClient = useQueryClient();
  return useMutationWithNotification<TodoItem, Error, string>({
    mutationFn: (name: string) => createTodoItem({ listId, name }),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: qk.items(listId) });
      onSuccess?.(newItem);
    },
    onError,
    successMessage,
    errorMessage,
  });
}