# Technical Design: Child Tutor AI

## 1. Objective

Build a voice-first tutoring experience for children where the tutor teaches on a canvas. The MVP should deliver a short fractions lesson with visual explanation, simple interaction, and a warm child-friendly presentation.

## 2. Product Shape

This should feel like:
- a tutor with a board
- a lightweight educational experience
- a guided lesson

This should **not** feel like:
- a generic chatbot
- a dashboard
- a long-form productivity app

## 3. MVP Approach

The right first implementation is a **guided lesson engine**, not a fully open real-time AI tutor.

Reason:
- The key thing to validate is the experience.
- We need control over pacing, visuals, and child-safe clarity.
- Open-ended generation can come later once the interaction model is validated.

So the first version should use:
- a scripted lesson plan
- structured drawing actions
- predefined branching for correct/incorrect answers
- voice output layered on top

## 4. Architecture

Recommended MVP stack:
- **Frontend:** Next.js
- **Backend:** Next.js route handlers / server functions
- **Interaction layer:** Vercel AI SDK
- **Rendering:** HTML5 Canvas or SVG-based canvas layer
- **Voice output:** browser speech synthesis or external TTS abstraction
- **Voice input:** browser speech recognition if usable, with button fallback
- **State:** in-memory session state for first demo

The first version should still use a real backend shape, but implemented inside Next.js.
That means we define session orchestration, tutor turn handling, and structured actions now, without introducing a separate backend service yet.

## 5. Main UI Areas

### A. Home screen
Purpose:
- welcome the child
- provide one obvious way to begin

Elements:
- title / brand
- playful illustration or animated board
- button: “Repasar fracciones”

### B. Lesson screen
Purpose:
- host the tutoring session

Elements:
- large central canvas
- tutor voice/status indicator
- simple control row:
  - repeat
  - next
  - clear / replay
- answer buttons when needed
- optional microphone button

### C. Completion state
Purpose:
- close the lesson with a clear sense of progress

Elements:
- short recap
- encouraging message
- option to repeat or try again

## 6. Lesson Engine Model

The lesson can be modeled as a sequence of steps.

The AI SDK should be used as the orchestration bridge between UI and backend:
- streaming tutor responses
- structured canvas/tool actions
- controlled branching after child responses
- clean UI/backend contracts for future expansion

### Step shape
Each lesson step should define:
- `id`
- `speech`
- `canvasActions[]`
- `question` (optional)
- `choices[]` (optional)
- `onCorrect`
- `onIncorrect`
- `nextStep`

Example conceptual structure:

```ts
type LessonStep = {
  id: string;
  speech: string;
  canvasActions: CanvasAction[];
  question?: string;
  choices?: string[];
  nextStep?: string;
  onCorrect?: string;
  onIncorrect?: string;
};
```

This lets the experience feel dynamic while staying deterministic and controllable.

## 7. Canvas Action Model

The tutor should not draw freely. It should emit structured instructions.

The tutor turn should be expressed as:
- streamed spoken text
- structured UI actions
- optional question payloads
- explicit session status (`speaking`, `awaiting_answer`, `completed`)

### Canvas actions for MVP
- `clear`
- `drawRect`
- `drawCircle`
- `splitShape`
- `fillSegment`
- `writeText`
- `highlight`
- `showPointer`
- `erase`

Example:

```json
{
  "speech": "Vamos a dividir este rectángulo en dos partes iguales.",
  "canvasActions": [
    { "type": "clear" },
    { "type": "drawRect", "id": "r1", "x": 120, "y": 120, "w": 260, "h": 140 },
    { "type": "splitShape", "target": "r1", "parts": 2, "direction": "vertical" },
    { "type": "fillSegment", "target": "r1", "segment": 1, "color": "#7dd3fc" },
    { "type": "writeText", "text": "1/2", "x": 220, "y": 300 }
  ]
}
```

This keeps the system safe, understandable, and easy to iterate.

## 8. Voice Strategy

### Voice output
The tutor should speak at each step.

MVP options:
1. browser speech synthesis (fastest)
2. external TTS later for better voice quality

### Voice input
For the first version:
- primary interaction can be buttons
- voice input can be optional / best-effort

This avoids fragile demos caused by poor recognition.

## 9. Interaction Model

### Recommended input priority
- first: big answer buttons
- second: microphone button for voice
- optional later: touch/click directly on the canvas

Why:
- buttons are reliable
- voice keeps the concept compelling
- direct canvas interaction can be added after the base loop works

## 10. Visual Direction

The UI should combine:
- playful color
- emotional warmth
- clarity

Suggested style direction:
- bright but not chaotic
- rounded shapes
- soft shadows
- lively accent colors
- a board/canvas with clear visual hierarchy

The canvas itself should feel like a magical notebook or smart whiteboard.

## 11. State Model

### Session state
- current lesson step
- selected answer
- whether tutor is speaking
- whether lesson is complete
- current canvas scene

### No persistence in MVP
Everything can be in React state for the first demo.

## 12. Fractions Lesson Structure

Suggested lesson:

### Step 1 — Welcome
Tutor introduces itself and the lesson.

### Step 2 — What is a fraction?
Draw rectangle, split in two, explain 1/2.

### Step 3 — Another example
Show four parts, explain 1/4.

### Step 4 — Guided question
Ask child to identify a fraction.

### Step 5 — Branch
- correct path: reinforcement
- incorrect path: slower re-explanation

### Step 6 — Summary
Recap what the child learned.

## 13. Risks

### Risk 1: Too much complexity too early
Mitigation:
- guided lesson only
- one subject only
- one session only

### Risk 2: Voice input unreliability
Mitigation:
- button-first answers
- optional voice path

### Risk 3: Visual chaos
Mitigation:
- limited action vocabulary
- controlled canvas primitives
- simple lesson scenes

### Risk 4: Feels like a chat app with decorations
Mitigation:
- make the canvas dominant
- minimize text UI
- drive the experience through motion, drawing, and speech

## 14. Milestones

### Milestone 1: Experience skeleton
- home screen
- lesson screen
- session state
- basic design language

### Milestone 2: Canvas engine
- primitive renderer
- scene transitions
- step playback

### Milestone 3: Voice layer
- tutor speech
- speaking state
- optional mic button

### Milestone 4: Guided fractions lesson
- full 3–5 minute flow
- correct/incorrect branches
- completion state

## 15. Future Extensions

After validating the MVP:
- more lessons
- more subjects
- adaptive lesson generation
- persistent student progress
- stronger voice interaction
- tutor personality options
- parent/teacher visibility
