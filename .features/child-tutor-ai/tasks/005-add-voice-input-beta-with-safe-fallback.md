---
id: 005
status: done
depends: [004]
created: 2026-03-27
---

# Add voice input beta with safe fallback

## What to do

- Add a microphone interaction path for beta use
- Keep button-based answering as the reliable fallback
- Make unsupported-browser or denied-permission states graceful

## Acceptance criteria

- [x] The UI exposes a beta voice input path
- [x] Buttons remain available as fallback
- [x] Failure states do not break the lesson

## Files

- app/app/page.tsx
- app/app/globals.css

## Verify

```bash
cd app && npm run build
```
