import { describe, it, expect } from "vitest";
import {
  createRectSkeleton,
  createTextSkeleton,
  createArrowSkeleton,
  createEllipseSkeleton,
  createLineSkeleton,
  type CanvasCommand,
  commandToSkeleton,
} from "../excalidraw-elements";

describe("createRectSkeleton", () => {
  it("creates a rectangle skeleton with required fields", () => {
    const rect = createRectSkeleton({ x: 100, y: 200, width: 300, height: 150 });
    expect(rect.type).toBe("rectangle");
    expect(rect.x).toBe(100);
    expect(rect.y).toBe(200);
    expect(rect.width).toBe(300);
    expect(rect.height).toBe(150);
  });

  it("applies optional backgroundColor", () => {
    const rect = createRectSkeleton({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      backgroundColor: "#a5d8ff",
    });
    expect(rect.backgroundColor).toBe("#a5d8ff");
    expect(rect.fillStyle).toBe("solid");
  });

  it("defaults to transparent background", () => {
    const rect = createRectSkeleton({ x: 0, y: 0, width: 100, height: 100 });
    expect(rect.backgroundColor).toBe("transparent");
  });
});

describe("createTextSkeleton", () => {
  it("creates a text skeleton with required fields", () => {
    const text = createTextSkeleton({ text: "1/2", x: 100, y: 200 }) as {
      type: string;
      text: string;
      x: number;
      y: number;
    };
    expect(text.type).toBe("text");
    expect(text.text).toBe("1/2");
    expect(text.x).toBe(100);
    expect(text.y).toBe(200);
  });

  it("applies optional fontSize", () => {
    const text = createTextSkeleton({
      text: "Hello",
      x: 0,
      y: 0,
      fontSize: 32,
    }) as { fontSize: number };
    expect(text.fontSize).toBe(32);
  });

  it("defaults to fontSize 24", () => {
    const text = createTextSkeleton({ text: "Hello", x: 0, y: 0 }) as {
      fontSize: number;
    };
    expect(text.fontSize).toBe(24);
  });
});

describe("createArrowSkeleton", () => {
  it("creates an arrow skeleton between two points", () => {
    const arrow = createArrowSkeleton({
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 50,
    });
    expect(arrow.type).toBe("arrow");
    expect(arrow.x).toBe(0);
    expect(arrow.y).toBe(0);
  });

  it("supports optional label", () => {
    const arrow = createArrowSkeleton({
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 50,
      label: "look here",
    }) as { label?: { text?: string } };
    expect(arrow.label?.text).toBe("look here");
  });
});

describe("createEllipseSkeleton", () => {
  it("creates an ellipse skeleton", () => {
    const ellipse = createEllipseSkeleton({ x: 50, y: 50, width: 200, height: 200 });
    expect(ellipse.type).toBe("ellipse");
    expect(ellipse.x).toBe(50);
    expect(ellipse.width).toBe(200);
  });
});

describe("createLineSkeleton", () => {
  it("creates a line skeleton between two points", () => {
    const line = createLineSkeleton({ startX: 10, startY: 20, endX: 110, endY: 120 });
    expect(line.type).toBe("line");
    expect(line.x).toBe(10);
    expect(line.y).toBe(20);
  });
});

describe("commandToSkeleton", () => {
  it("converts a draw_shape rectangle command", () => {
    const cmd: CanvasCommand = {
      type: "draw_shape",
      shapeType: "rectangle",
      x: 100,
      y: 200,
      width: 300,
      height: 150,
    };
    const skeleton = commandToSkeleton(cmd);
    expect(skeleton).not.toBeNull();
    expect(skeleton!.type).toBe("rectangle");
  });

  it("converts a draw_shape ellipse command", () => {
    const cmd: CanvasCommand = {
      type: "draw_shape",
      shapeType: "ellipse",
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    };
    const skeleton = commandToSkeleton(cmd);
    expect(skeleton!.type).toBe("ellipse");
  });

  it("converts a write_text command", () => {
    const cmd: CanvasCommand = {
      type: "write_text",
      text: "1/2",
      x: 100,
      y: 200,
    };
    const skeleton = commandToSkeleton(cmd);
    expect(skeleton!.type).toBe("text");
    expect((skeleton as { text: string }).text).toBe("1/2");
  });

  it("converts a draw_arrow command", () => {
    const cmd: CanvasCommand = {
      type: "draw_arrow",
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 50,
    };
    const skeleton = commandToSkeleton(cmd);
    expect(skeleton!.type).toBe("arrow");
  });

  it("converts a draw_line command", () => {
    const cmd: CanvasCommand = {
      type: "draw_line",
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 100,
    };
    const skeleton = commandToSkeleton(cmd);
    expect(skeleton!.type).toBe("line");
  });

  it("converts a highlight_area command to a semi-transparent rectangle", () => {
    const cmd: CanvasCommand = {
      type: "highlight_area",
      x: 50,
      y: 50,
      width: 200,
      height: 100,
    };
    const skeleton = commandToSkeleton(cmd);
    expect(skeleton!.type).toBe("rectangle");
    expect((skeleton as { backgroundColor: string }).backgroundColor).toBeTruthy();
    expect((skeleton as { opacity: number }).opacity).toBeLessThan(100);
  });

  it("returns null for clear_canvas command", () => {
    const cmd: CanvasCommand = { type: "clear_canvas" };
    const skeleton = commandToSkeleton(cmd);
    expect(skeleton).toBeNull();
  });

  it("returns null for move_viewport command", () => {
    const cmd: CanvasCommand = { type: "move_viewport", x: 0, y: 0 };
    const skeleton = commandToSkeleton(cmd);
    expect(skeleton).toBeNull();
  });
});
