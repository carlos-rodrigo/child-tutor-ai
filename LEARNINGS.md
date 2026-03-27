## Canvas: CSS animation performance — opacity vs box-shadow

**Date:** 2026-03-27
**Context:** Adding highlight pulse animation to canvas visual primitives in task 002.
**Learning:** Animating `box-shadow` in CSS `@keyframes` triggers layout + paint on every frame. Use only `opacity` or `transform` inside keyframes for smooth 60fps animations. `box-shadow` can be set statically on the element, but should not change inside an animation.
**Applies to:** Any future canvas or UI animation work in this project.

## Canvas: Horizontal split rendering requires flexDirection: "column"

**Date:** 2026-03-27
**Context:** Implementing horizontal segment splits for the CanvasView in task 002.
**Learning:** Vertical splits use `flex-direction: row` with `width: N%` per segment. Horizontal splits require `flex-direction: column` with `height: N%` per segment. The `CanvasRect` `flexDirection` style must be set dynamically based on `splits.direction`.
**Applies to:** Any future extension of the canvas split/segment system.

## Streaming: AI SDK toDataStreamResponse sends SSE-format bytes, not plain text

**Date:** 2026-03-27
**Context:** Task 003 — adding progressive streaming speech to the tutor UI.
**Learning:** `result.toDataStreamResponse()` from the Vercel AI SDK streams SSE-format chunks like `0:"Hello"` — not raw text. If the client reads bytes directly with a `TextDecoder`, it sees garbled output including the format prefix. Fix: use `result.textStream` (an async iterable of plain strings) and pipe it through a native `ReadableStream` returning `text/plain` content. The client can then safely decode raw bytes to get clean speech text.
**Applies to:** Any AI SDK streaming endpoint where the client consumes the body directly rather than using the AI SDK client hooks.

## Streaming + React: Separate display state from speech trigger using a ref

**Date:** 2026-03-27
**Context:** Task 003 — progressive speech rendering caused `speak()` to fire on every chunk.
**Learning:** If `useEffect` depends on `streamedSpeech` and `speak()` is called inside it, every chunk update triggers a new speech utterance (cancels and restarts). Fix: hold the final speech text in a `useRef` (`speechRef.current`) and remove `streamedSpeech` from the effect dependency array. The effect fires once on `turn` change (after streaming is complete), reads `speechRef.current`, and speaks only once. The display state (`streamedSpeech`) can still update progressively without side effects.
**Applies to:** Any future task combining streamed text display with browser speech synthesis.

## Frontend Tooling: Next.js 16 effect-state lint rule

**Date:** 2026-03-27
**Context:** Refactoring the lesson shell in `app/app/page.tsx` for child-tutor-ai task 001.
**Learning:** This repo's Next.js 16 lint setup (`react-hooks/set-state-in-effect`) rejects synchronous state updates triggered from `useEffect`. For UI transforms like canvas scene projection, keep them as pure render-time derivations (e.g., `buildScene`) instead of effect-driven `setState`.
**Applies to:** Future UI tasks in this project, especially tasks 002/003/004 that evolve lesson rendering and flow state.
