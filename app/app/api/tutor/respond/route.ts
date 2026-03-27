import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";

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
    return new Response(JSON.stringify({ turn: nextTurn, speech: nextTurn.speech, fallback: true }), {
      headers: {
        "content-type": "application/json",
        "x-tutor-turn": JSON.stringify(nextTurn),
      },
    });
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are a warm voice-first tutor for children. Keep explanations short, kind, and clear. Never produce unsafe or scary content.",
    prompt: `Rewrite this tutor line in a warm child-friendly tone while preserving meaning: ${nextTurn.speech}`,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-tutor-turn": JSON.stringify(nextTurn),
    },
  });
}
