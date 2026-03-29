import { describe, expect, it, vi } from "vitest";

import { CanvasCommandQueue } from "../canvas-command-queue";
import type { CanvasCommand } from "../excalidraw-elements";

function makeTextCommand(text: string): CanvasCommand {
  return {
    type: "write_text",
    text,
    x: 0,
    y: 0,
  };
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

describe("CanvasCommandQueue", () => {
  it("processes commands sequentially with the configured delay", async () => {
    const executed: string[] = [];
    const sleep = vi.fn().mockResolvedValue(undefined);
    const queue = new CanvasCommandQueue(
      async (command) => {
        executed.push(command.type === "write_text" ? command.text : command.type);
      },
      { delayMs: 500, sleep }
    );

    queue.enqueueMany([
      makeTextCommand("first"),
      makeTextCommand("second"),
      makeTextCommand("third"),
    ]);

    await queue.onIdle();

    expect(executed).toEqual(["first", "second", "third"]);
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenNthCalledWith(1, 500);
    expect(sleep).toHaveBeenNthCalledWith(2, 500);
  });

  it("clears pending commands without interrupting the command already running", async () => {
    const executed: string[] = [];
    const firstCommand = deferred();
    const queue = new CanvasCommandQueue(async (command) => {
      if (command.type !== "write_text") return;

      executed.push(command.text);

      if (command.text === "first") {
        await firstCommand.promise;
      }
    });

    queue.enqueueMany([makeTextCommand("first"), makeTextCommand("second")]);
    await Promise.resolve();

    queue.clear();
    firstCommand.resolve();

    await queue.onIdle();

    expect(executed).toEqual(["first"]);
    expect(queue.isIdle()).toBe(true);
  });

  it("reset drops old pending work and allows a fresh run", async () => {
    const executed: string[] = [];
    const firstCommand = deferred();
    const queue = new CanvasCommandQueue(async (command) => {
      if (command.type !== "write_text") return;

      executed.push(command.text);

      if (command.text === "first") {
        await firstCommand.promise;
      }
    });

    queue.enqueueMany([makeTextCommand("first"), makeTextCommand("second")]);
    await Promise.resolve();

    queue.reset();
    queue.enqueue(makeTextCommand("third"));
    firstCommand.resolve();

    await queue.onIdle();

    expect(executed).toEqual(["first", "third"]);
    expect(queue.getPendingCount()).toBe(0);
  });

  it("can update the delay between runs", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const queue = new CanvasCommandQueue(async () => undefined, {
      delayMs: 300,
      sleep,
    });

    queue.setDelayMs(650);
    queue.enqueueMany([makeTextCommand("first"), makeTextCommand("second")]);

    await queue.onIdle();

    expect(queue.getDelayMs()).toBe(650);
    expect(sleep).toHaveBeenCalledWith(650);
  });
});
