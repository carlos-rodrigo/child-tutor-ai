interface CanvasDemoControlsProps {
  isMuted: boolean;
  isRunning: boolean;
  onRunDemo: () => void;
  onToggleMute: () => void;
}

export function CanvasDemoControls({
  isMuted,
  isRunning,
  onRunDemo,
  onToggleMute,
}: CanvasDemoControlsProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <button
        type="button"
        onClick={onToggleMute}
        style={{
          padding: "12px 20px",
          fontSize: 15,
          fontWeight: 600,
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.08)",
          background: "rgba(255,255,255,0.92)",
          color: "#1f2937",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}
      >
        {isMuted ? "🔇 Voice Off" : "🔊 Voice On"}
      </button>

      <button
        type="button"
        onClick={onRunDemo}
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
          transition: "background 0.2s ease, transform 0.2s ease",
          willChange: "transform",
        }}
      >
        {isRunning ? "Drawing…" : "▶ Run Demo"}
      </button>
    </div>
  );
}
