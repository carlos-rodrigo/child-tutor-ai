/**
 * Excalidraw element skeleton factory.
 *
 * Creates minimal "skeleton" objects compatible with
 * `convertToExcalidrawElements()` from @excalidraw/excalidraw.
 *
 * These are pure functions — no Excalidraw dependency at runtime,
 * making them easy to test.
 */

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform";

// ---------------------------------------------------------------------------
// Canvas command types (what the AI / command queue produces)
// ---------------------------------------------------------------------------

export type CanvasCommand =
  | {
      type: "draw_shape";
      shapeType: "rectangle" | "ellipse" | "diamond";
      x: number;
      y: number;
      width: number;
      height: number;
      backgroundColor?: string;
      label?: string;
    }
  | {
      type: "write_text";
      text: string;
      x: number;
      y: number;
      fontSize?: number;
    }
  | {
      type: "speak";
      text: string;
    }
  | {
      type: "draw_arrow";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      label?: string;
    }
  | {
      type: "draw_line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "highlight_area";
      x: number;
      y: number;
      width: number;
      height: number;
      color?: string;
    }
  | { type: "clear_canvas" }
  | { type: "move_viewport"; x: number; y: number; zoom?: number };

// ---------------------------------------------------------------------------
// Skeleton creators (individual shapes)
// ---------------------------------------------------------------------------

export function createRectSkeleton(opts: {
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
}): ExcalidrawElementSkeleton {
  return {
    type: "rectangle",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    backgroundColor: opts.backgroundColor ?? "transparent",
    fillStyle: opts.backgroundColor ? "solid" : "hachure",
    strokeColor: "#1e1e1e",
    roundness: { type: 3 },
  } as ExcalidrawElementSkeleton;
}

export function createEllipseSkeleton(opts: {
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
}): ExcalidrawElementSkeleton {
  return {
    type: "ellipse",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    backgroundColor: opts.backgroundColor ?? "transparent",
    fillStyle: opts.backgroundColor ? "solid" : "hachure",
    strokeColor: "#1e1e1e",
  } as ExcalidrawElementSkeleton;
}

export function createTextSkeleton(opts: {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
}): ExcalidrawElementSkeleton {
  return {
    type: "text",
    text: opts.text,
    x: opts.x,
    y: opts.y,
    fontSize: opts.fontSize ?? 24,
    strokeColor: "#1e1e1e",
  } as ExcalidrawElementSkeleton;
}

export function createArrowSkeleton(opts: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  label?: string;
}): ExcalidrawElementSkeleton {
  const base: Record<string, unknown> = {
    type: "arrow",
    x: opts.startX,
    y: opts.startY,
    width: opts.endX - opts.startX,
    height: opts.endY - opts.startY,
    points: [
      [0, 0],
      [opts.endX - opts.startX, opts.endY - opts.startY],
    ],
    strokeColor: "#1e1e1e",
  };

  if (opts.label) {
    base.label = { text: opts.label };
  }

  return base as ExcalidrawElementSkeleton;
}

export function createLineSkeleton(opts: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}): ExcalidrawElementSkeleton {
  return {
    type: "line",
    x: opts.startX,
    y: opts.startY,
    width: opts.endX - opts.startX,
    height: opts.endY - opts.startY,
    points: [
      [0, 0],
      [opts.endX - opts.startX, opts.endY - opts.startY],
    ],
    strokeColor: "#1e1e1e",
  } as ExcalidrawElementSkeleton;
}

// ---------------------------------------------------------------------------
// Command → Skeleton converter
// ---------------------------------------------------------------------------

/**
 * Converts a CanvasCommand into an ExcalidrawElementSkeleton.
 * Returns null for commands that don't produce elements (clear_canvas, move_viewport).
 */
export function commandToSkeleton(
  cmd: CanvasCommand
): ExcalidrawElementSkeleton | null {
  switch (cmd.type) {
    case "draw_shape": {
      if (cmd.shapeType === "ellipse") {
        return createEllipseSkeleton({
          x: cmd.x,
          y: cmd.y,
          width: cmd.width,
          height: cmd.height,
          backgroundColor: cmd.backgroundColor,
        });
      }
      if (cmd.shapeType === "diamond") {
        return {
          type: "diamond",
          x: cmd.x,
          y: cmd.y,
          width: cmd.width,
          height: cmd.height,
          backgroundColor: cmd.backgroundColor ?? "transparent",
          fillStyle: cmd.backgroundColor ? "solid" : "hachure",
          strokeColor: "#1e1e1e",
        } as ExcalidrawElementSkeleton;
      }
      // rectangle (default)
      return createRectSkeleton({
        x: cmd.x,
        y: cmd.y,
        width: cmd.width,
        height: cmd.height,
        backgroundColor: cmd.backgroundColor,
      });
    }
    case "write_text":
      return createTextSkeleton({
        text: cmd.text,
        x: cmd.x,
        y: cmd.y,
        fontSize: cmd.fontSize,
      });
    case "speak":
      return null;
    case "draw_arrow":
      return createArrowSkeleton({
        startX: cmd.startX,
        startY: cmd.startY,
        endX: cmd.endX,
        endY: cmd.endY,
        label: cmd.label,
      });
    case "draw_line":
      return createLineSkeleton({
        startX: cmd.startX,
        startY: cmd.startY,
        endX: cmd.endX,
        endY: cmd.endY,
      });
    case "highlight_area":
      return {
        type: "rectangle",
        x: cmd.x,
        y: cmd.y,
        width: cmd.width,
        height: cmd.height,
        backgroundColor: cmd.color ?? "#ffd700",
        fillStyle: "solid",
        strokeColor: "transparent",
        opacity: 40,
      } as ExcalidrawElementSkeleton;
    case "clear_canvas":
      return null;
    case "move_viewport":
      return null;
  }
}
