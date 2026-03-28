---
id: 003
status: open
depends: [002]
created: 2026-03-28
---

# Add voice narration synchronized with canvas drawing

Integrate browser SpeechSynthesis with the command queue so the tutor narrates as it draws. Speech chunks should play at the right time relative to drawing commands.

## What to do

- Extend the command queue to support a `speak` command type alongside drawing commands
- When a `speak` command is dequeued, trigger `SpeechSynthesisUtterance` with the text
- Wait for speech to finish (or a reasonable timeout) before processing next command
- Add a mute/unmute floating button on the canvas
- Update the demo sequence to interleave speech and drawing:
  1. Speak: "Let's learn about fractions!"
  2. Draw: rectangle
  3. Speak: "See this rectangle? I'm splitting it in half."
  4. Draw: dividing line
  5. Draw: fill left half
  6. Speak: "The colored part is one half."
  7. Draw: text label "1/2"
- Speech should feel natural — not too fast, child-friendly rate/pitch

## Acceptance criteria

- [ ] Speech plays synchronized with drawing steps
- [ ] Queue waits for speech to finish before next command
- [ ] Mute/unmute button works
- [ ] Demo sequence tells a coherent fractions story with voice + visuals
- [ ] Speech rate and pitch are child-friendly
- [ ] No overlapping speech utterances

## Files

- Modified: command queue (add speak command type)
- Modified: canvas lesson page (mute button, updated demo)

## Verify

```bash
cd app && npm run build && npm run typecheck
```
