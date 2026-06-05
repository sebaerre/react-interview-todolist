import { type UseMutationOptions } from "@tanstack/react-query";

export type UseMutationWithNotificationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = UseMutationOptions<TData, TError, TVariables, TContext> & {
  successMessage?: string;
  errorMessage?: string;
};
