import { useQueryClient } from "@tanstack/react-query";
import { updateList, qk } from "../../api";
import type { TodoList } from "@types";
import { useMutationWithNotification } from "../useMutationWithNotification";
import { MutationCallbackOptions } from "../types";

export function useUpdateTodoList({
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: MutationCallbackOptions<TodoList> = {}) {
  const queryClient = useQueryClient();
  return useMutationWithNotification({
    mutationFn: ({ id, name }: { id: TodoList["id"]; name: string }) =>
      updateList(id, name),
    onSuccess: (data) => {
      queryClient.setQueryData<TodoList[]>(
        qk.lists(),
        (old) =>
          old?.map((list) =>
            list.id === data.id ? { ...list, name: data.name } : list,
          ) ?? [],
      );
      onSuccess?.({ data });
    },
    onError,
    successMessage,
    errorMessage,
  });
}
