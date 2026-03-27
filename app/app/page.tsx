"use client";

import { useEffect, useMemo, useState } from "react";

import { CanvasAction, TutorChoice, TutorSession, TutorTurn } from "@/lib/tutor-types";

type CanvasRect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  splits?: { parts: number; direction: "vertical" | "horizontal" };
};
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

const progressMap: Record<string, number> = {
  intro: 25,
  correct: 60,
  incorrect: 45,
  completed: 100,
};

export default function Home() {
  const [session, setSession] = useState<TutorSession | null>(null);
  const [turn, setTurn] = useState<TutorTurn | null>(null);
  const [scene, setScene] = useState<CanvasScene>(emptyScene);
  const [streamedSpeech, setStreamedSpeech] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    startSession();
  }, []);

  useEffect(() => {
    if (!turn) return;
    applyActions(turn.actions);
    setStreamedSpeech(turn.speech);
    if (voiceEnabled) {
      speak(turn.speech);
    }
  }, [turn, voiceEnabled]);

  function speak(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.12;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  }

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
        current ? { ...current, stepId: nextTurn.stepId, status: nextTurn.status, lastTurn: nextTurn } : current
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
  const progress = turn ? progressMap[turn.stepId] ?? 10 : 10;
  const lessonTitle = turn?.stepId === "completed" ? "Lesson complete" : "Fractions adventure";

  return (
    <main className="shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="hero-card">
        <div className="hero-copy-wrap">
          <p className="eyebrow">Child Tutor AI</p>
          <h1>A magical notebook that teaches out loud.</h1>
          <p className="hero-copy">
            Voice-first fractions practice for kids: the tutor explains, the notebook draws, and each step feels like
            a tiny guided lesson instead of a boring edtech form.
          </p>
        </div>

        <div className="hero-orbit">
          <div className="mascot-core">½</div>
          <div className="orbit-chip orbit-a">voice</div>
          <div className="orbit-chip orbit-b">canvas</div>
          <div className="orbit-chip orbit-c">practice</div>
        </div>
      </section>

      <section className="lesson-stage">
        <div className="canvas-shell">
          <div className="canvas-topbar">
            <div>
              <p className="mini-label">Today’s lesson</p>
              <h2>{lessonTitle}</h2>
            </div>
            <div className="voice-badge">
              <span className={`pulse ${voiceEnabled ? "on" : "off"}`} />
              {voiceEnabled ? "Voice on" : "Voice off"}
            </div>
          </div>

          <div className="progress-strip">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <CanvasView scene={scene} />
        </div>

        <aside className="control-rail">
          <section className="panel tutor-panel">
            <div className="panel-headline">
              <div className="avatar-bubble">T</div>
              <div>
                <p className="mini-label">Tutor says</p>
                <h3>Warm voice mode</h3>
              </div>
            </div>

            <p className="speech-card">{streamedSpeech || turn?.speech || "Starting lesson..."}</p>

            <div className="button-row">
              <button className="ghost" onClick={startSession} disabled={isLoading}>
                Restart lesson
              </button>
              <button
                className="ghost"
                onClick={() => {
                  if (turn?.speech) speak(turn.speech);
                }}
              >
                Repeat voice
              </button>
              <button className="ghost" onClick={() => setVoiceEnabled((v) => !v)}>
                {voiceEnabled ? "Mute tutor" : "Unmute tutor"}
              </button>
            </div>
          </section>

          <section className="panel question-panel">
            <p className="mini-label">Your turn</p>
            <h3>{turn?.question ?? "Listen carefully and get ready."}</h3>
            <div className="choices-grid">
              {choices.length ? (
                choices.map((choice, index) => (
                  <button key={choice.id} className={`choice-card choice-${index + 1}`} onClick={() => answer(choice)} disabled={isLoading}>
                    <span className="choice-star">✦</span>
                    <span>{choice.label}</span>
                  </button>
                ))
              ) : (
                <div className="completion-card">
                  <strong>Nice work.</strong>
                  <span>You reached the end of the mini lesson.</span>
                </div>
              )}
            </div>
          </section>

          <section className="panel tiny-notes">
            <p className="mini-label">Why this demo matters</p>
            <ul>
              <li>Canvas-first, not chat-first.</li>
              <li>Next.js frontend and backend.</li>
              <li>AI SDK-ready tutor loop with structured actions.</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}

function CanvasView({ scene }: { scene: CanvasScene }) {
  return (
    <div className="board-frame">
      <div className="board-surface">
        <div className="grid-paper" />

        {scene.highlights.map((item, index) => (
          <div
            key={`h-${index}`}
            className="highlight"
            style={{
              left: item.x,
              top: item.y,
              width: item.width,
              height: item.height,
              background: item.color ?? "rgba(126,215,193,0.25)",
            }}
          />
        ))}

        {scene.rects.map((rect) => {
          const fills = scene.fills.filter((fill) => fill.target === rect.id);
          return (
            <div key={rect.id} className="rect" style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}>
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
