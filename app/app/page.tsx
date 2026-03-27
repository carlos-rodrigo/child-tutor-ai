"use client";

import { useEffect, useMemo, useState } from "react";

import { CanvasAction, TutorChoice, TutorSession, TutorTurn } from "@/lib/tutor-types";

type CanvasRect = { id: string; x: number; y: number; width: number; height: number; color?: string; splits?: { parts: number; direction: "vertical" | "horizontal" } };
type CanvasCircle = { id: string; x: number; y: number; radius: number; color?: string };
type CanvasText = { text: string; x: number; y: number; size?: number; color?: string };
type CanvasHighlight = { x: number; y: number; width: number; height: number; color?: string };
type CanvasPointer = { x: number; y: number; label?: string };

type CanvasScene = {
  rects: CanvasRect[];
  circles: CanvasCircle[];
  texts: CanvasText[];
  highlights: CanvasHighlight[];
  pointers: CanvasPointer[];
  fills: Array<{ target: string; segment: number; color: string }>;
};

const emptyScene: CanvasScene = { rects: [], circles: [], texts: [], highlights: [], pointers: [], fills: [] };

export default function Home() {
  const [session, setSession] = useState<TutorSession | null>(null);
  const [turn, setTurn] = useState<TutorTurn | null>(null);
  const [scene, setScene] = useState<CanvasScene>(emptyScene);
  const [streamedSpeech, setStreamedSpeech] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    startSession();
  }, []);

  useEffect(() => {
    if (!turn) return;
    applyActions(turn.actions);
    setStreamedSpeech(turn.speech);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(turn.speech);
      utterance.rate = 0.95;
      utterance.pitch = 1.08;
      window.speechSynthesis.speak(utterance);
    }
  }, [turn]);

  async function startSession() {
    setIsLoading(true);
    const res = await fetch("/api/tutor/start", { method: "POST" });
    const data = await res.json();
    setSession(data.session);
    setTurn(data.turn);
    setIsLoading(false);
  }

  async function answer(choice: TutorChoice) {
    if (!turn) return;
    setIsLoading(true);
    const res = await fetch("/api/tutor/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId: turn.stepId, answerId: choice.id }),
    });

    const headerTurn = res.headers.get("x-tutor-turn");
    const nextTurn = headerTurn ? (JSON.parse(headerTurn) as TutorTurn) : null;

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      setStreamedSpeech(data.speech || nextTurn?.speech || "");
    } else if (res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }
      setStreamedSpeech(text || nextTurn?.speech || "");
    }

    if (nextTurn) {
      setTurn(nextTurn);
      setSession((current) =>
        current
          ? { ...current, stepId: nextTurn.stepId, status: nextTurn.status, lastTurn: nextTurn }
          : current
      );
    }
    setIsLoading(false);
  }

  function applyActions(actions: CanvasAction[]) {
    let nextScene: CanvasScene = { rects: [], circles: [], texts: [], highlights: [], pointers: [], fills: [] };

    for (const action of actions) {
      switch (action.type) {
        case "clear":
          nextScene = { rects: [], circles: [], texts: [], highlights: [], pointers: [], fills: [] };
          break;
        case "drawRect":
          nextScene.rects.push({
            id: action.id,
            x: action.x,
            y: action.y,
            width: action.width,
            height: action.height,
            color: action.color,
          });
          break;
        case "drawCircle":
          nextScene.circles.push(action);
          break;
        case "splitShape":
          nextScene.rects = nextScene.rects.map((rect) =>
            rect.id === action.target ? { ...rect, splits: { parts: action.parts, direction: action.direction } } : rect
          );
          break;
        case "fillSegment":
          nextScene.fills.push(action);
          break;
        case "writeText":
          nextScene.texts.push(action);
          break;
        case "highlight":
          nextScene.highlights.push(action);
          break;
        case "pointer":
          nextScene.pointers.push(action);
          break;
      }
    }

    setScene(nextScene);
  }

  const choices = useMemo(() => turn?.choices ?? [], [turn]);

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Child Tutor AI</p>
          <h1>A tutor that talks and draws.</h1>
          <p className="hero-copy">
            Early technical skeleton using Next.js + AI SDK. Fractions lesson, canvas actions, voice playback,
            and a backend-shaped tutor loop.
          </p>
        </div>
        <div className="pill-box">
          <span>Topic: Fractions</span>
          <span>Status: {session?.status ?? "starting"}</span>
          <span>Input: Voice + buttons</span>
        </div>
      </section>

      <section className="lesson-grid">
        <div className="canvas-panel">
          <CanvasView scene={scene} />
        </div>

        <div className="side-panel">
          <div className="card">
            <h2>Tutor voice</h2>
            <p>{streamedSpeech || turn?.speech || "Starting lesson..."}</p>
            <div className="button-row">
              <button onClick={startSession} className="ghost">Restart</button>
              <button
                onClick={() => {
                  if (turn?.speech && typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(turn.speech);
                    u.rate = 0.95;
                    u.pitch = 1.08;
                    window.speechSynthesis.speak(u);
                  }
                }}
                className="ghost"
              >
                Repeat voice
              </button>
            </div>
          </div>

          <div className="card">
            <h2>{turn?.question ?? "Listen to Tutor"}</h2>
            <div className="choices">
              {choices.length ? (
                choices.map((choice) => (
                  <button key={choice.id} className="choice" onClick={() => answer(choice)} disabled={isLoading}>
                    {choice.label}
                  </button>
                ))
              ) : (
                <p className="muted">No choices right now. The lesson may be complete.</p>
              )}
            </div>
          </div>

          <div className="card muted-card">
            <h2>Backend contract</h2>
            <ul>
              <li>`POST /api/tutor/start` starts a session</li>
              <li>`POST /api/tutor/respond` returns the next tutor turn</li>
              <li>Turns include speech, canvas actions, choices, and session status</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

function CanvasView({ scene }: { scene: CanvasScene }) {
  return (
    <div className="board">
      <div className="board-surface">
        {scene.highlights.map((item, index) => (
          <div
            key={`h-${index}`}
            className="highlight"
            style={{ left: item.x, top: item.y, width: item.width, height: item.height, background: item.color ?? "rgba(126,215,193,0.25)" }}
          />
        ))}

        {scene.rects.map((rect) => {
          const fills = scene.fills.filter((fill) => fill.target === rect.id);
          return (
            <div
              key={rect.id}
              className="rect"
              style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
            >
              {rect.splits && rect.splits.direction === "vertical"
                ? Array.from({ length: rect.splits.parts }).map((_, i) => {
                    const segment = i + 1;
                    const fill = fills.find((f) => f.segment === segment);
                    const parts = rect.splits?.parts ?? 1;
                    return (
                      <div
                        key={`${rect.id}-${segment}`}
                        className="segment vertical"
                        style={{ width: `${100 / parts}%`, background: fill?.color ?? "transparent" }}
                      />
                    );
                  })
                : null}
            </div>
          );
        })}

        {scene.texts.map((text, index) => (
          <div
            key={`t-${index}`}
            className="board-text"
            style={{ left: text.x, top: text.y, fontSize: text.size ?? 24, color: text.color ?? "#13304a" }}
          >
            {text.text}
          </div>
        ))}

        {scene.pointers.map((pointer, index) => (
          <div key={`p-${index}`} className="pointer" style={{ left: pointer.x, top: pointer.y }}>
            {pointer.label ?? "→"}
          </div>
        ))}
      </div>
    </div>
  );
}
