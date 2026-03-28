---
id: 002
status: open
depends: [001]
created: 2026-03-28
---

# Build command queue with progressive reveal and viewport control

Create a command queue that processes canvas commands sequentially with configurable delays, so elements appear one at a time (progressive reveal). Add viewport control to auto-scroll/zoom to where the AI is drawing.

## What to do

- Build a `CanvasCommandQueue` class/hook that:
  - Accepts commands (draw_shape, write_text, draw_arrow, highlight_area, draw_line, clear_canvas, move_viewport)
  - Processes them sequentially with configurable delay between commands (~400-500ms)
  - Calls the Excalidraw element factory from task 001 for each command
  - Updates Excalidraw scene after each command
- Implement viewport control: after adding elements, scroll to keep them visible using `scrollToContent()`
- Update the "Demo" button to use the command queue instead of adding all elements at once
- The demo sequence should feel like watching someone draw step by step

## Acceptance criteria

- [ ] Command queue processes commands one at a time with visible delay
- [ ] Elements appear progressively on the canvas (not all at once)
- [ ] Viewport auto-scrolls to follow new elements
- [ ] Queue can be cleared/reset
- [ ] Delay is configurable
- [ ] Demo button triggers a multi-step sequence that feels animated

## Files

- New: command queue module/hook
- Modified: canvas lesson page (use queue instead of direct element creation)

## Verify

```bash
cd app && npm run build && npm run typecheck
```
