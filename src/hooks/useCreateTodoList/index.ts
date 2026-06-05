import { useQueryClient } from "@tanstack/react-query";
import { createTodoList, qk } from "../../api";
import type { TodoList } from "@types";
import { useMutationWithNotification } from "../useMutationWithNotification";
import { UseMutationWithNotificationOptions } from "../types";

export function useCreateTodoList({
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: Omit<UseMutationWithNotificationOptions<TodoList, Error, string>, "onSuccess"> & {
  onSuccess?: (data: TodoList) => void;
} = {}) {
  const queryClient = useQueryClient();
  return useMutationWithNotification<TodoList, Error, string>({
    mutationFn: (name: string) => createTodoList(name),
    onSuccess: (newList) => {
      queryClient.invalidateQueries({ queryKey: qk.lists() });
      onSuccess?.(newList);
    },
    onError,
    successMessage,
    errorMessage,
  });
}