import { useQueryClient } from "@tanstack/react-query";
import { updateItem, qk } from "../../api";
import type { TodoItem } from "@types";
import { useMutationWithNotification } from "../useMutationWithNotification";
import { UseMutationWithNotificationOptions } from "../types";

type UpdateTodoItemPayload = {
  id: TodoItem["id"];
  payload: {
    name: TodoItem["name"];
    done: TodoItem["done"];
  };
};

interface Options extends Omit<
  UseMutationWithNotificationOptions<TodoItem, Error, UpdateTodoItemPayload>,
  "onSuccess"
> {
  listId: string;
  onSuccess?: (data: TodoItem) => void;
}

export function useUpdateTodoItem({
  listId,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: Options) {
  const queryClient = useQueryClient();
  return useMutationWithNotification<TodoItem, Error, UpdateTodoItemPayload>({
    mutationFn: ({ id, payload }: UpdateTodoItemPayload) =>
      updateItem(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData<TodoItem[]>(
        qk.items(listId),
        (old) =>
          old?.map((item) =>
            item.id === data.id
              ? { ...item, name: data.name, done: data.done }
              : item,
          ) ?? [],
      );
      onSuccess?.(data);
    },
    onError,
    successMessage,
    errorMessage,
  });
}
