---
id: 003
status: done
depends: [001]
created: 2026-03-27
---

# Add streaming tutor speech rendering in UI

## What to do

- Make tutor speech appear progressively in the UI when the backend streams
- Preserve fallback behavior when no API key is present
- Ensure speech playback still works cleanly with the displayed copy

## Acceptance criteria

- [x] Streamed tutor text is visible in the UI when available
- [x] Fallback JSON behavior still works
- [x] No regressions in lesson progression

## Files

- app/app/page.tsx
- app/app/api/tutor/respond/route.ts

## Verify

```bash
cd app && npm run build
```
