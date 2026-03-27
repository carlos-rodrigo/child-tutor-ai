---
id: 002
status: open
depends: [001]
created: 2026-03-27
---

# Improve canvas engine and visual primitives

## What to do

- Make the canvas rendering feel more like a teaching board and less like raw boxes
- Improve rendering of highlights, pointers, text, and shape segments
- Add support for richer visual states useful for fractions teaching

## Acceptance criteria

- [ ] Canvas visuals are clearer and more expressive
- [ ] Fractions examples are easier to understand visually
- [ ] Rendering changes do not break the lesson flow

## Files

- app/app/page.tsx
- app/lib/tutor-types.ts

## Verify

```bash
cd app && npm run build
```
