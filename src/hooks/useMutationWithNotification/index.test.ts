import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { createElement } from "react";
import { useMutationWithNotification } from ".";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useMutationWithNotification", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls toast.success with successMessage on success", async () => {
    const mutationFn = vi.fn().mockResolvedValue("ok");

    const { result } = renderHook(
      () =>
        useMutationWithNotification({
          mutationFn,
          successMessage: "Saved!",
        }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.mutate(undefined));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith("Saved!");
  });

  it("calls toast.error with errorMessage on error", async () => {
    const mutationFn = vi.fn().mockRejectedValue(new Error("boom"));

    const { result } = renderHook(
      () =>
        useMutationWithNotification({
          mutationFn,
          errorMessage: "Something went wrong",
        }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.mutate(undefined));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  it("does not call toast when no messages are provided", async () => {
    const mutationFn = vi.fn().mockResolvedValue("ok");

    const { result } = renderHook(
      () => useMutationWithNotification({ mutationFn }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.mutate(undefined));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("still calls the user-provided onSuccess callback", async () => {
    const mutationFn = vi.fn().mockResolvedValue("data");
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useMutationWithNotification({
          mutationFn,
          successMessage: "Done",
          onSuccess,
        }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.mutate(undefined));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledWith(
      "data",
      undefined,
      undefined,
      expect.any(Object),
    );
  });

  it("still calls the user-provided onError callback", async () => {
    const error = new Error("fail");
    const mutationFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    const { result } = renderHook(
      () =>
        useMutationWithNotification({
          mutationFn,
          errorMessage: "Oops",
          onError,
        }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.mutate(undefined));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(onError).toHaveBeenCalledWith(
      error,
      undefined,
      undefined,
      expect.any(Object),
    );
  });

  it("calls toast.success with the result of successMessage callback", async () => {
    const mutationFn = vi.fn().mockResolvedValue({ name: "Alice" });
    const successMessage = vi.fn(
      (data: { name: string }) => `Hello, ${data.name}!`,
    );

    const { result } = renderHook(
      () =>
        useMutationWithNotification({
          mutationFn,
          successMessage,
        }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.mutate(undefined));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(successMessage).toHaveBeenCalledWith({ name: "Alice" }, undefined);
    expect(toast.success).toHaveBeenCalledWith("Hello, Alice!");
  });

  it("calls toast.error with the result of errorMessage callback", async () => {
    const error = new Error("network failure");
    const mutationFn = vi.fn().mockRejectedValue(error);
    const errorMessage = vi.fn((err: Error) => `Error: ${err.message}`);

    const { result } = renderHook(
      () =>
        useMutationWithNotification({
          mutationFn,
          errorMessage,
        }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.mutate(undefined));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(errorMessage).toHaveBeenCalledWith(error, undefined);
    expect(toast.error).toHaveBeenCalledWith("Error: network failure");
  });
});
