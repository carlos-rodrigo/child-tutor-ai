---
id: 006
status: open
depends: [004]
created: 2026-03-27
---

# Polish completion state and replay flow

## What to do

- Make the completion moment feel rewarding but tasteful
- Improve replay/restart behavior
- Ensure the session can be restarted cleanly from the UI

## Acceptance criteria

- [ ] Completion state feels polished
- [ ] Replay flow works without stale UI state
- [ ] Restarting returns the lesson to a clean initial state

## Files

- app/app/page.tsx
- app/app/globals.css
- app/lib/fractions-lesson.ts

## Verify

```bash
cd app && npm run build
```
