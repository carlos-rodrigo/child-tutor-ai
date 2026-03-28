---
id: 007
status: open
depends: [006]
created: 2026-03-28
---

# Polish for demo quality

Make the experience smooth and demo-ready. Fix timing issues, add error handling, ensure cross-browser compatibility.

## What to do

- Fine-tune speech pacing vs drawing speed (speech shouldn't get ahead of visuals)
- Smooth viewport panning/zooming animations when following AI drawing
- Add graceful error handling:
  - API failures → friendly message on canvas
  - Rate limiting → retry with backoff
  - Network issues → offline indicator
- Ensure mute/unmute persists across messages
- Add input length limit to prevent abuse
- Test on Chrome, Firefox, Safari (desktop)
- Ensure the demo can run a 3-5 minute fractions lesson without breaking
- Visual polish: loading spinner, subtle transitions, clean floating UI

## Acceptance criteria

- [ ] Speech timing matches drawing pace naturally
- [ ] Viewport follows AI drawing smoothly
- [ ] API errors show friendly messages (not crashes)
- [ ] Works on Chrome, Firefox, Safari desktop
- [ ] 3-5 minute fractions demo runs without breaking
- [ ] Floating UI (input, mute button) looks clean and minimal
- [ ] No console errors during normal operation

## Files

- Modified: canvas lesson page (polish)
- Modified: command queue (timing refinements)
- Modified: API route (error handling)

## Verify

```bash
cd app && npm run build && npm run typecheck
```
