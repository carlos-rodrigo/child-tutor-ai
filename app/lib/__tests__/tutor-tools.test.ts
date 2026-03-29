import { describe, expect, it } from "vitest";

import { tutorToolArgumentSchemas, tutorTools } from "../tutor-tools";

describe("tutorTools", () => {
  it("defines the expected drawing and viewport tools", () => {
    expect(Object.keys(tutorTools)).toEqual([
      "draw_shape",
      "write_text",
      "draw_arrow",
      "highlight_area",
      "draw_line",
      "clear_canvas",
      "move_viewport",
    ]);
  });

  it("validates draw_shape parameters with Zod", () => {
    expect(
      tutorToolArgumentSchemas.draw_shape.safeParse({
        type: "rectangle",
        x: 120,
        y: 180,
        width: 260,
        height: 140,
        backgroundColor: "#a5d8ff",
        label: "1/2",
      }).success
    ).toBe(true);

    expect(
      tutorToolArgumentSchemas.draw_shape.safeParse({
        type: "triangle",
        x: 120,
        y: 180,
        width: 260,
        height: 140,
      }).success
    ).toBe(false);
  });

  it("requires positive sizes for highlight and viewport coordinates", () => {
    expect(
      tutorToolArgumentSchemas.highlight_area.safeParse({
        x: 100,
        y: 100,
        width: 180,
        height: 90,
      }).success
    ).toBe(true);

    expect(
      tutorToolArgumentSchemas.highlight_area.safeParse({
        x: 100,
        y: 100,
        width: 0,
        height: 90,
      }).success
    ).toBe(false);

    expect(
      tutorToolArgumentSchemas.move_viewport.safeParse({
        x: 480,
        y: 320,
        zoom: 0.45,
      }).success
    ).toBe(true);

    expect(
      tutorToolArgumentSchemas.move_viewport.safeParse({
        x: 480,
        y: 320,
        zoom: 1.5,
      }).success
    ).toBe(false);
  });
});
