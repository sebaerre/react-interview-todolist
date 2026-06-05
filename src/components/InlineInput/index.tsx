import { memo, useRef, useEffect } from "react";

interface Props extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "onChange"
> {
  label: string;
  hideLabel?: boolean;
  error?: string;
  onChange?: (value: string) => void;
}

export const InlineInput = memo(function InlineInput({
  id,
  label,
  hideLabel = true,
  error,
  onChange,
  autoFocus = true,
  className = "",
  ...props
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="contents">
      <label htmlFor={id} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        aria-label={label}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={className}
        {...props}
      />
    </div>
  );
});
