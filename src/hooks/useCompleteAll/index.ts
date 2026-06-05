import { useState, useRef, useCallback } from "react";
import { completeAll } from "../../api";
import type { CompleteAllProgressEvent } from "@types";

interface CompleteAllControls {
  progress: CompleteAllProgressEvent[];
  isPending: boolean;
  trigger: () => Promise<void>;
  cancel: () => void;
}

/**
 * Manages the complete-all flow for a single list. Calling `trigger` starts a
 * new `AbortController`-backed request (cancelling any in-flight one first) and
 * accumulates `CompleteAllProgressEvent`s in `progress`. Call `cancel` to abort
 * mid-stream — the abort is forwarded directly to the fetch signal so the
 * server connection is dropped immediately.
 */
export function useCompleteAll({
  listId,
  onProgress,
  onDone,
  onError,
}: {
  listId: string;
  onProgress: (progress: CompleteAllProgressEvent) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}): CompleteAllControls {
  const abortRef = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState<CompleteAllProgressEvent[]>([]);
  const [isPending, setIsPending] = useState(false);

  const handleProgress = useCallback(
    (event: CompleteAllProgressEvent) => {
      setProgress((prev) => [...prev, event]);
      onProgress(event);
    },
    [onProgress],
  );

  const trigger = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setProgress([]);
    setIsPending(true);
    try {
      await completeAll(
        listId,
        handleProgress,
        onDone,
        abortRef.current.signal,
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        onError?.(e.message);
      } else {
        onError?.("Unknown error");
      }
    } finally {
      setIsPending(false);
    }
  }, [handleProgress, listId, onDone, onError]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsPending(false);
  }, []);

  return { progress, isPending, trigger, cancel };
}
