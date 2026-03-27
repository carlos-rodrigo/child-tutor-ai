import { TutorChoice, TutorTurn } from "@/lib/tutor-types";

function choice(id: string, label: string, isCorrect = false): TutorChoice {
  return { id, label, isCorrect };
}

export function getFractionsIntroTurn(): TutorTurn {
  return {
    stepId: "intro",
    status: "awaiting_answer",
    speech:
      "Hi! I’m Tutor. Let’s learn fractions together. A fraction shows how much of a whole shape we are looking at. See this rectangle? I split it into two equal parts and colored one part.",
    actions: [
      { type: "clear" },
      { type: "writeText", text: "Fractions can be easy", x: 86, y: 78, size: 34, color: "#18334b" },
      { type: "drawRect", id: "rect-half", x: 120, y: 140, width: 280, height: 140, color: "#ffffff" },
      { type: "splitShape", target: "rect-half", parts: 2, direction: "vertical" },
      { type: "fillSegment", target: "rect-half", segment: 1, color: "#8de0c7" },
      { type: "writeText", text: "1/2", x: 232, y: 330, size: 30, color: "#18334b" },
      { type: "pointer", x: 308, y: 116, label: "✨" },
    ],
    question: "If one out of two equal parts is colored, which fraction is it?",
    choices: [choice("half", "One half", true), choice("quarter", "One quarter")],
  };
}

export function getCorrectTurn(): TutorTurn {
  return {
    stepId: "correct",
    status: "awaiting_answer",
    speech:
      "Yes! That is one half. Now let’s level up a tiny bit. This time the shape is divided into four equal parts, and only one part is colored.",
    actions: [
      { type: "clear" },
      { type: "writeText", text: "Now let’s try quarters", x: 92, y: 78, size: 32, color: "#18334b" },
      { type: "drawRect", id: "rect-quarter", x: 120, y: 140, width: 280, height: 160, color: "#ffffff" },
      { type: "splitShape", target: "rect-quarter", parts: 4, direction: "vertical" },
      { type: "fillSegment", target: "rect-quarter", segment: 1, color: "#ffd36c" },
      { type: "writeText", text: "1/4", x: 232, y: 348, size: 30, color: "#18334b" },
      { type: "pointer", x: 368, y: 126, label: "🌟" },
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
      "Nice try. Let’s slow it down together. We only have two equal parts here, and one of those two parts is colored. That makes one half.",
    actions: [
      { type: "clear" },
      { type: "drawRect", id: "rect-retry", x: 120, y: 140, width: 280, height: 140, color: "#ffffff" },
      { type: "splitShape", target: "rect-retry", parts: 2, direction: "vertical" },
      { type: "fillSegment", target: "rect-retry", segment: 1, color: "#8de0c7" },
      { type: "highlight", x: 120, y: 140, width: 140, height: 140, color: "rgba(141,224,199,0.42)" },
      { type: "writeText", text: "1 out of 2 = 1/2", x: 166, y: 330, size: 28, color: "#18334b" },
      { type: "pointer", x: 196, y: 116, label: "💡" },
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
      "Great job! You learned that fractions show parts of a whole. One out of two equal parts is one half, and one out of four equal parts is one quarter. You did really well.",
    actions: [
      { type: "clear" },
      { type: "writeText", text: "You did it!", x: 164, y: 130, size: 42, color: "#18334b" },
      { type: "writeText", text: "1/2 means one of two equal parts", x: 94, y: 228, size: 24, color: "#18334b" },
      { type: "writeText", text: "1/4 means one of four equal parts", x: 90, y: 272, size: 24, color: "#18334b" },
      { type: "writeText", text: "Want to try again?", x: 148, y: 340, size: 28, color: "#ef8d5a" },
      { type: "pointer", x: 356, y: 116, label: "🏆" },
    ],
  };
}
