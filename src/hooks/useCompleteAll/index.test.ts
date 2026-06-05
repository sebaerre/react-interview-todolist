import { describe, it, expect, vi, afterEach } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { useCompleteAll } from ".";
import * as api from "../../api";
import { renderHookWithClient } from "../../test/utils";

vi.mock("../../api", () => import("../../test/apiMock"));

describe("useCompleteAll", () => {
  afterEach(() => vi.clearAllMocks());

  it("starts with empty progress and isPending false", () => {
    const { result } = renderHookWithClient(() =>
      useCompleteAll({ listId: "list1", onProgress: vi.fn(), onDone: vi.fn() }),
    );

    expect(result.current.progress).toEqual([]);
    expect(result.current.isPending).toBe(false);
  });

  it("sets isPending to true while running and false when done", async () => {
    vi.mocked(api.completeAll).mockResolvedValue(undefined);

    const { result } = renderHookWithClient(() =>
      useCompleteAll({ listId: "list1", onProgress: vi.fn(), onDone: vi.fn() }),
    );

    act(() => {
      result.current.trigger();
    });
    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  it("calls completeAll with listId and abort signal", async () => {
    vi.mocked(api.completeAll).mockResolvedValue(undefined);

    const { result } = renderHookWithClient(() =>
      useCompleteAll({ listId: "list1", onProgress: vi.fn(), onDone: vi.fn() }),
    );

    await act(() => result.current.trigger());

    expect(vi.mocked(api.completeAll)).toHaveBeenCalledWith(
      "list1",
      expect.any(Function),
      expect.any(Function),
      expect.any(AbortSignal),
    );
  });

  it("accumulates progress events and calls onProgress callback", async () => {
    const event1 = { itemId: 10, completed: 1, total: 2 };
    const event2 = { itemId: 11, completed: 2, total: 2 };

    vi.mocked(api.completeAll).mockImplementation(
      async (_listId, onProgress) => {
        onProgress(event1);
        onProgress(event2);
      },
    );

    const onProgress = vi.fn();
    const { result } = renderHookWithClient(() =>
      useCompleteAll({ listId: "list1", onProgress, onDone: vi.fn() }),
    );

    await act(() => result.current.trigger());

    expect(result.current.progress).toEqual([event1, event2]);
    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenNthCalledWith(1, event1);
    expect(onProgress).toHaveBeenNthCalledWith(2, event2);
  });

  it("calls onDone when completeAll finishes", async () => {
    const onDone = vi.fn();
    vi.mocked(api.completeAll).mockImplementation(
      async (_listId, _onProgress, done) => {
        done();
      },
    );

    const { result } = renderHookWithClient(() =>
      useCompleteAll({ listId: "list1", onProgress: vi.fn(), onDone }),
    );

    await act(() => result.current.trigger());

    expect(onDone).toHaveBeenCalledOnce();
  });

  it("resets progress on each new trigger call", async () => {
    const event = { itemId: 10, completed: 1, total: 2 };
    vi.mocked(api.completeAll).mockImplementation(
      async (_listId, onProgress) => {
        onProgress(event);
      },
    );

    const { result } = renderHookWithClient(() =>
      useCompleteAll({ listId: "list1", onProgress: vi.fn(), onDone: vi.fn() }),
    );

    await act(() => result.current.trigger());
    expect(result.current.progress).toHaveLength(1);

    await act(() => result.current.trigger());
    expect(result.current.progress).toHaveLength(1); // reset then one new event
  });

  it("sets isPending to false and aborts on cancel", async () => {
    let capturedSignal: AbortSignal | undefined;
    vi.mocked(api.completeAll).mockImplementation(
      async (_listId, _onProgress, _onDone, signal) => {
        capturedSignal = signal;
        await new Promise(() => {}); // never resolves
      },
    );

    const { result } = renderHookWithClient(() =>
      useCompleteAll({ listId: "list1", onProgress: vi.fn(), onDone: vi.fn() }),
    );

    act(() => {
      result.current.trigger();
    });
    expect(result.current.isPending).toBe(true);

    act(() => {
      result.current.cancel();
    });

    expect(result.current.isPending).toBe(false);
    expect(capturedSignal?.aborted).toBe(true);
  });

  it("sets isPending to false even when completeAll throws", async () => {
    vi.mocked(api.completeAll).mockRejectedValue(new Error("Network error"));

    const { result } = renderHookWithClient(() =>
      useCompleteAll({ listId: "list1", onProgress: vi.fn(), onDone: vi.fn() }),
    );

    await act(async () => {
      await result.current.trigger();
    });

    expect(result.current.isPending).toBe(false);
  });

  it("calls onError when there is an error", async () => {
    vi.mocked(api.completeAll).mockRejectedValue(new Error("Network error"));
    const onError = vi.fn();
    const { result } = renderHookWithClient(() =>
      useCompleteAll({
        listId: "list1",
        onProgress: vi.fn(),
        onDone: vi.fn(),
        onError,
      }),
    );

    await act(async () => {
      await result.current.trigger();
    });

    expect(onError).toHaveBeenCalledWith("Network error");
  });
});
