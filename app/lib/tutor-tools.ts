import { tool } from "ai";
import { z } from "zod";

const coordinateSchema = z.number().finite().min(-5000).max(5000);
const positiveSizeSchema = z.number().finite().positive().max(5000);
const colorSchema = z.string().min(1).max(32);
const shortLabelSchema = z.string().min(1).max(120);
const textSchema = z.string().min(1).max(400);

export const tutorToolArgumentSchemas = {
  draw_shape: z.object({
    type: z.enum(["rectangle", "ellipse", "diamond"]),
    x: coordinateSchema,
    y: coordinateSchema,
    width: positiveSizeSchema,
    height: positiveSizeSchema,
    backgroundColor: colorSchema.optional(),
    label: shortLabelSchema.optional(),
  }),
  write_text: z.object({
    text: textSchema,
    x: coordinateSchema,
    y: coordinateSchema,
    fontSize: z.number().finite().positive().max(120).optional(),
  }),
  draw_arrow: z.object({
    startX: coordinateSchema,
    startY: coordinateSchema,
    endX: coordinateSchema,
    endY: coordinateSchema,
    label: shortLabelSchema.optional(),
  }),
  highlight_area: z.object({
    x: coordinateSchema,
    y: coordinateSchema,
    width: positiveSizeSchema,
    height: positiveSizeSchema,
    color: colorSchema.optional(),
  }),
  draw_line: z.object({
    startX: coordinateSchema,
    startY: coordinateSchema,
    endX: coordinateSchema,
    endY: coordinateSchema,
  }),
  clear_canvas: z.object({}),
  move_viewport: z.object({
    x: coordinateSchema,
    y: coordinateSchema,
    zoom: z.number().finite().min(0.1).max(1).optional(),
  }),
};

function acknowledgement<TCommand>(command: TCommand) {
  return {
    ok: true as const,
    command,
  };
}

export const tutorTools = {
  draw_shape: tool({
    description: "Draw a rectangle, ellipse, or diamond on the whiteboard to explain a concept visually.",
    parameters: tutorToolArgumentSchemas.draw_shape,
    async execute(args) {
      return acknowledgement({
        type: "draw_shape",
        shapeType: args.type,
        x: args.x,
        y: args.y,
        width: args.width,
        height: args.height,
        backgroundColor: args.backgroundColor,
        label: args.label,
      });
    },
  }),
  write_text: tool({
    description: "Write a short label, number, or fraction on the whiteboard.",
    parameters: tutorToolArgumentSchemas.write_text,
    async execute(args) {
      return acknowledgement({
        type: "write_text",
        text: args.text,
        x: args.x,
        y: args.y,
        fontSize: args.fontSize,
      });
    },
  }),
  draw_arrow: tool({
    description: "Draw an arrow from one point to another to direct attention or show a relationship.",
    parameters: tutorToolArgumentSchemas.draw_arrow,
    async execute(args) {
      return acknowledgement({
        type: "draw_arrow",
        startX: args.startX,
        startY: args.startY,
        endX: args.endX,
        endY: args.endY,
        label: args.label,
      });
    },
  }),
  highlight_area: tool({
    description: "Highlight a region of the whiteboard so the child focuses on it.",
    parameters: tutorToolArgumentSchemas.highlight_area,
    async execute(args) {
      return acknowledgement({
        type: "highlight_area",
        x: args.x,
        y: args.y,
        width: args.width,
        height: args.height,
        color: args.color,
      });
    },
  }),
  draw_line: tool({
    description: "Draw a line to divide a shape or connect two points.",
    parameters: tutorToolArgumentSchemas.draw_line,
    async execute(args) {
      return acknowledgement({
        type: "draw_line",
        startX: args.startX,
        startY: args.startY,
        endX: args.endX,
        endY: args.endY,
      });
    },
  }),
  clear_canvas: tool({
    description: "Clear the whiteboard before starting a fresh explanation or topic.",
    parameters: tutorToolArgumentSchemas.clear_canvas,
    async execute() {
      return acknowledgement({ type: "clear_canvas" });
    },
  }),
  move_viewport: tool({
    description: "Move the camera to a new teaching area so the child can follow the lesson.",
    parameters: tutorToolArgumentSchemas.move_viewport,
    async execute(args) {
      return acknowledgement({
        type: "move_viewport",
        x: args.x,
        y: args.y,
        zoom: args.zoom,
      });
    },
  }),
};
