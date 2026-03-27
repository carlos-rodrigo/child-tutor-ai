---
id: 001
status: done
depends: []
created: 2026-03-27
---

# Refine visual design direction and lesson shell

## What to do

- Tighten the visual direction so it feels premium, warm, and child-friendly without looking cheap
- Improve the main layout hierarchy around canvas, tutor voice, and answer area
- Keep the experience focused on the lesson instead of dashboard-like cards

## Acceptance criteria

- [x] The lesson shell feels cohesive and product-like
- [x] The canvas is clearly the primary focus
- [x] The tutor voice and answer areas feel integrated into the experience

## Files

- app/app/page.tsx
- app/app/globals.css

## Verify

```bash
cd app && npm run lint && npm run build
```

## Notes

- Test exception (auditable): no dedicated test harness exists in this app yet (`package.json` has no `test` script). Validation was done via lint + production build for this task.
