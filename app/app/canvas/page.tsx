"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { CanvasCommandQueue } from "@/lib/canvas-command-queue";
import { CanvasDemoControls } from "@/lib/canvas-demo-controls";
import { DEMO_COMMANDS, DEMO_DELAY_MS } from "@/lib/canvas-demo";
import { commandToSkeleton, type CanvasCommand } from "@/lib/excalidraw-elements";
import { createSpeechPlayer } from "@/lib/speech-player";

const VIEWPORT_ZOOM_FACTOR = 0.35;
const VIEWPORT_ANIMATION_MS = 300;

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

const convertToExcalidrawElements = async (skeletons: unknown[]) => {
  const mod = await import("@excalidraw/excalidraw");
  return mod.convertToExcalidrawElements(
    skeletons as Parameters<typeof mod.convertToExcalidrawElements>[0]
  );
};

type SceneElement = ReturnType<ExcalidrawImperativeAPI["getSceneElements"]>[number];

export default function CanvasPage() {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const queueRef = useRef<CanvasCommandQueue | null>(null);
  const speechPlayerRef = useRef<ReturnType<typeof createSpeechPlayer> | null>(null);
  const runningRef = useRef(false);
  const isMutedRef = useRef(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const onExcalidrawAPI = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
  }, []);

  const getSpeechPlayer = useCallback(() => {
    if (!speechPlayerRef.current) {
      speechPlayerRef.current = createSpeechPlayer();
    }

    return speechPlayerRef.current;
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    return () => {
      queueRef.current?.reset();
      speechPlayerRef.current?.cancel();
    };
  }, []);

  const executeCommand = useCallback(
    async (command: CanvasCommand) => {
      if (command.type === "speak") {
        if (isMutedRef.current) {
          return;
        }

        await getSpeechPlayer().speak(command.text);
        return;
      }

      const api = apiRef.current;
      if (!api) {
        return;
      }

      if (command.type === "clear_canvas") {
        api.updateScene({ elements: [] });
        return;
      }

      if (command.type === "move_viewport") {
        focusViewport(api, command);
        return;
      }

      const skeleton = commandToSkeleton(command);
      if (!skeleton) {
        return;
      }

      const newElements = await convertToExcalidrawElements([skeleton]);
      api.updateScene({
        elements: [...api.getSceneElements(), ...newElements],
      });
      api.scrollToContent(newElements, {
        fitToViewport: true,
        viewportZoomFactor: VIEWPORT_ZOOM_FACTOR,
        animate: true,
        duration: VIEWPORT_ANIMATION_MS,
      });
    },
    [getSpeechPlayer]
  );

  const getQueue = useCallback(() => {
    if (!queueRef.current) {
      queueRef.current = new CanvasCommandQueue(executeCommand, {
        delayMs: DEMO_DELAY_MS,
      });
    }

    return queueRef.current;
  }, [executeCommand]);

  const runDemo = useCallback(async () => {
    if (!apiRef.current || runningRef.current) {
      return;
    }

    const queue = getQueue();
    runningRef.current = true;
    setIsRunning(true);

    getSpeechPlayer().cancel();
    queue.reset();
    queue.setDelayMs(DEMO_DELAY_MS);
    queue.enqueueMany(DEMO_COMMANDS);

    try {
      await queue.onIdle();
    } finally {
      runningRef.current = false;
      setIsRunning(false);
    }
  }, [getQueue, getSpeechPlayer]);

  const toggleMute = useCallback(() => {
    setIsMuted((current) => {
      const next = !current;
      isMutedRef.current = next;
      if (next) {
        getSpeechPlayer().cancel();
      }
      return next;
    });
  }, [getSpeechPlayer]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Excalidraw
        excalidrawAPI={onExcalidrawAPI}
        initialData={{
          appState: {
            viewBackgroundColor: "#fafafa",
            gridSize: 20,
          },
        }}
      />

      <CanvasDemoControls
        isMuted={isMuted}
        isRunning={isRunning}
        onRunDemo={runDemo}
        onToggleMute={toggleMute}
      />
    </div>
  );
}

function focusViewport(
  api: ExcalidrawImperativeAPI,
  command: Extract<CanvasCommand, { type: "move_viewport" }>
) {
  const targetElement = findClosestSceneElement(
    api.getSceneElements(),
    command.x,
    command.y
  );

  api.scrollToContent(targetElement ? [targetElement] : undefined, {
    fitToViewport: true,
    viewportZoomFactor: clampZoom(command.zoom),
    animate: true,
    duration: VIEWPORT_ANIMATION_MS,
  });
}

function findClosestSceneElement(
  elements: readonly SceneElement[],
  x: number,
  y: number
) {
  let closest: SceneElement | undefined;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const element of elements) {
    const distance = distanceToElementCenter(element, x, y);

    if (distance >= closestDistance) {
      continue;
    }

    closest = element;
    closestDistance = distance;
  }

  return closest;
}

function distanceToElementCenter(element: SceneElement, x: number, y: number) {
  const left = Math.min(element.x, element.x + element.width);
  const right = Math.max(element.x, element.x + element.width);
  const top = Math.min(element.y, element.y + element.height);
  const bottom = Math.max(element.y, element.y + element.height);
  const centerX = left + (right - left) / 2;
  const centerY = top + (bottom - top) / 2;

  return Math.hypot(centerX - x, centerY - y);
}

function clampZoom(zoom = VIEWPORT_ZOOM_FACTOR) {
  return Math.min(Math.max(zoom, 0.1), 1);
}
