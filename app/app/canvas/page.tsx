"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { commandToSkeleton, type CanvasCommand } from "@/lib/excalidraw-elements";

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

// Demo sequence — a scripted fractions explanation
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

export default function CanvasPage() {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const runningRef = useRef(false);

  const onExcalidrawAPI = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
  }, []);

  const runDemo = useCallback(async () => {
    const api = apiRef.current;
    if (!api || runningRef.current) return;

    runningRef.current = true;
    setIsRunning(true);

    // Collect all elements progressively
    let currentElements: ReturnType<ExcalidrawImperativeAPI["getSceneElements"]> = [];

    for (const cmd of DEMO_COMMANDS) {
      if (cmd.type === "clear_canvas") {
        currentElements = [];
        api.updateScene({ elements: [] });
        await sleep(300);
        continue;
      }

      if (cmd.type === "move_viewport") {
        api.scrollToContent(undefined, {
          fitToContent: true,
          animate: true,
        });
        await sleep(300);
        continue;
      }

      const skeleton = commandToSkeleton(cmd);
      if (!skeleton) continue;

      const newElements = await convertToExcalidrawElements([skeleton]);
      currentElements = [...currentElements, ...newElements];

      api.updateScene({ elements: currentElements });

      // Scroll to keep everything visible
      api.scrollToContent(undefined, {
        fitToContent: true,
        animate: true,
      });

      await sleep(500);
    }

    runningRef.current = false;
    setIsRunning(false);
  }, []);

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

      {/* Floating demo button */}
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
