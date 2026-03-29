import type { FormEventHandler } from "react";

interface CanvasTutorControlsProps {
  input: string;
  canSubmit: boolean;
  errorMessage?: string | null;
  isAwaitingResponse?: boolean;
  isMuted: boolean;
  isTeaching: boolean;
  showDemoFallback?: boolean;
  statusText: string;
  onInputChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onToggleMute: () => void;
  onRunDemo?: () => void;
}

const srOnlyStyle = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

export function CanvasTutorControls({
  input,
  canSubmit,
  errorMessage,
  isAwaitingResponse = false,
  isMuted,
  isTeaching,
  onInputChange,
  onRunDemo,
  onSubmit,
  onToggleMute,
  showDemoFallback = false,
  statusText,
}: CanvasTutorControlsProps) {
  const promptPlaceholder = isAwaitingResponse
    ? "Type your answer here..."
    : "Teach me fractions...";
  const submitLabel = isTeaching
    ? "Teaching…"
    : isAwaitingResponse
      ? "Answer"
      : "Teach";

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        transform: "translateX(-50%)",
        zIndex: 120,
        width: "min(720px, calc(100vw - 32px))",
        display: "grid",
        gap: 10,
      }}
    >
      <div
        style={{
          alignSelf: "center",
          justifySelf: "center",
          padding: "8px 14px",
          borderRadius: 999,
          background: "rgba(15, 23, 42, 0.78)",
          color: "#f8fafc",
          fontSize: 13,
          fontWeight: 600,
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.18)",
        }}
      >
        {statusText}
      </div>

      <form
        aria-label="Tutor prompt"
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gap: 10,
          padding: 14,
          borderRadius: 20,
          background: isAwaitingResponse
            ? "rgba(255,251,235,0.96)"
            : "rgba(255,255,255,0.94)",
          border: isAwaitingResponse
            ? "1px solid rgba(245, 158, 11, 0.4)"
            : "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow: isAwaitingResponse
            ? "0 18px 44px rgba(245, 158, 11, 0.18)"
            : "0 16px 40px rgba(15, 23, 42, 0.12)",
          backdropFilter: "blur(18px)",
        }}
      >
        <label htmlFor="canvas-tutor-input" style={srOnlyStyle}>
          Ask the tutor what to teach
        </label>

        {isAwaitingResponse ? (
          <div
            style={{
              justifySelf: "start",
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(245, 158, 11, 0.14)",
              color: "#b45309",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Answer the tutor
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: 10,
            alignItems: "center",
          }}
        >
          <input
            id="canvas-tutor-input"
            aria-label="Ask the tutor what to teach"
            autoComplete="off"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={promptPlaceholder}
            style={{
              width: "100%",
              minWidth: 0,
              padding: "14px 16px",
              borderRadius: 14,
              border: isAwaitingResponse
                ? "2px solid rgba(245, 158, 11, 0.55)"
                : "1px solid rgba(15, 23, 42, 0.12)",
              fontSize: 16,
              color: "#0f172a",
              background: isAwaitingResponse
                ? "rgba(255,255,255,0.98)"
                : "rgba(248, 250, 252, 0.96)",
            }}
          />

          <button
            type="button"
            onClick={onToggleMute}
            style={{
              padding: "12px 16px",
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 14,
              border: "1px solid rgba(15, 23, 42, 0.08)",
              background: "rgba(255,255,255,0.92)",
              color: "#1f2937",
              cursor: "pointer",
            }}
          >
            {isMuted ? "🔇 Voice Off" : "🔊 Voice On"}
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              padding: "12px 20px",
              fontSize: 15,
              fontWeight: 700,
              borderRadius: 14,
              border: "none",
              background: canSubmit ? "#228be6" : "#94a3b8",
              color: "#fff",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {submitLabel}
          </button>
        </div>

        {errorMessage ? (
          <p
            style={{
              margin: 0,
              color: "#b91c1c",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {errorMessage}
          </p>
        ) : null}

        {showDemoFallback && onRunDemo ? (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onRunDemo}
              style={{
                padding: "10px 14px",
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 12,
                border: "1px solid rgba(15, 23, 42, 0.12)",
                background: "rgba(255,255,255,0.92)",
                color: "#0f172a",
                cursor: "pointer",
              }}
            >
              ▶ Run Demo Instead
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
