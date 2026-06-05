import { useState, useRef, useCallback } from "react";
import { InlineInput, Button } from "@components";
import { useCreateTodoList, useCancelEdit } from "@hooks";

interface CreateTodoListProps {
  onSelect: (listId: string) => void;
}

export const CreateTodoList = ({ onSelect }: CreateTodoListProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newListName, setNewListName] = useState("");

  const createMutation = useCreateTodoList({
    onSuccess: (todoList) => {
      reset();
      onSelect(todoList.id);
    },
    successMessage: "List created",
    errorMessage: "Failed to create list",
  });
  const formRef = useRef(null);

  const handleCreate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newListName.trim()) createMutation.mutate(newListName.trim());
    },
    [createMutation, newListName],
  );

  const reset = useCallback(() => {
    setIsAdding(false);
    setNewListName("");
  }, []);

  const { handleKeyDown } = useCancelEdit(formRef, reset);

  return (
    <div className="mt-auto pt-2 border-t border-primary-divider mx-0">
      {isAdding ? (
        <form onSubmit={handleCreate} ref={formRef}>
          <InlineInput
            id="create-list"
            value={newListName}
            onChange={setNewListName}
            onKeyDown={handleKeyDown}
            placeholder="List name…"
            label="List name"
            disabled={createMutation.isPending}
            className="w-full px-4 py-2.5 text-sm bg-primary-active text-on-primary placeholder:text-on-primary-muted outline-none border-b border-primary-divider"
          />
        </form>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          className="w-full text-left px-4 py-3.5 text-on-primary-muted hover:text-on-primary hover:bg-primary-hover transition-colors"
        >
          + New list
        </Button>
      )}
    </div>
  );
};
