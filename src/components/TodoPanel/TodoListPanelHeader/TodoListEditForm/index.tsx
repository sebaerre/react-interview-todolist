import React, { useState, useRef, useCallback } from "react";
import { Checkmark } from "../../../../icons";
import { useUpdateTodoList, useCancelEdit } from "@hooks";
import { Button, InlineInput, Spinner } from "@components";

interface TodoListEditFormProps {
  listName: string;
  listId: string;
  setIsEditing: (value: boolean) => void;
}

export const TodoListEditForm = ({
  listName,
  listId,
  setIsEditing,
}: TodoListEditFormProps) => {
  const [editName, setEditName] = useState(listName);
  const [error, setError] = useState<string | null>(null);

  const updateTodoList = useUpdateTodoList({
    successMessage: "List name updated",
    errorMessage: "Failed to update list name",
    onError: () => setError("Something went wrong"),
    onSuccess: () => setIsEditing(false),
  });

  const formRef = useRef(null);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditName(listName);
  }, [setIsEditing, listName]);

  const handleChange = useCallback((value: string) => {
    setError(null);
    setEditName(value);
  }, []);

  const { handleKeyDown } = useCancelEdit(formRef, handleCancel);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = editName.trim();
    if (trimmed && trimmed !== listName) {
      updateTodoList.mutate({ id: listId, name: trimmed });
    }
  };

  return (
    <div className="flex flex-col">
      <form
        onSubmit={handleSave}
        className="flex flex-1 items-center gap-2 min-w-0 py-0"
        ref={formRef}
      >
        <InlineInput
          id={`list-name-${listId}`}
          value={editName}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="List name…"
          label={`Rename ${listName}`}
          className="flex-1 text-xl font-medium tracking-tight w-80 bg-transparent text-on-primary outline-none leading-none py-0 border-0 l-0"
          disabled={updateTodoList.isPending}
        />
        {updateTodoList.isPending && <Spinner size={16} />}
        <Button
          type="submit"
          aria-label="Save todo list"
          title="Save"
          className="shrink-0 text-on-primary-muted hover:text-on-primary transition-colors"
        >
          <Checkmark size={12} />
        </Button>
      </form>
      {error && (
        <span className="text-xs text-status-red-text pl-4">{error}</span>
      )}
    </div>
  );
};
