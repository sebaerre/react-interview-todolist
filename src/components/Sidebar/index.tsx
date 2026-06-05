import { useCallback, useRef } from "react";
import { useGetTodoLists, useDeleteTodoList } from "@hooks";
import { ListNavItem } from "@components";
import { CreateTodoList } from "./CreateTodoList";
import { toast } from "sonner";

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const Sidebar = ({ selectedId, onSelect }: Props) => {
  const { data: lists = [] } = useGetTodoLists();
  const deletedListRef = useRef<string>(null);

  const handleSuccess = () => {
    onSelect(lists[0]?.id);
    toast.success(
      deletedListRef.current
        ? `List "${deletedListRef.current}" deleted`
        : "List deleted",
    );
    deletedListRef.current = null;
  };

  const deleteMutation = useDeleteTodoList({
    errorMessage: "Failed to delete list",
    onSuccess: handleSuccess,
  });

  const handleDelete = useCallback(
    (id: string, name: string) => {
      deletedListRef.current = name;
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  return (
    <aside className="w-[280px] shrink-0 h-full flex flex-col bg-primary border-r border-primary-divider">
      <div className="px-4 pt-6 pb-4 shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-widest text-on-primary-muted mb-1">
          Workspace
        </p>
        <h1 className="text-on-primary text-base font-medium">My Lists</h1>
      </div>

      <div className="border-t border-primary-divider mx-4 shrink-0" />

      <nav className="flex-1 overflow-y-auto py-2 flex flex-col">
        {lists.map((list) => (
          <ListNavItem
            key={list.id}
            listId={list.id}
            listName={list.name}
            selectedId={selectedId}
            onSelect={onSelect}
            onDelete={handleDelete}
            isDeleting={
              deleteMutation.isPending && deleteMutation.variables === list.id
            }
          />
        ))}

        <CreateTodoList onSelect={onSelect} />
      </nav>
    </aside>
  );
};
