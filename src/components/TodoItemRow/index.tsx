import { useState } from "react";
import type { TodoItem } from "@types";
import { TodoStatus } from "@types";
import { useDeleteTodoItem, useUpdateTodoItem } from "@hooks";
import { Delete, Pencil } from "../../icons";
import { StatusBadge, Spinner, Button, Checkbox } from "@components";
import { TodoItemLabel } from "./TodoItemLabel";

import { EditTodoItemForm } from "./EditTodoItemForm";
import { toast } from "sonner";

interface Props {
  item: TodoItem;
  listId: string;
}

const getStatus = (item: TodoItem, isBusy: boolean) =>
  isBusy
    ? TodoStatus.Syncing
    : item.done
      ? TodoStatus.Done
      : TodoStatus.Pending;

/**
 * Single todo item row. Manages two independent mutations (update and delete)
 * and an `isEditing` toggle. While either mutation is in-flight the checkbox
 * and action buttons are disabled and the status badge shows `Syncing`.
 */
export const TodoItemRow = ({ item, listId }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  const updateMutation = useUpdateTodoItem({
    listId,
    successMessage: "Todo updated successfully",
    errorMessage: "Failed to update todo",
  });

  const deleteItemMutation = useDeleteTodoItem({
    listId,
    onSuccess: (todoName: string | undefined) =>
      toast.success(todoName ? `Item "${todoName}" deleted` : "Item deleted"),
    errorMessage: "Failed to delete todo",
  });

  const isUpdating = updateMutation.isPending;
  const isDeleting = deleteItemMutation.isPending;
  const isBusy = isUpdating || isDeleting;

  const status = getStatus(item, isBusy);

  const handleToggle = () => {
    updateMutation.mutate({
      id: item.id,
      payload: { name: item.name, done: !item.done },
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItemMutation.mutate(item.id);
  };

  if (isEditing) {
    return (
      <div className="group flex items-center gap-3 px-6 py-3 border-b border-panel-divider select-none">
        <EditTodoItemForm
          item={item}
          setIsEditing={setIsEditing}
          onSubmit={updateMutation.mutate}
          disabled={isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-3 px-6 py-3 border-b border-panel-divider select-none">
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <button
          type="button"
          role="checkbox"
          aria-checked={item.done}
          aria-label={item.name}
          onClick={handleToggle}
          disabled={isBusy}
          className="flex items-center gap-3 min-w-0 cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
        >
          <Checkbox checked={item.done} />
          <TodoItemLabel
            name={item.name}
            done={item.done}
            syncing={isUpdating}
          />
        </button>

        <Button
          type="button"
          onClick={handleEdit}
          aria-label={`Rename ${item.name}`}
          title="Edit Name"
          className="opacity-0 group-hover:opacity-100 shrink-0 text-on-primary-muted hover:text-on-primary transition-opacity"
        >
          <Pencil size={14} />
        </Button>
      </div>

      {isDeleting ? (
        <Spinner size={16} label={`Deleting ${item.name}`} />
      ) : (
        <>
          <Button
            type="button"
            onClick={handleDelete}
            aria-label={`Delete ${item.name}`}
            title="Delete"
            className="opacity-0 group-hover:opacity-100 shrink-0 text-on-primary-muted hover:text-status-red-text transition-opacity"
          >
            <Delete size={14} />
          </Button>
        </>
      )}

      <StatusBadge status={status} />
    </div>
  );
};
