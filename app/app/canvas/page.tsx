"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { CanvasCommandQueue } from "@/lib/canvas-command-queue";
import { commandToSkeleton, type CanvasCommand } from "@/lib/excalidraw-elements";

const DEMO_DELAY_MS = 450;
const VIEWPORT_ZOOM_FACTOR = 0.35;
const VIEWPORT_ANIMATION_MS = 300;

// Dynamic import to avoid SSR issues — Excalidraw uses browser APIs
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

const DEMO_COMMANDS: CanvasCommand[] = [
  { type: "clear_canvas" },
  {
    type: "write_text",
    text: "Let's learn fractions!",
    x: 100,
    y: 50,
    fontSize: 32,
  },
  {
    type: "draw_shape",
    shapeType: "rectangle",
    x: 100,
    y: 130,
    width: 300,
    height: 150,
    backgroundColor: "#e3f2fd",
  },
  {
    type: "draw_line",
    startX: 250,
    startY: 130,
    endX: 250,
    endY: 280,
  },
  {
    type: "highlight_area",
    x: 100,
    y: 130,
    width: 150,
    height: 150,
    color: "#a5d8ff",
  },
  {
    type: "write_text",
    text: "½",
    x: 210,
    y: 310,
    fontSize: 36,
  },
  {
    type: "draw_arrow",
    startX: 450,
    startY: 200,
    endX: 410,
    endY: 200,
    label: "one half",
  },
];

type SceneElement = ReturnType<ExcalidrawImperativeAPI["getSceneElements"]>[number];

export default function CanvasPage() {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const queueRef = useRef<CanvasCommandQueue | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const runningRef = useRef(false);

  const onExcalidrawAPI = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
  }, []);

  const executeCommand = useCallback(async (command: CanvasCommand) => {
    const api = apiRef.current;
    if (!api) return;

    if (command.type === "clear_canvas") {
      api.updateScene({ elements: [] });
      return;
    }

    if (command.type === "move_viewport") {
      focusViewport(api, command);
      return;
    }

    const skeleton = commandToSkeleton(command);
    if (!skeleton) return;

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
  }, []);

  const getQueue = useCallback(() => {
    if (!queueRef.current) {
      queueRef.current = new CanvasCommandQueue(executeCommand, {
        delayMs: DEMO_DELAY_MS,
      });
    }

    return queueRef.current;
  }, [executeCommand]);

  const runDemo = useCallback(async () => {
    const api = apiRef.current;
    if (!api || runningRef.current) return;

    const queue = getQueue();
    runningRef.current = true;
    setIsRunning(true);

    queue.reset();
    queue.setDelayMs(DEMO_DELAY_MS);
    queue.enqueueMany(DEMO_COMMANDS);

    try {
      await queue.onIdle();
    } finally {
      runningRef.current = false;
      setIsRunning(false);
    }
  }, [getQueue]);

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

      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
        }}
      >
        <button
          onClick={runDemo}
          disabled={isRunning}
          style={{
            padding: "12px 28px",
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 12,
            border: "none",
            background: isRunning ? "#ccc" : "#228be6",
            color: "#fff",
            cursor: isRunning ? "not-allowed" : "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            transition: "all 0.2s",
          }}
        >
          {isRunning ? "Drawing…" : "▶ Run Demo"}
        </button>
      </div>
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
