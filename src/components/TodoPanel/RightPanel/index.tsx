import { Button, Spinner } from "@components";

interface RightPanelProps {
  remaining: number;
  onCompleteAllClick: () => void;
  completeAllPending: boolean;
  completeAllDisabled: boolean;
}

export const RightPanel = ({
  remaining,
  completeAllPending,
  onCompleteAllClick,
  completeAllDisabled,
}: RightPanelProps) => {
  return (
    <div className="shrink-0 w-1/2 flex items-center flex-col border border-panel-divider h-fit w-fit px-5 py-5 gap-2">
      <div className="flex gap-4 items-center">
        <p className="text-sm text-on-primary-muted">
          <span className="font-mono font-bold text-on-primary">
            {remaining}
          </span>{" "}
          todo{remaining !== 1 ? "s" : ""} remaining
        </p>
        <Button
          type="button"
          onClick={onCompleteAllClick}
          disabled={completeAllDisabled}
          className="px-4 py-1.5 rounded bg-btn-primary text-btn-primary-text hover:bg-btn-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Complete all
        </Button>
      </div>
      {completeAllPending && <Spinner label="Pending complete all" />}
    </div>
  );
};
