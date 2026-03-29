import type { CanvasCommand } from "./excalidraw-elements";

export const DEMO_DELAY_MS = 450;
export const DEMO_COMMANDS: CanvasCommand[] = [
  { type: "clear_canvas" },
  { type: "move_viewport", x: 250, y: 200, zoom: 0.42 },
  { type: "speak", text: "Let's learn about fractions!" },
  {
    type: "draw_shape",
    shapeType: "rectangle",
    x: 100,
    y: 130,
    width: 300,
    height: 150,
    backgroundColor: "#e3f2fd",
  },
  { type: "speak", text: "See this rectangle? I'm splitting it in half." },
  {
    type: "draw_line",
    startX: 250,
    startY: 130,
    endX: 250,
    endY: 280,
  },
  {
    type: "highlight_area",
    x: 100,
    y: 130,
    width: 150,
    height: 150,
    color: "#a5d8ff",
  },
  { type: "speak", text: "The colored part is one half." },
  {
    type: "write_text",
    text: "1/2",
    x: 205,
    y: 308,
    fontSize: 34,
  },
  {
    type: "draw_arrow",
    startX: 450,
    startY: 200,
    endX: 410,
    endY: 200,
    label: "one half",
  },
];
