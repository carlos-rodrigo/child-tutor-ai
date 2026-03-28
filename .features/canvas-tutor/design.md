# Design: Canvas Tutor — AI Teacher on a Full-Page Whiteboard

> PRD: .features/canvas-tutor/prd.md

## Architectural Decisions

### Canvas Surface
- **Excalidraw** (`@excalidraw/excalidraw`) as the full-page React component
- Programmatic element creation via `updateScene()` API — no manual drawing by the AI
- Child gets a simplified toolbar (freehand, text, eraser) for their own drawing
- AI elements are visually distinct (clean style) vs child elements (hand-drawn style)

### AI Teaching Engine
- **Vercel AI SDK** with tool calls (structured output) — the LLM decides what to teach and how to visualize it
- Tools: `draw_shape`, `write_text`, `draw_arrow`, `highlight_area`, `clear_canvas`, `move_viewport`
- Each tool call maps to Excalidraw element creation
- Speech text streams alongside tool calls — narration + drawing are interleaved

### Rendering Pipeline
- LLM streams response → parser extracts tool calls + speech chunks
- **Command queue** processes canvas commands sequentially with configurable delays (progressive reveal)
- Speech synthesis is triggered per speech chunk, synchronized with drawing pace

### Voice
- Browser `SpeechSynthesis` for output (same as MVP)
- No voice input in this version (text input instead)

### Stack
- **Frontend:** Next.js (existing app)
- **Canvas:** `@excalidraw/excalidraw` React component
- **AI:** Vercel AI SDK with `streamText` + tool definitions
- **State:** React state + Excalidraw internal state
- **Math rendering:** Plain text fractions for now (e.g. "1/2"), KaTeX later

### Routes
- `POST /api/tutor/teach` — start or continue a lesson (streaming response with tool calls + speech)
- No separate start/respond split — single conversational endpoint with message history

### Key Models
- `TeachingMessage` — user or AI message in the conversation
- `CanvasCommand` — structured command for the canvas executor
- `ExcalidrawScene` — snapshot of current canvas state for AI context

---

## Phase 1: Excalidraw Foundation

**User stories**: US-002, US-005

### What to build

Replace the custom DOM canvas with a full-page Excalidraw instance. The AI can programmatically add elements (rectangles, circles, text, arrows, lines) using `updateScene()`. Browser speech synthesis narrates as elements appear. No AI yet — use a hardcoded demo sequence to validate the canvas pipeline.

This is the tracer bullet: one button triggers a scripted sequence of Excalidraw commands with voice narration, proving the full rendering + speech pipeline works end-to-end.

### Acceptance criteria

- [ ] Full-page Excalidraw canvas renders in the existing Next.js app
- [ ] A "Demo" button triggers a scripted sequence: draw rect → split → fill → add text label → add arrow
- [ ] Elements appear progressively (not all at once) with ~500ms delays
- [ ] Speech synthesis narrates each step as it draws
- [ ] Child can draw freely on the canvas alongside AI elements
- [ ] Viewport is controlled programmatically (scroll to where AI is drawing)

---

## Phase 2: AI Teaching Engine with Tool Calls

**User stories**: US-001, US-002, US-004

### What to build

Replace the scripted sequence with an LLM that generates teaching content dynamically. The child types "teach me fractions" and the AI responds with interleaved speech + canvas tool calls. The AI decides what visuals to use and how to explain the concept.

The API uses Vercel AI SDK's `streamText` with tool definitions. Each tool call (`draw_shape`, `write_text`, etc.) is executed on the canvas in real time as the stream arrives.

### Acceptance criteria

- [ ] Floating text input overlays the canvas (minimal, non-intrusive)
- [ ] Child can type a request like "teach me fractions"
- [ ] API streams response with tool calls that create Excalidraw elements
- [ ] Speech text streams and narrates alongside drawing
- [ ] AI generates different visual explanations for the same topic (not scripted)
- [ ] System prompt ensures child-safe, encouraging, patient tone
- [ ] Conversation history maintained so the AI remembers what it already taught

---

## Phase 3: Student Interaction & Adaptive Teaching

**User stories**: US-003, US-004, US-006

### What to build

Enable the child to interact beyond typing — the AI can ask questions, and the child responds by typing or drawing. The AI reads the child's canvas additions (position, text content) and responds adaptively. When the child says "I don't get it" or answers wrong, the AI tries a different visual approach.

Also: topic switching. The child can say "now teach me multiplication" and the AI transitions smoothly.

### Acceptance criteria

- [ ] AI can ask questions and wait for the child's response
- [ ] Child's text input and basic canvas drawings are sent to the AI as context
- [ ] Wrong answers or "I don't get it" trigger alternative visual explanations (not repeats)
- [ ] AI can handle topic switches mid-conversation
- [ ] Canvas clears or pans to fresh area for new topics
- [ ] Previous drawings remain accessible by scrolling/panning
- [ ] Simplified child toolbar: freehand draw, text, eraser only

---

## Phase 4: Polish & Demo-Ready

**User stories**: US-005, US-006

### What to build

Polish the experience for demo quality. Speech pacing synchronized with drawing speed. Smooth viewport animations. Loading states while AI thinks. Mute/unmute. Error handling for API failures. Mobile-passable layout (not optimized, but not broken).

