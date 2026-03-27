## Frontend Tooling: Next.js 16 effect-state lint rule

**Date:** 2026-03-27
**Context:** Refactoring the lesson shell in `app/app/page.tsx` for child-tutor-ai task 001.
**Learning:** This repo's Next.js 16 lint setup (`react-hooks/set-state-in-effect`) rejects synchronous state updates triggered from `useEffect`. For UI transforms like canvas scene projection, keep them as pure render-time derivations (e.g., `buildScene`) instead of effect-driven `setState`.
**Applies to:** Future UI tasks in this project, especially tasks 002/003/004 that evolve lesson rendering and flow state.
