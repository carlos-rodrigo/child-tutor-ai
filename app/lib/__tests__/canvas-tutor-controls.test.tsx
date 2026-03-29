import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CanvasTutorControls } from "../canvas-tutor-controls";

describe("CanvasTutorControls", () => {
  it("renders a minimal text input overlay and forwards submit + mute callbacks", () => {
    const onInputChange = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });
    const onToggleMute = vi.fn();

    render(
      <CanvasTutorControls
        input="teach me fractions"
        canSubmit={true}
        isMuted={false}
        isTeaching={false}
        statusText="Ready"
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        onToggleMute={onToggleMute}
      />
    );

    fireEvent.change(screen.getByLabelText("Ask the tutor what to teach"), {
      target: { value: "teach me multiplication" },
    });
    fireEvent.click(screen.getByRole("button", { name: "🔊 Voice On" }));
    fireEvent.submit(screen.getByRole("form", { name: "Tutor prompt" }));

    expect(onInputChange).toHaveBeenCalledWith("teach me multiplication");
    expect(onToggleMute).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows teaching state, disables send, and exposes a demo fallback button when requested", () => {
    const onRunDemo = vi.fn();

    render(
      <CanvasTutorControls
        input=""
        canSubmit={false}
        errorMessage="OPENAI_API_KEY is missing"
        isMuted={true}
        isTeaching={true}
        showDemoFallback={true}
        statusText="Thinking…"
        onInputChange={() => undefined}
        onSubmit={(event) => event.preventDefault()}
        onToggleMute={() => undefined}
        onRunDemo={onRunDemo}
      />
    );

    expect(screen.getByRole("button", { name: "Teaching…" })).toHaveProperty(
      "disabled",
      true
    );
    expect(screen.queryByText("Thinking…")).not.toBeNull();
    expect(screen.queryByText("OPENAI_API_KEY is missing")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "▶ Run Demo Instead" }));

    expect(onRunDemo).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "🔇 Voice Off" })).toHaveProperty(
      "disabled",
      false
    );
  });

  it("highlights the answer box when the tutor is waiting for the child", () => {
    render(
      <CanvasTutorControls
        input=""
        canSubmit={false}
        isAwaitingResponse={true}
        isMuted={false}
        isTeaching={false}
        statusText="Your turn — answer the tutor."
        onInputChange={() => undefined}
        onSubmit={(event) => event.preventDefault()}
        onToggleMute={() => undefined}
      />
    );

    expect(screen.getByText("Your turn — answer the tutor.")).not.toBeNull();
    expect(screen.getByPlaceholderText("Type your answer here...")).toBeTruthy();
    expect(screen.getByText("Answer the tutor")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Answer" })).toBeTruthy();
  });
});
