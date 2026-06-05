import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseMutationWithNotificationOptions } from "../types"

/**
 * Thin wrapper around `useMutation` that automatically shows a Sonner toast on
 * success or error. `successMessage` / `errorMessage` accept either a static
 * string or a factory `(data, variables) => string` for dynamic copy. Callers
 * can still pass `onSuccess` / `onError` for side-effects; they run after the
 * toast.
 */
export function useMutationWithNotification<
  TData,
  TError,
  TVariables,
  TContext = unknown,
>({
  successMessage,
  errorMessage,
  onSuccess,
  onError,
  ...rest
}: UseMutationWithNotificationOptions<TData, TError, TVariables, TContext>) {
  return useMutation({
    ...rest,
    onSuccess: (...args) => {
      const [data, variables] = args;

      if (successMessage) {
        toast.success(
          typeof successMessage === "function"
            ? successMessage(data, variables)
            : successMessage,
        );
      }

      onSuccess?.(...args);
    },
    onError: (...args) => {
      const [data, variables] = args;
      if (errorMessage) {
        toast.error(
          typeof errorMessage === "function"
            ? errorMessage(data, variables)
            : errorMessage,
        );
      }
      onError?.(...args);
    },
  });
}
