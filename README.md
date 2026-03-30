# Child Tutor AI

A voice-first learning experience for children where a tutor teaches on a live canvas.

## Concept

Child Tutor AI helps kids review school topics through:
- voice guidance
- visual explanation on a canvas
- short interactive sessions
- simple exercises with immediate feedback

The first MVP focuses on **primary school fractions** and a **3–5 minute guided lesson**.

## Core idea

This is not a chat app.
It is a **tutor that talks and draws**.

## Initial documents

- `prd.md` — product requirements
- `design.md` — technical design

## Development

The actual Next.js app lives in `app/`.

Run commands from there:

```bash
cd app
npm install
npm run dev
npm run build
```

## Vercel deployment

In Vercel project settings, set:

- **Root Directory:** `app`
- **Framework Preset:** `Next.js`
- **Output Directory:** leave empty / default

Do not deploy this repo from the repository root. The production app is the `app/` folder.
