import { useState, useEffect } from "react";
import { useGetTodoLists } from "@hooks";
import { Sidebar, TodoPanel, DashboardEmptyState } from "@components";

/**
 * Root layout component. Owns the selected-list ID and auto-selects the first
 * list whenever none is selected and at least one list exists (e.g. on initial
 * load or after the selected list is deleted).
 */
export const Dashboard = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: lists = [] } = useGetTodoLists();

  useEffect(() => {
    if (lists.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId) {
      setSelectedId(lists[0].id);
    }
  }, [lists, selectedId]);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-panel-bg">
      <Sidebar selectedId={selectedId ?? ""} onSelect={setSelectedId} />
      <main className="flex-1 overflow-hidden flex">
        {selectedId ? (
          <TodoPanel listId={selectedId} />
        ) : (
          <DashboardEmptyState />
        )}
      </main>
    </div>
  );
};
