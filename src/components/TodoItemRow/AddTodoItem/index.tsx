import { useState, useCallback } from "react";
import { useCreateTodoItem } from "@hooks";
import { CreateTodoItemForm } from "@components/TodoItemRow/CreateTodoItemForm";
import { Button, Spinner } from "@components";

export const AddTodoItem = ({ listId }: { listId: string }) => {
  const [newItemName, setNewItemName] = useState("");

  const createItemMutation = useCreateTodoItem({
    listId,
    onSuccess: () => setNewItemName(""),
    successMessage: "Todo added",
    errorMessage: "Failed to add todo",
  });

  const [isAddingItem, setIsAddingItem] = useState(false);
  const handleAddItem = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newItemName.trim()) createItemMutation.mutate(newItemName.trim());
    },
    [newItemName, createItemMutation],
  );

  const cancelAddItem = useCallback(() => {
    setIsAddingItem(false);
    setNewItemName("");
  }, []);

  return createItemMutation.isPending ? (
    <div className="flex w-full items-center px-6 py-3 border-b border-panel-divider">
      <Spinner label="Creating todo" size={16} />
    </div>
  ) : isAddingItem ? (
    <CreateTodoItemForm
      handleSubmit={handleAddItem}
      value={newItemName}
      handleChange={setNewItemName}
      handleCancel={cancelAddItem}
    />
  ) : (
    <Button
      type="button"
      onClick={() => setIsAddingItem(true)}
      className="flex items-center gap-3 px-6 py-3 w-full text-left text-on-primary-muted hover:text-on-primary hover:bg-tertiary transition-colors border-b border-panel-divider"
    >
      <span className="text-base leading-none">+</span> Add todo
    </Button>
  );
};
