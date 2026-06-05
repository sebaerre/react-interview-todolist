import classNames from "classnames";
import { useMemo } from "react";
import { useGetTodoItems } from "@hooks";
import { TodoStatus } from "@types";
import { Delete, Checkmark } from "../../icons";
import { Spinner, Button, StatusBadge } from "@components";

interface Props {
  listId: string;
  listName: string;
  selectedId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string, listName: string) => void;
  isDeleting?: boolean;
}

/**
 * Sidebar navigation row for a single todo list. The `done` / `total` counts
 * are derived from the React Query cache via `useGetTodoItems` — the query is
 * only enabled when the item is the active selection, so counts show `"-"` for
 * unvisited lists until they are selected at least once.
 */
export const ListNavItem = ({
  listId,
  listName,
  selectedId,
  onSelect,
  onDelete,
  isDeleting,
}: Props) => {
  const isActive = listId === selectedId;
  const { data } = useGetTodoItems(listId, isActive);
  const total = useMemo(() => data?.length ?? "-", [data]);
  const done = useMemo(() => data?.filter((i) => i.done).length ?? "-", [data]);

  const finishedList =
    typeof done === "number" &&
    typeof total === "number" &&
    total > 0 &&
    total === done;

  return (
    <div
      className={classNames(
        "group relative w-full py-2 flex items-center transition-colors select-none",
        isActive
          ? "bg-primary-active text-on-primary"
          : "text-on-primary-muted hover:bg-primary-hover",
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent" />
      )}

      <button
        type="button"
        onClick={() => onSelect(listId)}
        aria-current={isActive ? "page" : undefined}
        aria-label={listName}
        className="flex flex-1 items-center gap-2 min-w-0 text-left px-4 py-2.5 cursor-pointer"
      >
        <span className="font-mono text-xs text-on-primary-subtle">
          #{listId}
        </span>

        <span className="flex-1 text-sm truncate" title={listName}>
          {listName}
        </span>
        {finishedList && (
          <StatusBadge
            status={TodoStatus.Done}
            className="flex items-center justify-center h-5 w-5 p-0!"
          >
            <Checkmark label="todolist-done" />
          </StatusBadge>
        )}

        <span className="font-mono text-xs text-on-primary-subtle">
          {done}/{total}
        </span>
      </button>

      {isDeleting ? (
        <Spinner size={16} label={`Deleting ${listName}`} />
      ) : (
        <Button
          type="button"
          onClick={() => onDelete(listId, listName)}
          aria-label={`Delete ${listName}`}
          title="Delete"
          className="mr-4 ml-1 opacity-0 group-hover:opacity-100 shrink-0 text-on-primary-muted hover:text-on-primary disabled:opacity-30 transition-opacity"
        >
          <Delete size={12} />
        </Button>
      )}
    </div>
  );
};
