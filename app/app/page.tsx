"use client";

import { useEffect, useState } from "react";

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

function buildScene(actions: CanvasAction[]): CanvasScene {
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

  return nextScene;
}

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

export default function Home() {
  const [session, setSession] = useState<TutorSession | null>(null);
  const [turn, setTurn] = useState<TutorTurn | null>(null);
  const [streamedSpeech, setStreamedSpeech] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    if (!turn || !voiceEnabled) return;
    speak(streamedSpeech || turn.speech);
  }, [turn, streamedSpeech, voiceEnabled]);

  async function startSession() {
    setIsLoading(true);

    try {
      const res = await fetch("/api/tutor/start", { method: "POST" });
      const data = await res.json();
      setSession(data.session);
      setTurn(data.turn);
      setStreamedSpeech(data.turn?.speech || "");
    } finally {
      setIsLoading(false);
    }
  }

  async function answer(choice: TutorChoice) {
    if (!turn) return;
    setIsLoading(true);

    try {
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
      } else {
        setStreamedSpeech(nextTurn?.speech || "");
      }

      if (nextTurn) {
        setTurn(nextTurn);
        setSession((current) =>
          current ? { ...current, stepId: nextTurn.stepId, status: nextTurn.status, lastTurn: nextTurn } : current
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  const scene = turn ? buildScene(turn.actions) : emptyScene;
  const choices = turn?.choices ?? [];
  const progress = turn ? progressMap[turn.stepId] ?? 10 : 0;
  const speechCopy = streamedSpeech || turn?.speech || "Tap start to begin the lesson.";

  return (
    <main className="lesson-shell">
      <div className="shell-glow glow-left" />
      <div className="shell-glow glow-right" />

      <header className="lesson-header">
        <div>
          <p className="eyebrow">Child Tutor AI</p>
          <h1>Fractions mini-lesson</h1>
          <p className="subcopy">Voice-first tutoring with a notebook-style canvas and quick guided choices.</p>
        </div>
        <div className="header-meta">
          <span className="meta-pill">3–5 min session</span>
          <span className="meta-pill warm">Topic: fractions</span>
          {session ? <span className="meta-pill">Session #{session.id.slice(0, 6)}</span> : null}
        </div>
      </header>

      <section className="lesson-layout">
        <section className="board-column" aria-label="Lesson canvas">
          <div className="board-head">
            <div>
              <p className="mini-label">Tutor board</p>
              <h2>{turn?.stepId === "completed" ? "Lesson complete" : "Watch, listen, and learn"}</h2>
            </div>
            <div className="voice-badge" aria-live="polite">
              <span className={`pulse ${voiceEnabled ? "on" : "off"}`} />
              {voiceEnabled ? "Voice on" : "Voice off"}
            </div>
          </div>

          <div className="progress-wrap" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <CanvasView scene={scene} />
        </section>

        <aside className="interaction-column">
          <section className="panel tutor-panel">
            <div className="panel-headline">
              <div className="avatar-bubble">T</div>
              <div>
                <p className="mini-label">Tutor voice</p>
                <h3>Warm guidance</h3>
              </div>
            </div>

            <p className="speech-card" aria-live="polite">
              {speechCopy}
            </p>

            <div className="button-row">
              <button className="ghost" onClick={startSession} disabled={isLoading}>
                {session ? "Restart lesson" : "Start lesson"}
              </button>
              <button
                className="ghost"
                onClick={() => {
                  if (speechCopy) speak(speechCopy);
                }}
                disabled={!turn}
              >
                Repeat voice
              </button>
              <button className="ghost" onClick={() => setVoiceEnabled((current) => !current)}>
                {voiceEnabled ? "Mute tutor" : "Unmute tutor"}
              </button>
            </div>
          </section>

          <section className="panel answer-panel">
            <p className="mini-label">Your turn</p>
            <h3>{turn?.question ?? "Press start, then choose answers as you go."}</h3>

            <div className="choices-grid">
              {choices.length ? (
                choices.map((choice, index) => (
                  <button
                    key={choice.id}
                    className={`choice-card choice-${index + 1}`}
                    onClick={() => answer(choice)}
                    disabled={isLoading}
                  >
                    <span className="choice-star">✦</span>
                    <span>{choice.label}</span>
                  </button>
                ))
              ) : (
                <div className="completion-card">
                  <strong>{session ? "Nice work, explorer." : "Ready when you are."}</strong>
                  <span>
                    {session
                      ? "You finished this fractions round with the tutor."
                      : "Start the lesson to hear the tutor and watch the board come alive."}
                  </span>
                </div>
              )}
            </div>
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
              background: item.color ?? "rgba(126, 215, 193, 0.25)",
            }}
          />
        ))}

        {scene.rects.map((rect) => {
          const fills = scene.fills.filter((fill) => fill.target === rect.id);
          const splits = rect.splits;
          return (
            <div
              key={rect.id}
              className="rect"
              style={{
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                flexDirection: splits?.direction === "horizontal" ? "column" : "row",
              }}
            >
              {splits
                ? Array.from({ length: splits.parts }).map((_, i) => {
                    const segment = i + 1;
                    const fill = fills.find((f) => f.segment === segment);
                    const isFilled = !!fill?.color;
                    const direction = splits.direction;
                    const sizePercent = `${100 / splits.parts}%`;
                    return (
                      <div
                        key={`${rect.id}-${segment}`}
                        className={`segment ${direction}${isFilled ? " filled" : ""}`}
                        style={{
                          ...(direction === "vertical" ? { width: sizePercent } : { height: sizePercent }),
                          background: fill?.color ?? "transparent",
                        }}
                      />
                    );
                  })
                : null}
            </div>
          );
        })}

        {scene.circles.map((circle) => (
          <div
            key={circle.id}
            className="circle"
            style={{
              left: circle.x - circle.radius,
              top: circle.y - circle.radius,
              width: circle.radius * 2,
              height: circle.radius * 2,
              background: circle.color ?? "rgba(255,255,255,0.95)",
            }}
          />
        ))}

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
