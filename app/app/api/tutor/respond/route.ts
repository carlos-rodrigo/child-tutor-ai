import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest, NextResponse } from "next/server";

import { getCompletedTurn, getCorrectTurn, getIncorrectTurn } from "@/lib/fractions-lesson";
import { TutorTurn } from "@/lib/tutor-types";

function pickNextTurn(stepId: string, answerId?: string): TutorTurn {
  if (stepId === "intro" || stepId === "incorrect") {
    return answerId === "half" ? getCorrectTurn() : getIncorrectTurn();
  }
  if (stepId === "correct") {
    return answerId === "quarter" ? getCompletedTurn() : getCorrectTurn();
  }
  return getCompletedTurn();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const stepId = String(body.stepId || "intro");
  const answerId = body.answerId ? String(body.answerId) : undefined;
  const nextTurn = pickNextTurn(stepId, answerId);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { turn: nextTurn, speech: nextTurn.speech, fallback: true },
      { headers: { "x-tutor-turn": JSON.stringify(nextTurn) } }
    );
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are a warm voice-first tutor for children. Keep explanations short, kind, and clear. Never produce unsafe or scary content.",
    prompt: `Rewrite this tutor line in a warm child-friendly tone while preserving meaning: ${nextTurn.speech}`,
  });

  return result.toDataStreamResponse({
    getErrorMessage: (error) => (error instanceof Error ? error.message : "Unknown tutor error"),
    headers: {
      "x-tutor-turn": JSON.stringify(nextTurn),
    },
  });
}
