# PRD: Canvas Tutor — AI Teacher on a Full-Page Whiteboard

## Problem

Children often leave school without fully understanding math concepts like fractions, multiplication, or division. Traditional tutoring apps feel like chatbots with decorations — text-heavy, impersonal, and boring. Kids need a teacher who *shows* them, not just tells them. Nobody has built an AI that teaches by drawing on a canvas the way a real tutor draws on a whiteboard.

## Solution

A full-page Excalidraw canvas where an AI teacher draws, writes, and explains math concepts visually — in real time. The child asks what they want to learn ("teach me fractions"), and the AI takes over the canvas: drawing shapes, writing equations, highlighting key ideas, and guiding the child through understanding. The child can also draw and write on the canvas. Voice narration accompanies everything.

The entire webpage *is* the canvas. No sidebars, no chat panels, no traditional web UI. Just a whiteboard, a teacher, and a student.

## Core Concepts

### The Canvas is Everything
- The full browser viewport is an Excalidraw canvas
- The AI draws directly on it: shapes, text, arrows, highlights, equations
- The child can draw and write on it too
- Minimal floating UI (input box, mic button) overlaid on the canvas
- The AI controls camera/viewport to guide attention (zoom, pan)

### AI with Creative Freedom
- The AI decides *how* to teach each concept — it picks the visuals, the approach, the pacing
- If the kid doesn't understand, the AI tries a *different* visual explanation (not just repeating)
- It can use any visual strategy: pizza slices for fractions, number lines, bar charts, grouping objects, step-by-step written math
- The AI generates Excalidraw element commands dynamically via an LLM

### Voice-First, Text-Fallback
- AI narrates with browser speech synthesis as it draws
- Child input: text box for now (voice input as a future upgrade)
- The child types things like "teach me fractions", "I don't get it", "what about 1/3?"

### Math Focus
- Starting scope: **arithmetic fundamentals**
  - Fractions (1/2, 1/4, understanding parts of a whole)
  - Multiplication and division basics
  - Multiply/divide by 10, 100 (adding/removing zeros)
  - Addition and subtraction with visual grouping
- Expandable to more math topics later

## User Stories

### US-001: Ask to Learn a Topic

**As a** child, **I want** to type what I want to learn, **so that** the AI teaches me exactly that.

**Given** the canvas is open
**When** I type "teach me fractions" in the input box
**Then** the AI begins a visual lesson on fractions, drawing on the canvas and narrating

**Acceptance Criteria:**
- [ ] Text input floats over the canvas (minimal, non-intrusive)
- [ ] AI interprets the request and starts a relevant lesson
- [ ] Canvas starts populating with drawings and text within seconds
- [ ] Voice narration begins alongside the visual teaching

### US-002: Watch the AI Draw and Explain

**As a** child, **I want** to see the AI draw examples on the whiteboard, **so that** I understand the concept visually.

**Given** a lesson is in progress
**When** the AI explains a concept
**Then** it draws shapes, writes equations, highlights areas, and uses arrows — all animated on the canvas

**Acceptance Criteria:**
- [ ] AI can create shapes (rectangles, circles, lines, arrows)
- [ ] AI can write text and math notation on the canvas
- [ ] AI can highlight or emphasize regions
- [ ] Elements appear progressively (not all at once) to support pacing
- [ ] Voice narration is synchronized with drawing actions

### US-003: Interact on the Canvas

**As a** child, **I want** to draw and write on the canvas too, **so that** I can answer questions or show my thinking.

**Given** the AI asks me to try something (e.g., "circle which is 1/2")
**When** I draw or write on the canvas
**Then** the AI can see what I did and respond to it

**Acceptance Criteria:**
- [ ] Child has access to basic Excalidraw drawing tools
- [ ] AI can read/interpret what the child drew or wrote
- [ ] AI responds based on the child's canvas input
- [ ] Drawing tools are simplified for children (big icons, limited set)

### US-004: Get a Different Explanation When Stuck

**As a** child, **I want** the AI to try a new approach if I don't understand, **so that** I don't feel stuck repeating the same thing.

**Given** I tell the AI "I don't get it" or answer incorrectly
**When** the AI responds
**Then** it clears or moves to a new area and tries a completely different visual strategy

**Acceptance Criteria:**
- [ ] AI detects confusion (explicit "I don't get it" or wrong answers)
- [ ] AI generates an alternative visual explanation (not a repeat)
- [ ] Canvas transitions smoothly to the new explanation
- [ ] AI voice is encouraging and patient

### US-005: Hear the Teacher Speak

**As a** child, **I want** the AI to talk to me while it draws, **so that** I can listen and watch at the same time.

**Given** the AI is teaching
**When** it draws or explains something
**Then** I hear a voice narrating what's happening

**Acceptance Criteria:**
- [ ] Browser speech synthesis speaks the AI's explanations
- [ ] Speech is paced appropriately (not too fast for a child)
- [ ] Speech timing roughly matches when visual elements appear
- [ ] Mute/unmute control available

### US-006: Navigate Between Topics

**As a** child, **I want** to ask about a different topic mid-session, **so that** I can learn what I need right now.

**Given** the AI is teaching fractions
**When** I type "now teach me multiplication"
**Then** the AI transitions to a new lesson on multiplication

**Acceptance Criteria:**
- [ ] AI handles topic switches gracefully
- [ ] Canvas clears or moves to fresh area for new topic
- [ ] Previous drawings remain accessible (scroll/pan back)
- [ ] AI acknowledges the switch naturally

## Modules

| Module | Responsibility | New or Modified |
|--------|---------------|-----------------|
| Canvas surface | Full-page Excalidraw instance with AI + child drawing | New (replaces current DOM canvas) |
| AI teaching engine | LLM that generates teaching plans as canvas commands + speech | New (replaces scripted lesson engine) |
| Canvas command executor | Translates AI output into Excalidraw API calls with animation/timing | New |
| Speech layer | Browser synthesis narration synced with canvas actions | Modified (keep synthesis, add sync) |
| Student input | Floating text box + canvas drawing interpretation | New |
| Math renderer | KaTeX → SVG for equations on canvas | New |
| API routes | Streaming LLM responses with structured canvas commands | Modified |

## Out of Scope

- Voice input (text box for now)
- User accounts or persistent progress
- Parent/teacher dashboard
- Multiple subjects beyond math
- Mobile-optimized layout (desktop-first for demo)
- Multiplayer/classroom mode
- Custom AI voice (browser synthesis only)

## Open Questions

- [ ] How much of Excalidraw's toolbar should be exposed to the child? (Full? Simplified subset?)
- [ ] Should the AI's drawing feel hand-drawn (Excalidraw's default style) or clean/precise?
- [ ] How should math notation render? (KaTeX → SVG embedded as Excalidraw elements? Or plain text approximation like "1/2"?)
- [ ] Should there be a visible "AI cursor" showing where the teacher is drawing, like watching someone's screen?
- [ ] What LLM model should power the teaching? (Current setup uses AI SDK + OpenAI)
