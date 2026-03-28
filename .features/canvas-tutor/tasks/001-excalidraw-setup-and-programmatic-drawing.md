---
id: 001
status: done
depends: []
created: 2026-03-28
---

# Set up Excalidraw and programmatic element creation

Replace the existing custom DOM canvas with a full-page Excalidraw React component. Prove that we can programmatically create elements (rectangles, circles, text, lines, arrows) via `updateScene()`.

## What to do

- Install `@excalidraw/excalidraw` package
- Create a new lesson page with Excalidraw as the full viewport canvas
- Dynamic import Excalidraw to avoid SSR issues and reduce initial bundle
- Get a ref to the Excalidraw API (`excalidrawAPI`)
- Build a utility module that converts simple commands (draw rect, write text, draw arrow, etc.) into proper `ExcalidrawElement` objects
- Add a temporary "Demo" button that creates a rectangle, a text label, and an arrow programmatically
- Verify elements appear on the canvas and are interactive (selectable, movable by child)

## Acceptance criteria

- [ ] Excalidraw renders full-page in the Next.js app
- [ ] Dynamic import — no SSR errors
- [ ] "Demo" button adds a rectangle, text, and arrow to the canvas programmatically
- [ ] Elements are real Excalidraw elements (selectable, editable)
- [ ] No TypeScript errors
- [ ] App builds successfully

## Files

- app/package.json (new dependency)
- New: canvas lesson page component
- New: Excalidraw element factory utility

## Verify

```bash
cd app && npm run build && npm run typecheck
```
