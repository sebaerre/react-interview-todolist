import { type IconProps } from "./types";
export const Checkmark = ({
  size = 10,
  label = "checkmark-icon",
}: IconProps) => {
  return (
    <svg
      aria-label={label}
      width={size}
      height={size}
      viewBox="0 0 10 8"
      fill="none"
    >
      <path
        d="M1 4L3.5 6.5L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
