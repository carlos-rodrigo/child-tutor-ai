---
id: 004
status: open
depends: [003]
created: 2026-03-28
---

# Build AI teaching endpoint with streaming tool calls

Create the `/api/tutor/teach` endpoint that uses Vercel AI SDK's `streamText` with tool definitions. The LLM generates interleaved speech + canvas commands as tool calls. This replaces the scripted lesson with dynamic AI-generated teaching.

## What to do

- Define tool schemas using Zod: `draw_shape`, `write_text`, `draw_arrow`, `highlight_area`, `draw_line`, `clear_canvas`, `move_viewport`
- Create the `POST /api/tutor/teach` route handler that:
  - Accepts `{ messages: Message[] }` (conversation history)
  - Calls `streamText()` with the AI SDK, model, system prompt, and tools
  - Streams the response (text chunks + tool call results)
- Write the system prompt for a child-friendly math tutor that teaches by drawing
- Use `maxToolRoundtrips` or manual tool result handling so the AI can chain multiple tool calls per turn
- Handle the case where OPENAI_API_KEY is missing (return a helpful error, not a crash)

## Acceptance criteria

- [ ] `POST /api/tutor/teach` endpoint works with streaming
- [ ] AI generates both speech text and tool calls (draw_shape, write_text, etc.)
- [ ] Tool parameters validated with Zod
- [ ] System prompt produces child-friendly, visual-first teaching
- [ ] Conversation history is passed in and used for context
- [ ] Missing API key returns a clear error response
- [ ] No TypeScript errors

## Files

- New: `app/app/api/tutor/teach/route.ts`
- New: tool definitions module
- New: system prompt module

## Verify

```bash
cd app && npm run build && npm run typecheck
```
