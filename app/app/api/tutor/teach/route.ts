import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText, type Message } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { MAX_TUTOR_INPUT_LENGTH } from "@/lib/tutor-constants";
import { buildTutorSystemPrompt } from "@/lib/tutor-system-prompt";
import { tutorTools } from "@/lib/tutor-tools";

const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_TOOL_STEPS = 4;
const MAX_HISTORY_MESSAGES = 24;
const MAX_MESSAGE_PARTS = 20;
const MAX_MESSAGE_TEXT_LENGTH = 4000;

const teachMessageSchema = z
  .object({
    id: z.string().max(128).optional(),
    role: z.enum(["system", "user", "assistant"]),
    content: z.union([
      z.string().max(MAX_MESSAGE_TEXT_LENGTH),
      z.array(z.any()).max(MAX_MESSAGE_PARTS),
    ]),
  })
  .passthrough();

const lessonContextSchema = z.object({
  interactionMode: z.enum([
    "child_question",
    "child_answer",
    "child_confused",
    "topic_switch",
  ]),
  currentTopic: z.string().max(120).nullable().optional(),
  boardArea: z
    .object({
      x: z.number().finite(),
      y: z.number().finite(),
      zoom: z.number().finite().min(0.1).max(1).optional(),
    })
    .optional(),
});

const teachRequestSchema = z.object({
  messages: z.array(teachMessageSchema).min(1).max(MAX_HISTORY_MESSAGES),
  lessonContext: lessonContextSchema.optional(),
});

function toCoreMessages(messages: z.infer<typeof teachRequestSchema>["messages"]) {
  const requestMessages = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role,
      content: message.content,
    })) as Array<Omit<Message, "id">>;

  return convertToCoreMessages(requestMessages);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        code: "invalid_request",
        error: "Request body must be valid JSON.",
      },
      { status: 400 }
    );
  }

  const parsed = teachRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "invalid_request",
        error: `Expected { messages: Message[] } with 1-${MAX_HISTORY_MESSAGES} conversation messages.`,
      },
      { status: 400 }
    );
  }

  const oversizedUserPrompt = parsed.data.messages.some(
    (message) =>
      message.role === "user" &&
      typeof message.content === "string" &&
      message.content.trim().length > MAX_TUTOR_INPUT_LENGTH
  );

  if (oversizedUserPrompt) {
    return NextResponse.json(
      {
        code: "invalid_request",
        error: `User prompts must be ${MAX_TUTOR_INPUT_LENGTH} characters or less.`,
      },
      { status: 400 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        code: "missing_api_key",
        error: "OPENAI_API_KEY is missing. Add it to your environment to enable AI teaching.",
      },
      { status: 503 }
    );
  }

  try {
    const result = streamText({
      model: openai(process.env.OPENAI_MODEL ?? DEFAULT_MODEL),
      system: buildTutorSystemPrompt(parsed.data.lessonContext),
      messages: toCoreMessages(parsed.data.messages),
      tools: tutorTools,
      maxSteps: MAX_TOOL_STEPS,
      toolCallStreaming: true,
      temperature: 0.7,
    });

    return result.toDataStreamResponse({
      headers: {
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status === 429) {
      return NextResponse.json(
        {
          code: "rate_limited",
          error: "The tutor is busy right now. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        code: "provider_error",
        error: "The tutor could not answer right now.",
      },
      { status: 503 }
    );
  }
}

function getErrorStatus(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const status = "statusCode" in error ? error.statusCode : "status" in error ? error.status : null;
  return typeof status === "number" ? status : null;
}
