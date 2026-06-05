import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { useRef } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCancelEdit } from ".";

const { cb, addSpy, removeSpy } = vi.hoisted(() => ({
  cb: vi.fn(),
  addSpy: vi.spyOn(document, "addEventListener"),
  removeSpy: vi.spyOn(document, "removeEventListener"),
}));

describe("useCancelEdit", () => {
  beforeEach(() => {
    cb.mockClear();
    addSpy.mockClear();
    removeSpy.mockClear();
  });

  it("calls callback when clicking outside the ref element", () => {
    renderHook(() => {
      const ref = useRef<HTMLDivElement>(document.createElement("div"));
      useCancelEdit(ref, cb);
      return ref;
    });

    // The ref element is NOT attached to the document, so clicks on document.body are "outside"
    fireEvent.mouseDown(document.body);

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("does not call callback when clicking inside the ref element", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(div);
      useCancelEdit(ref, cb);
      return ref;
    });

    fireEvent.mouseDown(div);

    expect(cb).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it("does not call callback when clicking a child of the ref element", () => {
    const div = document.createElement("div");
    const child = document.createElement("span");
    div.appendChild(child);
    document.body.appendChild(div);

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(div);
      useCancelEdit(ref, cb);
    });

    fireEvent.mouseDown(child);

    expect(cb).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it("removes the event listener on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(document.createElement("div"));
      useCancelEdit(ref, cb);
    });

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    removeSpy.mockRestore();
  });
});
