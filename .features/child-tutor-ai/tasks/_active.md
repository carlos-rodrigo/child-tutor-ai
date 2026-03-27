# Current Feature: Child Tutor AI

Started: 2026-03-27

## Progress

- [x] 001 - Refine visual design direction and lesson shell
- [x] 002 - Improve canvas engine and visual primitives
- [x] 003 - Add streaming tutor speech rendering in UI
- [ ] 004 - Improve lesson flow and state transitions
- [ ] 005 - Add voice input beta with safe fallback
- [ ] 006 - Polish completion state and replay flow
- [ ] 007 - Deploy and verify production demo

## Patterns Discovered

- Next.js frontend + backend lives in `app/`
- Tutor contracts live in `app/lib/tutor-types.ts`
- Lesson content currently lives in `app/lib/fractions-lesson.ts`
- API routes are `app/app/api/tutor/start/route.ts` and `app/app/api/tutor/respond/route.ts`
- Next.js 16 lint rules in this repo disallow synchronous state updates inside `useEffect`; derive UI state in render or update state in async handlers instead
