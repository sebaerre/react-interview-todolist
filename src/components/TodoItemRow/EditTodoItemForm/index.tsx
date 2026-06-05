import { useState, useRef } from "react";
import { Checkmark } from "../../../icons";
import { TodoItem } from "@types";
import { useCancelEdit } from "@hooks";
import { Checkbox, Button, InlineInput } from "@components";

interface EditTodoItemFormProps {
  disabled: boolean;
  item: TodoItem;
  setIsEditing: (isEditing: boolean) => void;
  onSubmit: ({
    id,
    payload,
  }: {
    id: TodoItem["id"];
    payload: Omit<TodoItem, "id" | "todoList">;
  }) => void;
}

export const EditTodoItemForm = ({
  disabled,
  item,
  setIsEditing,
  onSubmit,
}: EditTodoItemFormProps) => {
  const [editName, setEditName] = useState(item.name);
  const formRef = useRef(null);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = editName.trim();
    if (trimmed && trimmed !== item.name) {
      onSubmit({
        id: item.id,
        payload: { name: trimmed, done: item.done },
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(item.name);
  };

  const { handleKeyDown } = useCancelEdit(formRef, handleCancel);

  return (
    <>
      <Checkbox checked={item.done} />
      <form
        onSubmit={handleSave}
        className="flex flex-1 items-center gap-2 min-w-0"
        ref={formRef}
      >
        <InlineInput
          value={editName}
          onChange={setEditName}
          onBlur={handleCancel}
          onKeyDown={handleKeyDown}
          placeholder="Todo name…"
          label={`Rename ${item.name}`}
          disabled={disabled}
          className="flex-1 text-sm bg-transparent text-on-primary outline-none"
        />
        <Button
          type="submit"
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Save todo item"
          title="Save"
          className="shrink-0 text-on-primary-muted hover:text-on-primary transition-colors"
        >
          <Checkmark size={12} />
        </Button>
      </form>
    </>
  );
};
