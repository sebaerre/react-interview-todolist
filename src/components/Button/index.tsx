import { memo } from "react";
import type { ButtonHTMLAttributes } from "react";
import classNames from "classnames";

export const Button = memo(function Button({
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = classNames(
    "cursor-pointer disabled:cursor-not-allowed text-sm",
    className,
  );

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
});
