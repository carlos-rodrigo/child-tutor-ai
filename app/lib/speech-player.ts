export interface SpeechUtteranceLike {
  text: string;
  rate: number;
  pitch: number;
  volume: number;
  onend: null | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown);
  onerror: null | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown);
}

export interface SpeechSynthesisLike {
  speak(utterance: SpeechUtteranceLike): void;
  cancel(): void;
}

export interface SpeechPlayer {
  speak(text: string): Promise<boolean>;
  cancel(): void;
}

export interface CreateSpeechPlayerOptions {
  synth?: SpeechSynthesisLike | null;
  createUtterance?: ((text: string) => SpeechUtteranceLike) | null;
  timeoutMs?: number;
}

export const CHILD_VOICE_SETTINGS = {
  rate: 0.92,
  pitch: 1.08,
  volume: 1,
} as const;

const DEFAULT_TIMEOUT_MS = 8_000;

function getBrowserSpeechSynthesis() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  return window.speechSynthesis as unknown as SpeechSynthesisLike;
}

function createBrowserUtterance(text: string) {
  return new SpeechSynthesisUtterance(text) as unknown as SpeechUtteranceLike;
}

export function createSpeechPlayer(
  options: CreateSpeechPlayerOptions = {}
): SpeechPlayer {
  const synth = options.synth ?? getBrowserSpeechSynthesis();
  const createUtterance = options.createUtterance ?? createBrowserUtterance;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let finishCurrent: null | ((spoken: boolean) => void) = null;

  const stopCurrent = (spoken: boolean) => {
    if (!finishCurrent) {
      return;
    }

    const finish = finishCurrent;
    finishCurrent = null;
    finish(spoken);
  };

  return {
    speak(text: string) {
      const trimmed = text.trim();
      if (!trimmed || !synth || !createUtterance) {
        return Promise.resolve(false);
      }

      if (finishCurrent) {
        synth.cancel();
        stopCurrent(false);
      }

      synth.cancel();
      const utterance = createUtterance(trimmed);
      utterance.rate = CHILD_VOICE_SETTINGS.rate;
      utterance.pitch = CHILD_VOICE_SETTINGS.pitch;
      utterance.volume = CHILD_VOICE_SETTINGS.volume;

      return new Promise<boolean>((resolve) => {
        let settled = false;
        const timeout = window.setTimeout(() => {
          synth.cancel();
          finish(false);
        }, timeoutMs);

        const finish = (spoken: boolean) => {
          if (settled) {
            return;
          }

          settled = true;
          window.clearTimeout(timeout);
          utterance.onend = null;
          utterance.onerror = null;
          if (finishCurrent === finish) {
            finishCurrent = null;
          }
          resolve(spoken);
        };

        finishCurrent = finish;
        utterance.onend = () => {
          finish(true);
        };
        utterance.onerror = () => {
          finish(false);
        };

        synth.speak(utterance);
      });
    },
    cancel() {
      if (!synth) {
        return;
      }

      synth.cancel();
      stopCurrent(false);
    },
  };
}
