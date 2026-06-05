import { EmptyList } from "../../icons";

export const DashboardEmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-sm text-on-primary-muted">
    <EmptyList />
    <p>No lists yet. Create one to get started.</p>
  </div>
);
