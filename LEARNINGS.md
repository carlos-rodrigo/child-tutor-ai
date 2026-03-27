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

## Frontend Tooling: Next.js 16 effect-state lint rule

**Date:** 2026-03-27
**Context:** Refactoring the lesson shell in `app/app/page.tsx` for child-tutor-ai task 001.
**Learning:** This repo's Next.js 16 lint setup (`react-hooks/set-state-in-effect`) rejects synchronous state updates triggered from `useEffect`. For UI transforms like canvas scene projection, keep them as pure render-time derivations (e.g., `buildScene`) instead of effect-driven `setState`.
**Applies to:** Future UI tasks in this project, especially tasks 002/003/004 that evolve lesson rendering and flow state.
