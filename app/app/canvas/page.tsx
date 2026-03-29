"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEventHandler,
  type MutableRefObject,
} from "react";
import dynamic from "next/dynamic";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { CanvasCommandQueue } from "@/lib/canvas-command-queue";
import { CanvasTutorControls } from "@/lib/canvas-tutor-controls";
import { DEMO_COMMANDS, DEMO_DELAY_MS } from "@/lib/canvas-demo";
import { commandToSkeleton, type CanvasCommand } from "@/lib/excalidraw-elements";
import { createSpeechPlayer } from "@/lib/speech-player";
import {
  MAX_TUTOR_INPUT_LENGTH,
  OFFLINE_TUTOR_STATUS_TEXT,
} from "@/lib/tutor-constants";
import {
  readStoredMutePreference,
  writeStoredMutePreference,
} from "@/lib/tutor-preferences";
import {
  isRetryableNetworkError,
  requestTutorResponse,
} from "@/lib/tutor-request";
import {
  classifyStudentTurn,
  createBoardArea,
  shouldAwaitStudentReply,
} from "@/lib/tutor-session";
import { consumeTutorDataStream } from "@/lib/tutor-stream";

const VIEWPORT_ZOOM_FACTOR = 0.4;
const VIEWPORT_ANIMATION_MS = 520;
const DEFAULT_STATUS_TEXT = "Ask for a math lesson to begin.";
const READY_STATUS_TEXT = "Ready for the next question.";
const THINKING_STATUS_TEXT = "Thinking…";
const TEACHING_STATUS_TEXT = "Teaching on the canvas…";
const DEMO_STATUS_TEXT = "Running the fallback demo lesson…";
const AWAITING_RESPONSE_STATUS_TEXT = "Your turn — answer the tutor.";
const DEFAULT_TRANSCRIPT_TEXT = "Ask me to teach fractions, multiplication, or division.";
const STUDENT_TOOLBAR_STYLES = `
  .excalidraw [data-testid="toolbar-selection"],
  .excalidraw [data-testid="toolbar-rectangle"],
  .excalidraw [data-testid="toolbar-diamond"],
  .excalidraw [data-testid="toolbar-ellipse"],
  .excalidraw [data-testid="toolbar-arrow"],
  .excalidraw [data-testid="toolbar-line"],
  .excalidraw [data-testid="toolbar-image"],
  .excalidraw [data-testid="toolbar-hand"],
  .excalidraw [data-testid="toolbar-lock"],
  .excalidraw [data-testid="toolbar-frame"],
  .excalidraw [data-testid="toolbar-laser"],
  .excalidraw [data-testid="toolbar-embeddable"],
  .excalidraw [data-testid="toolbar-magicframe"],
  .excalidraw .App-toolbar__extra-tools-trigger,
  .excalidraw .App-toolbar__divider {
    display: none !important;
  }
`;

