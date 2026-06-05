import { useState } from "react";
import { TodoList, TodoStatus } from "@types";
import { ProgressBar, StatusBadge, Button } from "@components";
import { Pencil } from "../../../icons";
import { TodoListEditForm } from "./TodoListEditForm";

interface TodoListPanelHeaderProps {
  listId: string;
  currentList: TodoList | undefined;
  allDone: boolean;
  completed: number;
  total: number;
}

export const TodoListPanelHeader = ({
  listId,
  currentList,
  allDone,
  completed,
  total,
}: TodoListPanelHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const listName = currentList?.name ?? listId;

  return (
    <div className="px-6 pt-8 pb-4 shrink-0">
      <p className="font-mono text-[10px] uppercase tracking-widest text-on-primary-muted mb-1">
        #{listId}
      </p>
      <div className="group flex items-start mb-4 gap-2 min-h-[30px]">
        {isEditing ? (
          <TodoListEditForm
            listId={listId}
            listName={listName}
            setIsEditing={setIsEditing}
          />
        ) : (
          <div className="flex gap-2 items-center">
            <h2 className="flex text-xl font-medium tracking-tight text-on-primary">
              {listName}
            </h2>
            {allDone && (
              <StatusBadge status={TodoStatus.Done}>Completed!</StatusBadge>
            )}
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label={`Rename ${listName}`}
              title="Edit Name"
              className="ml-auto opacity-0 group-hover:opacity-100 shrink-0 text-on-primary-muted hover:text-on-primary transition-opacity"
            >
              <Pencil size={12} />
            </Button>
          </div>
        )}
      </div>
      <ProgressBar completed={completed} total={total} />
    </div>
  );
};