### Acceptance criteria

- [ ] Speech timing matches drawing pace (not ahead, not behind)
- [ ] Viewport smoothly pans/zooms to follow AI drawing
- [ ] Loading indicator while AI is generating
- [ ] Mute/unmute button for voice
- [ ] Graceful error handling (API down, rate limited)
- [ ] Works on desktop Chrome, Firefox, Safari
- [ ] Demo can run for 3-5 minutes teaching fractions without breaking

---

## Technical Details

### Excalidraw Integration

```ts
// Programmatic element creation
const rect: ExcalidrawRectangleElement = {
  type: "rectangle",
  x: 100, y: 100,
  width: 200, height: 100,
  strokeColor: "#1e1e1e",
  backgroundColor: "#a5d8ff",
  fillStyle: "solid",
  // ... other required fields
};

// Add to scene
excalidrawAPI.updateScene({
  elements: [...existingElements, rect],
});

// Viewport control
excalidrawAPI.scrollToContent(rect, { fitToContent: true, animate: true });
```

### AI Tool Definitions

```ts
const tools = {
  draw_shape: {
    description: "Draw a shape on the whiteboard",
    parameters: z.object({
      type: z.enum(["rectangle", "ellipse", "diamond"]),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      backgroundColor: z.string().optional(),
      label: z.string().optional(),
    }),
  },
  write_text: {
    description: "Write text on the whiteboard",
    parameters: z.object({
      text: z.string(),
      x: z.number(),
      y: z.number(),
      fontSize: z.number().optional(),
    }),
  },
  draw_arrow: {
    description: "Draw an arrow between two points",
    parameters: z.object({
      startX: z.number(), startY: z.number(),
      endX: z.number(), endY: z.number(),
      label: z.string().optional(),
    }),
  },
  highlight_area: {
    description: "Highlight a region to draw attention",
    parameters: z.object({
      x: z.number(), y: z.number(),
      width: z.number(), height: z.number(),
      color: z.string().optional(),
    }),
  },
  draw_line: {
    description: "Draw a line to divide or connect",
    parameters: z.object({
      startX: z.number(), startY: z.number(),
      endX: z.number(), endY: z.number(),
    }),
  },
  clear_canvas: {
    description: "Clear all elements from the canvas",
    parameters: z.object({}),
  },
  move_viewport: {
    description: "Pan the view to a specific area",
    parameters: z.object({
      x: z.number(), y: z.number(),
      zoom: z.number().optional(),
    }),
  },
};
```

### Command Queue Pattern

```ts
class CanvasCommandQueue {
  private queue: CanvasCommand[] = [];
  private processing = false;
  private delayMs = 400;

  enqueue(cmd: CanvasCommand) {
    this.queue.push(cmd);
    if (!this.processing) this.process();
  }

  private async process() {
    this.processing = true;
    while (this.queue.length > 0) {
      const cmd = this.queue.shift()!;
      this.execute(cmd);
      await sleep(this.delayMs);
    }
    this.processing = false;
  }
}
```

### Streaming Response Shape

The `/api/tutor/teach` endpoint streams interleaved content:

```
[speech] "Let's learn about fractions!"
[tool_call] draw_shape({ type: "rectangle", x: 100, y: 200, width: 300, height: 150 })
[speech] "See this rectangle? I'm going to split it in half."
[tool_call] draw_line({ startX: 250, startY: 200, endX: 250, endY: 350 })
[tool_call] highlight_area({ x: 100, y: 200, width: 150, height: 150, color: "#a5d8ff" })
[speech] "The blue part is one half — one out of two equal pieces."
[tool_call] write_text({ text: "½", x: 160, y: 370, fontSize: 28 })
```

This is handled naturally by Vercel AI SDK's `streamText` with `onToolCall` handlers.

### System Prompt (Core)

```
You are a warm, patient math tutor for children ages 6-12. You teach by drawing on a whiteboard.

Rules:
- ALWAYS draw visuals to explain concepts. Never just talk — show it.
- Use simple language. Short sentences. Encouraging tone.
- Draw shapes, split them, color parts, label with fractions.
- When the child doesn't understand, try a COMPLETELY DIFFERENT visual approach.
- Keep lessons focused. One concept at a time.
- Ask questions to check understanding.
- Never produce scary, unsafe, or inappropriate content.
- Position elements carefully — don't overlap previous drawings.
- Use the move_viewport tool to keep drawings visible.
```

---

## Migration from MVP

- The existing `app/lib/tutor-types.ts` and `app/lib/fractions-lesson.ts` become legacy — not deleted, but superseded
- The existing `app/app/page.tsx` gets replaced with the Excalidraw-based UI
- API routes change from `start`/`respond` to a single `teach` endpoint
- Voice synthesis logic is preserved and enhanced with better timing
- The project structure stays in the same Next.js app — no new repo

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Excalidraw bundle size (~500KB+) | Dynamic import, only load on lesson page |
| LLM generates overlapping/messy layouts | System prompt with layout rules + viewport management |
| Speech desync from drawing | Command queue with configurable pacing |
| Excalidraw API changes | Pin specific version, wrap in adapter |
| LLM hallucinates invalid tool params | Zod validation on all tool parameters |
| Child types inappropriate content | System prompt guardrails + input length limits |
