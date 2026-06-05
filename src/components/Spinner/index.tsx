import { memo } from "react";

interface SpinnerProps {
  size?: number;
  label?: string;
}

export const Spinner = memo(
  ({ size = 32, label = "Loading" }: SpinnerProps) => {
    return (
      <div
        className="rounded-full border-[3px] border-solid border-primary-divider border-t-on-primary-muted animate-spin"
        style={{
          width: size,
          height: size,
        }}
        role="status"
        aria-label={label}
      />
    );
  },
);
