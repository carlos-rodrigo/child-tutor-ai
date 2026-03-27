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

## UX: Apply canvas updates before streaming speech

**Date:** 2026-03-27
**Context:** Task 004 — lesson flow transitions
**Learning:** When using streaming speech responses, immediately apply structural state (canvas scene, question text) from response headers as soon as they arrive. Only stream the speech text separately. Deferring canvas updates until after speech finishes creates stale-UI while speech plays.
**Applies to:** Any streaming UX where structural + textual state are separate

## React: Evaluating state with empty-string gate

**Date:** 2026-03-27
**Context:** Task 004 — thinking placeholder
**Learning:** `evaluating && !streamedSpeech` accurately gates a "Thinking…" placeholder — it disappears naturally the moment the first streaming chunk arrives, with no explicit clear needed.
**Applies to:** Any loading state that coexists with streaming content

## Security: Wrap JSON.parse of response headers in try-catch

**Date:** 2026-03-27
**Context:** Task 004 — x-tutor-turn header parsing
**Learning:** Even server-set headers can be corrupted by proxies or bugs. Always wrap JSON.parse of any response header in try-catch and swallow gracefully rather than crashing the handler.
**Applies to:** All fetch-based streaming consumers that parse structured headers

## Web Speech API: Local Type Declarations

**Date:** 2026-03-27
**Context:** Adding voice input without TypeScript lib types for SpeechRecognition.
**Learning:** Declare a local `ISpeechRecognition` interface and a `SpeechRecognitionCtor` type alias, then use `getSpeechRecognition()` returning `SpeechRecognitionCtor | null`. Avoids `@ts-ignore` and `as any` entirely.
**Applies to:** Any Web API not in the configured TypeScript lib target.

## Empty String in includes() Matching

**Date:** 2026-03-27
**Context:** Matching a voice transcript against choice labels using `label.includes(transcript)`.
**Learning:** `String.prototype.includes("")` is always `true`. Any symmetric partial-match logic must guard `if (!input) return` before the comparison or it will false-match on empty input.
**Applies to:** Any search/filter/match that uses `.includes()` with user-supplied input.

## SpeechRecognition onend Always Fires

**Date:** 2026-03-27
**Context:** Voice input state machine cleanup after recognition ends.
**Learning:** `onend` fires after both `onresult` and `onerror`. Use a functional state updater `setVoiceState((s) => s === "listening" ? "idle" : s)` in `onend` so it only resets the transient listening state and leaves sticky failure states (denied, unsupported) untouched.
**Applies to:** Any cleanup that must not overwrite sticky/terminal states.

## UI State: Completion vs Pre-session Branching

**Date:** 2026-03-27
**Context:** Task 006 — polish completion state and replay flow.
**Learning:** In a finite lesson where all intermediate turns have choices, `choices.length === 0` conflates "not started" and "completed." Split on a derived `isCompleted` boolean first (`turn?.stepId === "completed"`) before falling back to a generic empty-state card.
**Applies to:** Any multi-step UI that reuses a single container for pre/post states.

## UI State: Voice Input Reset on Session Restart

**Date:** 2026-03-27
**Context:** Task 006 — startSession() voice state reset.
**Learning:** Use `(s === "unsupported" ? "unsupported" : "idle")` to reset voice state on restart. This clears `listening` (can get stuck if mic was active at restart) and `denied` (let them retry), while keeping the environmental `unsupported` state sticky.
**Applies to:** Any mic/media permission state machines with restart flows.

## CSS: will-change for hover transform buttons

**Date:** 2026-03-27
**Context:** Task 006 — replay-cta button.
**Learning:** When a button uses `transition: transform` on hover AND box-shadow (which isn't GPU-composited), add `will-change: transform` to move the element to its own compositor layer. This prevents jank from paint on hover.
**Applies to:** Any interactive button with `transform` + `box-shadow` transitions.

## Deployment: Vercel CLI token expiry and CDN cache diagnostics

**Date:** 2026-03-27
**Context:** Task 007 — deploy and verify production. Vercel CLI returned "token not valid".
**Learning:** Vercel CLI credentials live in `~/.local/share/com.vercel.cli/auth.json`. Tokens expire. Always run `vercel whoami` before a deploy task to confirm auth. If expired, `vercel login` interactively or set `VERCEL_TOKEN` in the shell. Store `VERCEL_TOKEN=<token>` in `~/.profile` or project secrets for unattended deploy tasks. The CDN `age` response header (from `curl -sI`) reliably indicates whether a new deployment has been promoted: `age: 0` = fresh deploy; monotonically increasing `age` = old build still cached.
**Applies to:** All future deploy tasks across any Vercel-hosted project.

## Deployment: GitHub push triggers Vercel auto-deploy (when integration is healthy)

**Date:** 2026-03-27
**Context:** Vercel CLI unavailable; pushed to main to rely on GitHub integration.
**Learning:** Vercel GitHub integration auto-deploys on push to the production branch (usually `main`). This is the fallback when CLI tokens are stale. The integration requires a healthy webhook — check Vercel dashboard → Project → Settings → Git if pushes don't trigger builds.
**Applies to:** Any project with Vercel GitHub integration set up.
