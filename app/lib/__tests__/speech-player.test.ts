import { describe, expect, it, vi } from "vitest";

import { createSpeechPlayer } from "../speech-player";

interface MockUtterance {
  text: string;
  rate: number;
  pitch: number;
  volume: number;
  onend: null | (() => void);
  onerror: null | (() => void);
}

function createMockUtterance(text: string): MockUtterance {
  return {
    text,
    rate: 0,
    pitch: 0,
    volume: 0,
    onend: null,
    onerror: null,
  };
}

describe("createSpeechPlayer", () => {
  it("speaks with child-friendly voice settings", async () => {
    const utterances: MockUtterance[] = [];
    const speak = vi.fn((utterance: MockUtterance) => {
      utterances.push(utterance);
      utterance.onend?.();
    });
    const synth = {
      speak,
      cancel: vi.fn(),
    };

    const player = createSpeechPlayer({
      synth,
      createUtterance: createMockUtterance,
    });

    const spoken = await player.speak("Fractions are parts of a whole.");

    expect(spoken).toBe(true);
    expect(synth.cancel).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledTimes(1);
    expect(utterances[0]).toMatchObject({
      text: "Fractions are parts of a whole.",
      rate: 0.92,
      pitch: 1.08,
      volume: 1,
    });
  });

  it("cancels the current utterance before starting a new one", async () => {
    const utterances: MockUtterance[] = [];
    const synth = {
      speak: vi.fn((utterance: MockUtterance) => {
        utterances.push(utterance);
      }),
      cancel: vi.fn(),
    };

    const player = createSpeechPlayer({
      synth,
      createUtterance: createMockUtterance,
    });

    const firstSpeak = player.speak("First");
    const secondSpeak = player.speak("Second");

    utterances[1].onend?.();

    await expect(firstSpeak).resolves.toBe(false);
    await expect(secondSpeak).resolves.toBe(true);
    expect(synth.cancel).toHaveBeenCalledTimes(3);
    expect(utterances.map((utterance) => utterance.text)).toEqual(["First", "Second"]);
  });

  it("times out stalled speech so the queue can keep moving", async () => {
    vi.useFakeTimers();

    const synth = {
      speak: vi.fn(),
      cancel: vi.fn(),
    };
    const player = createSpeechPlayer({
      synth,
      createUtterance: createMockUtterance,
      timeoutMs: 250,
    });

    const speakPromise = player.speak("Waiting...");

    await vi.advanceTimersByTimeAsync(250);

    await expect(speakPromise).resolves.toBe(false);
    expect(synth.cancel).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("resolves the in-flight promise when cancelled explicitly", async () => {
    const synth = {
      speak: vi.fn(),
      cancel: vi.fn(),
    };
    const player = createSpeechPlayer({
      synth,
      createUtterance: createMockUtterance,
    });

    const speakPromise = player.speak("Pause here");
    player.cancel();

    await expect(speakPromise).resolves.toBe(false);
    expect(synth.cancel).toHaveBeenCalledTimes(2);
  });

  it("fails closed when speech synthesis throws synchronously", async () => {
    const synth = {
      speak: vi.fn(() => {
        throw new Error("Speech unavailable");
      }),
      cancel: vi.fn(),
    };
    const player = createSpeechPlayer({
      synth,
      createUtterance: createMockUtterance,
    });

    await expect(player.speak("Hello")).resolves.toBe(false);
    expect(synth.cancel).toHaveBeenCalledTimes(1);
  });
});
