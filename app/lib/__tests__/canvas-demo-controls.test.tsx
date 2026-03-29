import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CanvasDemoControls } from "../canvas-demo-controls";

describe("CanvasDemoControls", () => {
  it("toggles mute labels and forwards callbacks", () => {
    const onRunDemo = vi.fn();
    const onToggleMute = vi.fn();
    const { rerender } = render(
      <CanvasDemoControls
        isMuted={false}
        isRunning={false}
        onRunDemo={onRunDemo}
        onToggleMute={onToggleMute}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "🔊 Voice On" }));
    fireEvent.click(screen.getByRole("button", { name: "▶ Run Demo" }));

    expect(onToggleMute).toHaveBeenCalledTimes(1);
    expect(onRunDemo).toHaveBeenCalledTimes(1);

    rerender(
      <CanvasDemoControls
        isMuted={true}
        isRunning={true}
        onRunDemo={onRunDemo}
        onToggleMute={onToggleMute}
      />
    );

    expect(screen.getByRole("button", { name: "🔇 Voice Off" })).toHaveProperty("disabled", false);
    expect(screen.getByRole("button", { name: "Drawing…" })).toHaveProperty("disabled", true);
  });
});
