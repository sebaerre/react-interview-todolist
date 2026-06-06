import { useCompleteAll, useTodoPanelStats, useGetTodoItems, useGetTodoLists } from "@hooks";
import { toast } from "sonner";
import { AddTodoItem } from "@components/TodoItemRow/AddTodoItem";
import { TodoListPanelHeader } from "./TodoListPanelHeader";
import { TodoItemsList } from "./TodoItemsList";
import { RightPanel } from "./RightPanel";
import { useQueryClient } from "@tanstack/react-query";
import { TodoItem, CompleteAllProgressEvent } from "@types";

interface Props {
  listId: string;
}

/**
 * Main content panel for a single todo list. Orchestrates the complete-all
 * flow: progress events from the server are applied directly to the React Query
 * cache via `setQueryData` so the UI updates optimistically without waiting for
 * a refetch.
 */
export const TodoPanel = ({ listId }: Props) => {
  const { data: lists = [] } = useGetTodoLists();
  const { data: items = [], isLoading } = useGetTodoItems(listId, true);
  const queryClient = useQueryClient();
  const onProgress = (event: CompleteAllProgressEvent) => {
    queryClient.setQueryData<TodoItem[]>(["todoitems", listId], (old) => {
      if (!old) return old;

      return old.map((item) =>
        item.id === event.itemId ? { ...item, done: true } : item,
      );
    });
  };

  const onDone = () => toast.success("All todos completed");
  const onError = (error: string) => toast.error(error);
  const { isPending, trigger } = useCompleteAll({
    listId,
    onProgress,
    onDone,
    onError,
  });

  const currentList = lists.find((l) => l.id === listId);
  const { sortedItems, done, total, remaining, allDone } =
    useTodoPanelStats(items);

  const completeAllDisabled = allDone || isPending || total === 0;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-on-primary-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden px-2">
      <TodoListPanelHeader
        listId={listId}
        completed={done}
        currentList={currentList}
        allDone={allDone}
        total={total}
      />
      <div className="flex gap-4">
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-1/2 border-x border-t ml-5 shadow-md shadow-black h-fit max-h-190 border-panel-divider">
          <TodoItemsList todoItems={sortedItems} listId={listId} />
          <AddTodoItem listId={listId} />
        </div>

        <RightPanel
          remaining={remaining}
          onCompleteAllClick={() => trigger()}
          completeAllDisabled={completeAllDisabled}
          completeAllPending={isPending}
        />
      </div>
    </div>
  );
};
