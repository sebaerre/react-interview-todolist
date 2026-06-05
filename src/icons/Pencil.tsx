import { type IconProps } from "./types";

export const Pencil = ({ size = 16, label = "edit-icon" }: IconProps) => (
  <svg
    aria-label={label}
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 512 512"
    height={size}
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="44"
      d="M358.62 129.28 86.49 402.08 70 442l39.92-16.49 272.8-272.13-24.1-24.1zm54.45-54.44-11.79 11.78 24.1 24.1 11.79-11.79a16.51 16.51 0 0 0 0-23.34l-.75-.75a16.51 16.51 0 0 0-23.35 0z"
    ></path>
  </svg>
);
