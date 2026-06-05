import { memo } from "react";

interface Props {
  completed: number;
  total: number;
}

export const ProgressBar = memo(function ProgressBar({
  completed,
  total,
}: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${completed} of ${total} todos completed`}
        className="flex-1 h-[3px] bg-tertiary-border rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-accent rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs text-on-primary-muted shrink-0">
        {completed} / {total}
      </span>
    </div>
  );
});
