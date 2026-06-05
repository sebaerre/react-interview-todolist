import React, { memo } from "react";
import { TodoStatus } from "@types";
import classNames from "classnames";

interface Props {
  children?: React.ReactNode;
  status: TodoStatus;
  className?: string;
}

const variants: Record<TodoStatus, string> = {
  [TodoStatus.Pending]:
    "bg-status-gray-bg text-status-gray-text border-status-gray-border",
  [TodoStatus.Done]:
    "bg-status-green-bg text-status-green-text border-status-green-border",
  [TodoStatus.Syncing]:
    "bg-status-yellow-bg text-status-yellow-text border-status-yellow-border animate-pulse",
};

export const StatusBadge = memo(function StatusBadge({
  children,
  status,
  className,
}: Props) {
  return (
    <span
      className={classNames(
        "font-mono text-xs px-2 py-0.5 rounded-full border",
        variants[status],
        className,
      )}
    >
      {children || status}
    </span>
  );
});
