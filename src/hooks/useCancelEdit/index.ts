import React, { useEffect, useCallback } from "react";

/**
 * Cancels edit mode when the user clicks outside `ref`'s element or presses
 * Escape. Returns `handleKeyDown` to spread onto the controlled input.
 */
export const useCancelEdit = (
  ref: React.RefObject<HTMLElement | null>,
  handleCancel: () => void,
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && ref?.current && !ref.current.contains(target)) {
        handleCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleCancel]);

   const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleCancel],
  );

  return {handleKeyDown}

};
