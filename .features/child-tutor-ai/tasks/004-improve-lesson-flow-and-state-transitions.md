---
id: 004
status: open
depends: [002,003]
created: 2026-03-27
---

# Improve lesson flow and state transitions

## What to do

- Smooth out lesson progression between intro, question, correction, reinforcement, and completion
- Reduce abrupt jumps between turns
- Make the experience feel like a continuous guided session

## Acceptance criteria

- [ ] The lesson flow feels coherent from start to finish
- [ ] Correct and incorrect branches both feel intentional
- [ ] Session state remains consistent throughout the run

## Files

- app/lib/fractions-lesson.ts
- app/app/page.tsx
- app/lib/tutor-types.ts

## Verify

```bash
cd app && npm run build
```