type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

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
  const hasLoadedMutePreferenceRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageCountRef = useRef(0);
  const boardAreaIndexRef = useRef(0);
  const activeTopicRef = useRef<string | null>(null);
  const awaitingStudentResponseRef = useRef(false);
  const conversationLengthRef = useRef(0);

  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isTeaching, setIsTeaching] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [statusText, setStatusText] = useState(DEFAULT_STATUS_TEXT);
  const [transcript, setTranscript] = useState(DEFAULT_TRANSCRIPT_TEXT);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDemoFallback, setShowDemoFallback] = useState(false);

  const onExcalidrawAPI = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
    api.setActiveTool({ type: "freedraw" });
    setIsCanvasReady(true);
  }, []);

  const getSpeechPlayer = useCallback(() => {
    if (!speechPlayerRef.current) {
      speechPlayerRef.current = createSpeechPlayer();
    }

    return speechPlayerRef.current;
  }, []);

  useEffect(() => {
    conversationLengthRef.current = conversation.length;
  }, [conversation.length]);

  useEffect(() => {
    isMutedRef.current = isMuted;

    if (!hasLoadedMutePreferenceRef.current) {
      return;
    }

    writeStoredMutePreference(isMuted);
  }, [isMuted]);

  useEffect(() => {
    const storedMutePreference = readStoredMutePreference();
    hasLoadedMutePreferenceRef.current = true;
    isMutedRef.current = storedMutePreference;
    setIsMuted(storedMutePreference);

    const syncConnectionState = () => {
      const nextIsOffline = typeof navigator !== "undefined" && !navigator.onLine;
      setIsOffline(nextIsOffline);
      setStatusText((current) => {
        if (nextIsOffline) {
          return OFFLINE_TUTOR_STATUS_TEXT;
        }

        if (current === OFFLINE_TUTOR_STATUS_TEXT) {
          return conversationLengthRef.current > 0
            ? READY_STATUS_TEXT
            : DEFAULT_STATUS_TEXT;
        }

        return current;
      });
    };

    syncConnectionState();
    window.addEventListener("online", syncConnectionState);
    window.addEventListener("offline", syncConnectionState);

    return () => {
      window.removeEventListener("online", syncConnectionState);
      window.removeEventListener("offline", syncConnectionState);
      abortControllerRef.current?.abort();
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

  const setAwaitingResponseState = useCallback((next: boolean) => {
    awaitingStudentResponseRef.current = next;
    setIsAwaitingResponse(next);
  }, []);

  const runDemo = useCallback(async () => {
    if (!apiRef.current || runningRef.current) {
      return;
    }

    const queue = getQueue();
    runningRef.current = true;
    setIsTeaching(true);
    setAwaitingResponseState(false);
    setErrorMessage(null);
    setShowDemoFallback(false);
    setStatusText(DEMO_STATUS_TEXT);
    setTranscript("Let's learn about fractions!");

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    getSpeechPlayer().cancel();
    queue.reset();
    queue.setDelayMs(DEMO_DELAY_MS);
    queue.enqueueMany(DEMO_COMMANDS);

    try {
      await queue.onIdle();
      setTranscript("The colored part is one half.");
      setStatusText(READY_STATUS_TEXT);
    } finally {
      runningRef.current = false;
      setIsTeaching(false);
    }
  }, [getQueue, getSpeechPlayer, setAwaitingResponseState]);

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

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();

      const prompt = input.trim();
      if (!prompt || !apiRef.current || runningRef.current) {
        return;
      }

      if (isOffline) {
        setErrorMessage("You’re offline. Reconnect to continue the lesson.");
        setStatusText(OFFLINE_TUTOR_STATUS_TEXT);
        return;
      }

      if (prompt.length > MAX_TUTOR_INPUT_LENGTH) {
        setErrorMessage(
          `Keep prompts under ${MAX_TUTOR_INPUT_LENGTH} characters so the tutor can respond quickly.`
        );
        return;
      }

      const queue = getQueue();
      const studentTurn = classifyStudentTurn({
        prompt,
        awaitingStudentReply: awaitingStudentResponseRef.current,
        activeTopic: activeTopicRef.current,
      });
      const nextBoardAreaIndex = studentTurn.useFreshBoardArea
        ? boardAreaIndexRef.current + 1
        : boardAreaIndexRef.current;
      const boardArea = createBoardArea(nextBoardAreaIndex);
      const nextTopic = studentTurn.nextTopic ?? activeTopicRef.current;
      const nextConversation = [
        ...conversation,
        createConversationMessage(messageCountRef, "user", prompt),
      ];

      boardAreaIndexRef.current = nextBoardAreaIndex;
      activeTopicRef.current = nextTopic;
      runningRef.current = true;
      setIsTeaching(true);
      setAwaitingResponseState(false);
      setInput("");
      setErrorMessage(null);
      setShowDemoFallback(false);
      setStatusText(THINKING_STATUS_TEXT);
      setTranscript("");
      setConversation(nextConversation);

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      getSpeechPlayer().cancel();
      queue.reset();
      queue.setDelayMs(DEMO_DELAY_MS);

      if (studentTurn.useFreshBoardArea) {
        queue.enqueue({
          type: "move_viewport",
          x: boardArea.x,
          y: boardArea.y,
          zoom: boardArea.zoom,
        });
      }

      try {
        const response = await requestTutorResponse({
          body: JSON.stringify({
            messages: nextConversation,
            lessonContext: {
              interactionMode: studentTurn.interactionMode,
              currentTopic: nextTopic,
              boardArea,
            },
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorPayload = await readErrorPayload(response);
          setAwaitingResponseState(false);
          setErrorMessage(errorPayload.message);
          setStatusText(
            errorPayload.code === "rate_limited"
              ? "Tutor is busy right now."
              : "Tutor unavailable right now."
          );
          setTranscript(errorPayload.message);
          setShowDemoFallback(errorPayload.code === "missing_api_key");
          queue.clear();
          return;
        }

        if (!response.body) {
          throw new Error("The tutor response stream was empty.");
        }

        setStatusText(TEACHING_STATUS_TEXT);

        const assistantText = await consumeTutorDataStream({
          stream: response.body,
          onAssistantText(text) {
            setTranscript(text);
          },
          onSpeechSegment(segment) {
            queue.enqueue({ type: "speak", text: segment });
          },
          onCommand(command) {
            queue.enqueue(command);
          },
        });

        if (assistantText) {
          setConversation((current) => [
            ...current,
            createConversationMessage(messageCountRef, "assistant", assistantText),
          ]);
        }

        const shouldWaitForReply = shouldAwaitStudentReply(assistantText);
        setAwaitingResponseState(shouldWaitForReply);

        await queue.onIdle();
        setStatusText(
          shouldWaitForReply ? AWAITING_RESPONSE_STATUS_TEXT : READY_STATUS_TEXT
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          const message = getFriendlyNetworkMessage(error, isOffline);
          setAwaitingResponseState(false);
          setErrorMessage(message);
          setTranscript(message);
          setStatusText(isOffline ? OFFLINE_TUTOR_STATUS_TEXT : "Something went wrong.");
          queue.clear();
          getSpeechPlayer().cancel();
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        runningRef.current = false;
        setIsTeaching(false);
      }
    },
    [
      conversation,
      getQueue,
      getSpeechPlayer,
      input,
      isOffline,
      setAwaitingResponseState,
    ]
  );

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <style>{STUDENT_TOOLBAR_STYLES}</style>

      <Excalidraw
        excalidrawAPI={onExcalidrawAPI}
        UIOptions={{
          canvasActions: {
            clearCanvas: false,
            changeViewBackgroundColor: false,
            export: false,
            loadScene: false,
            saveAsImage: false,
            saveToActiveFile: false,
            toggleTheme: false,
          },
          tools: {
            image: false,
          },
        }}
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
          top: 20,
          left: 20,
          zIndex: 120,
          maxWidth: 360,
          padding: "14px 16px",
          borderRadius: 18,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow: "0 14px 30px rgba(15, 23, 42, 0.12)",
          backdropFilter: "blur(18px)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#2563eb",
          }}
        >
          AI tutor
        </p>
        <p
          aria-live="polite"
          style={{
            margin: "8px 0 0",
            color: "#0f172a",
            fontSize: 16,
            lineHeight: 1.45,
            fontWeight: 500,
          }}
        >
          {transcript || DEFAULT_TRANSCRIPT_TEXT}
        </p>
      </div>

      <CanvasTutorControls
        input={input}
        canSubmit={
          isCanvasReady &&
          !isTeaching &&
          input.trim().length > 0 &&
          input.trim().length <= MAX_TUTOR_INPUT_LENGTH
        }
        errorMessage={errorMessage}
        isAwaitingResponse={isAwaitingResponse}
        isMuted={isMuted}
        isOffline={isOffline}
        isTeaching={isTeaching}
        maxInputLength={MAX_TUTOR_INPUT_LENGTH}
        showDemoFallback={showDemoFallback}
        statusText={statusText}
        onInputChange={setInput}
        onRunDemo={runDemo}
        onSubmit={handleSubmit}
        onToggleMute={toggleMute}
      />
    </div>
  );
}

function createConversationMessage(
  messageCountRef: MutableRefObject<number>,
  role: ConversationMessage["role"],
  content: string
): ConversationMessage {
  messageCountRef.current += 1;

  return {
    id: `message-${messageCountRef.current}`,
    role,
    content,
  };
}

async function readErrorPayload(response: Response) {
  try {
    const payload = (await response.json()) as {
      code?: string;
      error?: string;
    };

    return {
      code: payload.code ?? null,
      message: payload.error ?? "The tutor could not answer right now.",
    };
  } catch {
    return {
      code: null,
      message: "The tutor could not answer right now.",
    };
  }
}

function getFriendlyNetworkMessage(error: unknown, isOffline: boolean) {
  if (isOffline || isRetryableNetworkError(error)) {
    return "The network is unstable right now. Reconnect and try again.";
  }

  return error instanceof Error ? error.message : "The tutor could not answer right now.";
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
