import { type IconProps } from "./types";

export const Delete = ({ size = 14, label = "delete-icon" }: IconProps) => (
  <svg
    aria-label={label}
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill="none"
  >
    <path
      d="M2 2L12 12M12 2L2 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
