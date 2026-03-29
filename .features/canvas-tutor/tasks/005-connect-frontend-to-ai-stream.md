---
id: 005
status: done
depends: [004]
created: 2026-03-28
---

# Connect frontend to AI streaming endpoint

Wire the canvas UI to the `/api/tutor/teach` endpoint. The child types a request, the AI streams back speech + tool calls, and the frontend feeds them into the command queue for progressive canvas rendering + voice narration.

## What to do

- Add a floating text input overlay on the canvas (minimal, non-intrusive)
- Use Vercel AI SDK's `useChat` or manual fetch to stream from `/api/tutor/teach`
- Parse the streaming response to extract:
  - Text chunks → queue as `speak` commands
  - Tool calls → queue as canvas commands (draw_shape, write_text, etc.)
- Feed extracted commands into the command queue from task 002
- Maintain conversation history in React state (messages array)
- Remove the temporary "Demo" button (or keep as fallback when no API key)
- Add a loading/thinking indicator while the AI is generating

## Acceptance criteria

- [x] Child can type "teach me fractions" and get a dynamic AI-generated lesson
- [x] AI response streams into the command queue — drawing + narration happen progressively
- [x] Conversation history maintained — follow-up messages have context
- [x] Text input is minimal and doesn't block the canvas
- [x] Loading state shown while AI generates
- [x] Works end-to-end: type → stream → draw → speak

## Files

- Modified: canvas lesson page (text input, streaming integration)
- New or modified: stream parser utility

## Verify

```bash
cd app && npm run build && npm run typecheck
```
