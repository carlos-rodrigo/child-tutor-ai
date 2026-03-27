# PRD: Child Tutor AI

## 1. Overview

Child Tutor AI is a voice-first educational experience for children where a tutor teaches on a live interactive canvas. Instead of relying on a text chat interface, the system speaks, draws, highlights, and guides the child through a short lesson.

The MVP focuses on a single high-value learning experience: a 3–5 minute fractions lesson for primary-school children. The goal is to validate whether voice + visual explanation + lightweight interaction creates a more intuitive and engaging way to review school concepts.

## 2. Goals

- Create a learning experience that feels closer to a tutor with a whiteboard than a chatbot.
- Help children understand fractions using visual explanation.
- Deliver a short, complete lesson loop: explain, demonstrate, ask, correct, close.
- Keep the experience warm, playful, and non-intimidating.
- Validate that the canvas-first interaction is compelling before building a broader platform.

## 3. Target Users

Primary users:
- Children in primary school (broadly ages 6–12)
- Strongest initial fit likely in the middle of that range

Secondary stakeholders:
- Parents evaluating the usefulness of the experience
- Potentially teachers later, but not part of MVP

## 4. MVP Scope

The MVP includes:
- A single lesson topic: **fractions**
- A single session lasting approximately **3–5 minutes**
- Voice output from the tutor
- A large central interactive canvas
- Visual explanation using shapes, labels, highlighting, and step-by-step drawing
- Child input through **voice and buttons**
- Immediate correction and encouragement
- A simple session completion moment

The MVP does **not** include:
- Multiple subjects
- User accounts
- Persistent progress tracking
- Teacher dashboards
- Open-ended AI lesson generation across arbitrary topics

## 5. Product Principles

- **Canvas-first:** the lesson lives on the board, not in a chat bubble.
- **Voice-first:** the tutor explains naturally and warmly.
- **Short sessions:** each lesson should be compact and focused.
- **Pedagogically visual:** if something can be shown, it should be shown.
- **Child-friendly tone:** encouraging, clear, calm, and playful.

## 6. User Stories

### US-001: Start a fractions lesson

**Description:** As a child, I want to start a lesson quickly so I can begin learning without setup friction.

**BDD Spec:**
- Given: I am on the home screen
- When: I choose to start a fractions lesson
- Then: The lesson begins immediately with tutor voice and canvas activity

**Acceptance Criteria:**
- [ ] User can start the lesson in one obvious action
- [ ] The screen transitions directly into the tutoring session
- [ ] Tutor begins with a spoken introduction

### US-002: See visual explanation on a canvas

**Description:** As a child, I want the tutor to draw examples so I can understand fractions visually.

**BDD Spec:**
- Given: The lesson is in progress
- When: The tutor introduces a concept
- Then: The system draws and labels shapes on the canvas to support the explanation

**Acceptance Criteria:**
- [ ] Tutor can draw simple shapes on the canvas
- [ ] Tutor can divide shapes into equal parts
- [ ] Tutor can highlight filled segments
- [ ] Tutor can write labels such as 1/2 or 1/4 on the board

### US-003: Answer simple tutor questions

**Description:** As a child, I want to answer questions with voice or buttons so the lesson feels interactive.

**BDD Spec:**
- Given: The tutor asks a question during the lesson
- When: I answer using voice or a button
- Then: The tutor reacts and continues the lesson flow

**Acceptance Criteria:**
- [ ] Lesson presents at least one interactive question
- [ ] Child can answer with a button-based option in MVP
- [ ] Voice input path can exist as a lightweight beta path, even if partially mocked
- [ ] System can identify correct vs incorrect choices in the guided flow

### US-004: Receive supportive correction

**Description:** As a child, I want the tutor to correct me kindly so I feel safe continuing when I make mistakes.

**BDD Spec:**
- Given: I answered incorrectly
- When: The system evaluates my answer
- Then: The tutor explains again and shows a clearer visual example

**Acceptance Criteria:**
- [ ] Incorrect answers trigger a calm, encouraging correction
- [ ] The correction includes a visual explanation on the canvas
- [ ] The lesson continues instead of ending abruptly

### US-005: Finish with a sense of progress

**Description:** As a child, I want the lesson to end clearly so I know what I just learned.

**BDD Spec:**
- Given: The lesson has reached its final step
- When: The session ends
- Then: The tutor summarizes what was covered and offers a positive close

**Acceptance Criteria:**
- [ ] Lesson has a clear end state
- [ ] Tutor gives a short summary of what was learned
- [ ] UI signals completion in a warm, celebratory but not overwhelming way

## 7. Functional Requirements

- FR-1: The system must present a fractions lesson as the initial MVP experience.
- FR-2: The tutor must speak during the lesson.
- FR-3: The tutor must be able to trigger drawing operations on a canvas.
- FR-4: The canvas must support basic primitives sufficient for fractions teaching.
- FR-5: The lesson must include at least one question and one correction path.
- FR-6: The child must be able to respond through buttons in the MVP.
- FR-7: The UI must support a voice-first interaction model without requiring text input.
- FR-8: The experience must fit into a 3–5 minute session.

## 8. Canvas Primitives for MVP

The MVP should support a small controlled set of visual actions:
- Clear canvas
- Draw rectangle
- Draw circle
- Split shape into equal parts
- Fill one or more parts
- Add text label
- Highlight a region
- Show pointer / emphasis marker
- Erase or reset

These primitives are sufficient to teach fractions without requiring unrestricted drawing.

## 9. Lesson Flow for MVP

### Suggested structure
1. Welcome
2. Explain what a fraction is
3. Show one-half visually
4. Show a second example (e.g. quarters)
5. Ask a question
6. Evaluate answer
7. Correct or reinforce
8. Close with summary

## 10. Design Considerations

- The interface should feel warm, playful, and safe for children.
- The canvas should dominate the layout.
- Controls should be large and obvious.
- Voice should feel patient and encouraging, not robotic or formal.
- The experience should avoid clutter and keep the child focused on one thing at a time.

## 11. Technical Considerations

- MVP can be implemented as a guided scripted lesson rather than a fully open AI teaching system.
- Voice output can be real TTS or temporarily mocked for the first demo.
- Voice input may be partially mocked or optional if reliability is poor.
- The lesson engine should use structured steps rather than free-form rendering.
- Future versions may convert tutor decisions into structured canvas actions.

## 12. Success Metrics

- A child can complete the lesson in 3–5 minutes.
- The demo feels meaningfully different from a text chatbot.
- The child can identify at least one fraction concept by the end of the session.
- Adults observing the demo understand the value of voice + canvas immediately.

## 13. Non-Goals

- No broad curriculum coverage in the MVP
- No parent dashboard
- No teacher tools
- No persistent student memory
- No fully autonomous pedagogy engine
- No multiplayer or classroom mode

## 14. Open Questions

- Should the tutor have a visible character/avatar in the MVP?
- Should the child respond by touching the canvas directly as well as pressing buttons?
- How much of the voice input should be real vs mocked in the first demo?
- Should the first example use rectangles only, or include circles/pizza metaphors too?
