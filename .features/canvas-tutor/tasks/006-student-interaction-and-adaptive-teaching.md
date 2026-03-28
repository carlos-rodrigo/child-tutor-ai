---
id: 006
status: open
depends: [005]
created: 2026-03-28
---

# Enable student interaction and adaptive teaching

Let the child interact beyond typing — the AI can ask questions and respond adaptively. When the child doesn't understand or answers wrong, the AI tries a different visual approach. Support topic switching.

## What to do

- When the AI asks a question, make it clear in the UI (e.g., highlight the input, show a prompt)
- Send the child's text responses as new messages in the conversation
- Optionally: capture child's canvas drawings (text elements, freehand) and include as context for the AI
- Update system prompt to instruct the AI to:
  - Ask checking questions periodically
  - Try different visual strategies when the child is confused
  - Handle topic switches gracefully
  - Position new content in fresh canvas areas (not overlapping)
- Simplify the child's Excalidraw toolbar to: freehand, text, eraser only
- When switching topics, pan the viewport to a fresh area

## Acceptance criteria

- [ ] AI asks questions and the child can respond via text
- [ ] Wrong answers or "I don't get it" trigger alternative visual explanations
- [ ] Topic switches work ("now teach me multiplication")
- [ ] New topics draw in fresh canvas areas
- [ ] Child has simplified toolbar (freehand, text, eraser)
- [ ] Previous drawings remain accessible by scrolling

## Files

- Modified: canvas lesson page (toolbar config, interaction flow)
- Modified: system prompt (adaptive teaching instructions)

## Verify

```bash
cd app && npm run build && npm run typecheck
```
