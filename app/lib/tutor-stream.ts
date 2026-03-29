import { processDataStream } from "ai";
import { z } from "zod";

import type { CanvasCommand } from "./excalidraw-elements";

const canvasCommandSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("draw_shape"),
    shapeType: z.enum(["rectangle", "ellipse", "diamond"]),
    x: z.number().finite(),
    y: z.number().finite(),
    width: z.number().finite(),
    height: z.number().finite(),
    backgroundColor: z.string().optional(),
    label: z.string().optional(),
  }),
  z.object({
    type: z.literal("write_text"),
    text: z.string(),
    x: z.number().finite(),
    y: z.number().finite(),
    fontSize: z.number().finite().optional(),
  }),
  z.object({
    type: z.literal("speak"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("draw_arrow"),
    startX: z.number().finite(),
    startY: z.number().finite(),
    endX: z.number().finite(),
    endY: z.number().finite(),
    label: z.string().optional(),
  }),
  z.object({
    type: z.literal("draw_line"),
    startX: z.number().finite(),
    startY: z.number().finite(),
    endX: z.number().finite(),
    endY: z.number().finite(),
  }),
  z.object({
    type: z.literal("highlight_area"),
    x: z.number().finite(),
    y: z.number().finite(),
    width: z.number().finite(),
    height: z.number().finite(),
    color: z.string().optional(),
  }),
  z.object({ type: z.literal("clear_canvas") }),
  z.object({
    type: z.literal("move_viewport"),
    x: z.number().finite(),
    y: z.number().finite(),
    zoom: z.number().finite().optional(),
  }),
]);

const tutorToolResultSchema = z
  .object({
    toolCallId: z.string(),
    result: z
      .object({
        command: canvasCommandSchema,
      })
      .passthrough(),
  })
  .passthrough();

interface ConsumeTutorDataStreamOptions {
  stream: ReadableStream<Uint8Array>;
  onAssistantText?: (text: string) => void;
  onSpeechSegment?: (segment: string) => void;
  onCommand?: (command: CanvasCommand) => void;
}

export async function consumeTutorDataStream({
  stream,
  onAssistantText,
  onSpeechSegment,
  onCommand,
}: ConsumeTutorDataStreamOptions) {
  let assistantText = "";
  let speechBuffer = "";

  await processDataStream({
    stream,
    onTextPart(textPart) {
      assistantText += textPart;
      onAssistantText?.(assistantText);
      speechBuffer += textPart;

      const { segments, remainder } = takeCompletedSpeechSegments(speechBuffer);
      speechBuffer = remainder;

      for (const segment of segments) {
        onSpeechSegment?.(segment);
      }
    },
    onToolResultPart(toolResultPart) {
      const command = extractCanvasCommandFromToolResult(toolResultPart);
      if (command) {
        onCommand?.(command);
      }
    },
    onErrorPart(errorPart) {
      throw new Error(errorPart);
    },
  });

  const trailingSpeech = speechBuffer.trim();
  if (trailingSpeech) {
    onSpeechSegment?.(trailingSpeech);
  }

  const finalText = assistantText.trim();
  if (finalText !== assistantText) {
    onAssistantText?.(finalText);
  }

  return finalText;
}

export function extractCanvasCommandFromToolResult(
  toolResultPart: unknown
): CanvasCommand | null {
  const parsed = tutorToolResultSchema.safeParse(toolResultPart);

  if (!parsed.success) {
    return null;
  }

  return parsed.data.result.command;
}

function takeCompletedSpeechSegments(buffer: string) {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const segments: string[] = [];
  let segmentStart = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];

    if (char === "\n") {
      pushSegment(segments, normalized.slice(segmentStart, index));
      segmentStart = index + 1;
      continue;
    }

    if (/[.!?]/.test(char) && isSentenceBoundary(next)) {
      pushSegment(segments, normalized.slice(segmentStart, index + 1));
      segmentStart = index + 1;
    }
  }

  return {
    segments,
    remainder: normalized.slice(segmentStart).trimStart(),
  };
}

function isSentenceBoundary(next: string | undefined) {
  return next == null || /\s/.test(next) || next === '"' || next === "'" || next === ")";
}

function pushSegment(segments: string[], candidate: string) {
  const segment = candidate.trim();
  if (segment) {
    segments.push(segment);
  }
}
