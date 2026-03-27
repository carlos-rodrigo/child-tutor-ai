export type TutorSessionStatus =
  | "idle"
  | "speaking"
  | "drawing"
  | "awaiting_answer"
  | "evaluating"
  | "completed";

export type CanvasAction =
  | { type: "clear" }
  | { type: "drawRect"; id: string; x: number; y: number; width: number; height: number; color?: string }
  | { type: "drawCircle"; id: string; x: number; y: number; radius: number; color?: string }
  | { type: "splitShape"; target: string; parts: number; direction: "vertical" | "horizontal" }
  | { type: "fillSegment"; target: string; segment: number; color: string }
  | { type: "writeText"; text: string; x: number; y: number; size?: number; color?: string }
  | { type: "highlight"; x: number; y: number; width: number; height: number; color?: string }
  | { type: "pointer"; x: number; y: number; label?: string };

export type TutorChoice = {
  id: string;
  label: string;
  isCorrect?: boolean;
};

export type TutorTurn = {
  speech: string;
  actions: CanvasAction[];
  question?: string;
  choices?: TutorChoice[];
  status: TutorSessionStatus;
  stepId: string;
};

export type TutorSession = {
  id: string;
  topic: "fractions";
  stepId: string;
  status: TutorSessionStatus;
  lastTurn?: TutorTurn;
};
