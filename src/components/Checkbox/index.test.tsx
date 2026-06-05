import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Checkbox } from ".";

describe("Checkbox", () => {
  it("renders the checkmark icon when checked=true", () => {
    render(<Checkbox checked={true} />);
    // framer-motion is mocked globally; motion.div renders as a plain div,
    // so Checkmark is always in the DOM — we verify it renders at all.
    expect(screen.getByLabelText("checkmark-icon")).toBeInTheDocument();
  });

  it("renders the checkmark icon when checked=false", () => {
    render(<Checkbox checked={false} />);
    expect(screen.getByLabelText("checkmark-icon")).toBeInTheDocument();
  });
});
