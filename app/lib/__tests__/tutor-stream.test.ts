import { formatDataStreamPart } from "ai";
import { describe, expect, it, vi } from "vitest";

import type { CanvasCommand } from "../excalidraw-elements";
import {
  consumeTutorDataStream,
  extractCanvasCommandFromToolResult,
} from "../tutor-stream";

function createStream(parts: string[]) {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const part of parts) {
        controller.enqueue(encoder.encode(part));
      }

      controller.close();
    },
  });
}

describe("extractCanvasCommandFromToolResult", () => {
  it("returns the validated canvas command from tool execute acknowledgements", () => {
    const command = extractCanvasCommandFromToolResult({
      toolCallId: "tool-1",
      result: {
        ok: true,
        command: {
          type: "draw_shape",
          shapeType: "rectangle",
          x: 120,
          y: 80,
          width: 300,
          height: 180,
        },
      },
    });

    expect(command).toEqual({
      type: "draw_shape",
      shapeType: "rectangle",
      x: 120,
      y: 80,
      width: 300,
      height: 180,
    });
  });

  it("ignores malformed tool results instead of crashing the stream parser", () => {
    expect(
      extractCanvasCommandFromToolResult({
        toolCallId: "tool-2",
        result: { ok: false, nope: true },
      })
    ).toBeNull();
  });
});

describe("consumeTutorDataStream", () => {
  it("buffers text deltas into speakable sentences and forwards validated tool commands", async () => {
    const spoken: string[] = [];
    const commands: CanvasCommand[] = [];
    const onAssistantText = vi.fn();

    const assistantText = await consumeTutorDataStream({
      stream: createStream([
        formatDataStreamPart("text", "Let"),
        formatDataStreamPart("text", "'s learn fractions."),
        formatDataStreamPart("tool_result", {
          toolCallId: "tool-1",
          result: {
            ok: true,
            command: {
              type: "write_text",
              text: "1/2",
              x: 200,
              y: 320,
              fontSize: 32,
            },
          },
        }),
        formatDataStreamPart("text", " Blue means one half."),
      ]),
      onAssistantText,
      onSpeechSegment: (segment) => {
        spoken.push(segment);
      },
      onCommand: (command) => {
        commands.push(command);
      },
    });

    expect(assistantText).toBe("Let's learn fractions. Blue means one half.");
    expect(spoken).toEqual(["Let's learn fractions.", "Blue means one half."]);
    expect(commands).toEqual([
      {
        type: "write_text",
        text: "1/2",
        x: 200,
        y: 320,
        fontSize: 32,
      },
    ]);
    expect(onAssistantText).toHaveBeenLastCalledWith(
      "Let's learn fractions. Blue means one half."
    );
  });

  it("holds the opening narration until the first canvas command arrives", async () => {
    const events: string[] = [];

    await consumeTutorDataStream({
      stream: createStream([
        formatDataStreamPart("text", "Let’s learn fractions."),
        formatDataStreamPart("tool_result", {
          toolCallId: "tool-1",
          result: {
            ok: true,
            command: {
              type: "draw_shape",
              shapeType: "rectangle",
              x: 100,
              y: 120,
              width: 220,
              height: 140,
            },
          },
        }),
      ]),
      onSpeechSegment: (segment) => {
        events.push(`speak:${segment}`);
      },
      onCommand: (command) => {
        events.push(`command:${command.type}`);
      },
    });

    expect(events).toEqual([
      "command:draw_shape",
      "speak:Let’s learn fractions.",
    ]);
  });

  it("flushes a trailing speech fragment when the stream ends without punctuation", async () => {
    const spoken: string[] = [];

    const assistantText = await consumeTutorDataStream({
      stream: createStream([formatDataStreamPart("text", "Now draw the last part")]),
      onSpeechSegment: (segment) => {
        spoken.push(segment);
      },
    });

    expect(assistantText).toBe("Now draw the last part");
    expect(spoken).toEqual(["Now draw the last part"]);
  });

  it("throws the streamed error message for the caller to surface in the UI", async () => {
    await expect(
      consumeTutorDataStream({
        stream: createStream([
          formatDataStreamPart("error", "Rate limited right now"),
        ]),
      })
    ).rejects.toThrow("Rate limited right now");
  });
});
