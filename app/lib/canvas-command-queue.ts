import type { CanvasCommand } from "./excalidraw-elements";

export type CanvasCommandExecutor = (
  command: CanvasCommand
) => Promise<void> | void;

export interface CanvasCommandQueueOptions {
  delayMs?: number;
  sleep?: (ms: number) => Promise<void>;
  onError?: (error: unknown) => void;
}

const DEFAULT_DELAY_MS = 450;
const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export class CanvasCommandQueue {
  private queue: CanvasCommand[] = [];
  private processing = false;
  private version = 0;
  private delayMs: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly onError?: (error: unknown) => void;
  private idleResolvers = new Set<() => void>();

  constructor(
    private readonly executeCommand: CanvasCommandExecutor,
    options: CanvasCommandQueueOptions = {}
  ) {
    this.delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
    this.sleep = options.sleep ?? defaultSleep;
    this.onError = options.onError;
  }

  enqueue(command: CanvasCommand) {
    this.queue.push(command);
    this.ensureProcessing();
  }

  enqueueMany(commands: CanvasCommand[]) {
    if (commands.length === 0) return;
    this.queue.push(...commands);
    this.ensureProcessing();
  }

  clear() {
    this.queue = [];

    if (this.isIdle()) {
      this.resolveIdle();
    }
  }

  reset() {
    this.version += 1;
    this.queue = [];

    if (!this.processing) {
      this.resolveIdle();
    }
  }

  setDelayMs(delayMs: number) {
    this.delayMs = delayMs;
  }

  getDelayMs() {
    return this.delayMs;
  }

  getPendingCount() {
    return this.queue.length;
  }

  isIdle() {
    return !this.processing && this.queue.length === 0;
  }

  onIdle() {
    if (this.isIdle()) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.idleResolvers.add(resolve);
    });
  }

  private ensureProcessing() {
    if (this.processing) return;

    this.processing = true;
    const runVersion = this.version;

    void this.process(runVersion).catch((error) => {
      this.onError?.(error);
    });
  }

  private async process(runVersion: number) {
    try {
      while (runVersion === this.version && this.queue.length > 0) {
        const command = this.queue.shift();
        if (!command) continue;

        await this.executeCommand(command);

        if (runVersion !== this.version || this.queue.length === 0) {
          continue;
        }

        await this.sleep(this.delayMs);
      }
    } catch (error) {
      this.queue = [];
      throw error;
    } finally {
      const shouldRestart = runVersion !== this.version && this.queue.length > 0;

      this.processing = false;

      if (shouldRestart) {
        this.ensureProcessing();
        return;
      }

      if (this.queue.length === 0) {
        this.resolveIdle();
      }
    }
  }

  private resolveIdle() {
    for (const resolve of this.idleResolvers) {
      resolve();
    }

    this.idleResolvers.clear();
  }
}
