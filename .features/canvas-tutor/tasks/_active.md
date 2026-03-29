# Current Feature: Canvas Tutor

Started: 2026-03-28

## Progress

- [x] 001 - Set up Excalidraw and programmatic element creation
- [x] 002 - Build command queue with progressive reveal and viewport control
- [x] 003 - Add voice narration synchronized with canvas drawing
- [x] 004 - Build AI teaching endpoint with streaming tool calls
- [x] 005 - Connect frontend to AI streaming endpoint
- [ ] 006 - Enable student interaction and adaptive teaching
- [ ] 007 - Polish for demo quality

## Patterns Discovered

- Existing app lives in `app/` (Next.js 16)
- Current custom DOM canvas in `app/app/page.tsx` gets replaced
- Existing types in `app/lib/tutor-types.ts` — keep but supersede
- Vercel AI SDK already installed (`ai` + `@ai-sdk/openai`)
- Browser SpeechSynthesis voice logic already exists in page.tsx — reuse
- Merge new AI elements with `api.getSceneElements()` so scripted updates preserve child drawings already on the board
