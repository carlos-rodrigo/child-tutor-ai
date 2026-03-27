import { TutorChoice, TutorTurn } from "@/lib/tutor-types";

function choice(id: string, label: string, isCorrect = false): TutorChoice {
  return { id, label, isCorrect };
}

export function getFractionsIntroTurn(): TutorTurn {
  return {
    stepId: "intro",
    status: "awaiting_answer",
    speech:
      "Hi! I am Tutor. Today we are going to learn fractions using shapes and color. A fraction shows a part of a whole.",
    actions: [
      { type: "clear" },
      { type: "writeText", text: "Fractions", x: 90, y: 80, size: 36, color: "#13304a" },
      { type: "drawRect", id: "rect-half", x: 120, y: 140, width: 280, height: 140, color: "#ffffff" },
      { type: "splitShape", target: "rect-half", parts: 2, direction: "vertical" },
      { type: "fillSegment", target: "rect-half", segment: 1, color: "#7ed7c1" },
      { type: "writeText", text: "1/2", x: 230, y: 330, size: 30, color: "#13304a" },
    ],
    question: "If one of two equal parts is colored, what fraction do we have?",
    choices: [choice("half", "One half", true), choice("quarter", "One quarter")],
  };
}

export function getCorrectTurn(): TutorTurn {
  return {
    stepId: "correct",
    status: "awaiting_answer",
    speech:
      "Exactly! One of two equal parts is one half. Now let’s try one more. If we divide a shape into four equal parts and color one, that is one quarter.",
    actions: [
      { type: "clear" },
      { type: "writeText", text: "Now look at quarters", x: 90, y: 80, size: 30, color: "#13304a" },
      { type: "drawRect", id: "rect-quarter", x: 120, y: 140, width: 280, height: 160, color: "#ffffff" },
      { type: "splitShape", target: "rect-quarter", parts: 4, direction: "vertical" },
      { type: "fillSegment", target: "rect-quarter", segment: 1, color: "#ffd166" },
      { type: "writeText", text: "1/4", x: 230, y: 348, size: 30, color: "#13304a" },
    ],
    question: "What do we call one colored part out of four equal parts?",
    choices: [choice("quarter", "One quarter", true), choice("half", "One half")],
  };
}

export function getIncorrectTurn(): TutorTurn {
  return {
    stepId: "incorrect",
    status: "awaiting_answer",
    speech:
      "Almost. Let’s slow down. This shape is split into two equal parts. Because only one part is colored, the fraction is one half.",
    actions: [
      { type: "clear" },
      { type: "drawRect", id: "rect-retry", x: 120, y: 140, width: 280, height: 140, color: "#ffffff" },
      { type: "splitShape", target: "rect-retry", parts: 2, direction: "vertical" },
      { type: "fillSegment", target: "rect-retry", segment: 1, color: "#7ed7c1" },
      { type: "highlight", x: 120, y: 140, width: 140, height: 140, color: "rgba(126,215,193,0.35)" },
      { type: "writeText", text: "1 out of 2 = 1/2", x: 170, y: 330, size: 28, color: "#13304a" },
    ],
    question: "Let’s try again. What fraction is one out of two equal parts?",
    choices: [choice("half", "One half", true), choice("quarter", "One quarter")],
  };
}

export function getCompletedTurn(): TutorTurn {
  return {
    stepId: "completed",
    status: "completed",
    speech:
      "Great job. Today you learned that fractions show parts of a whole. One out of two equal parts is one half, and one out of four equal parts is one quarter.",
    actions: [
      { type: "clear" },
      { type: "writeText", text: "You did it!", x: 160, y: 140, size: 40, color: "#13304a" },
      { type: "writeText", text: "1/2 means one of two equal parts", x: 100, y: 240, size: 24, color: "#13304a" },
      { type: "writeText", text: "1/4 means one of four equal parts", x: 96, y: 284, size: 24, color: "#13304a" },
      { type: "pointer", x: 350, y: 120, label: "⭐" },
    ],
  };
}
