import { describe, expect, it } from "vitest";

import { DEMO_COMMANDS } from "../canvas-demo";

describe("DEMO_COMMANDS", () => {
  it("interleaves narration with fraction drawing steps", () => {
    expect(DEMO_COMMANDS.map((command) => command.type)).toEqual([
      "clear_canvas",
      "move_viewport",
      "speak",
      "draw_shape",
      "speak",
      "draw_line",
      "highlight_area",
      "speak",
      "write_text",
      "draw_arrow",
    ]);

    const speeches = DEMO_COMMANDS.filter((command) => command.type === "speak");

    expect(speeches).toHaveLength(3);
    expect(speeches[0]).toMatchObject({
      text: "Let's learn about fractions!",
    });
    expect(speeches[1]).toMatchObject({
      text: "See this rectangle? I'm splitting it in half.",
    });
    expect(speeches[2]).toMatchObject({
      text: "The colored part is one half.",
    });
  });
});
