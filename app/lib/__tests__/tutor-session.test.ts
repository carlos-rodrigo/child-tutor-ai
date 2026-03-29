import { describe, expect, it } from "vitest";

import {
  classifyStudentTurn,
  createBoardArea,
  shouldAwaitStudentReply,
} from "../tutor-session";

describe("shouldAwaitStudentReply", () => {
  it("returns true when the tutor ends with a checking question", () => {
    expect(shouldAwaitStudentReply("Great job. Which part is one half? ")).toBe(true);
  });

  it("returns false for explanation-only tutor turns", () => {
    expect(shouldAwaitStudentReply("The blue part is one half.")).toBe(false);
  });

  it("still detects a question when closing punctuation follows the question mark", () => {
    expect(shouldAwaitStudentReply('Can you point to one half?"')).toBe(true);
  });
});

describe("createBoardArea", () => {
  it("spaces new teaching areas horizontally across the canvas", () => {
    expect(createBoardArea(0)).toEqual({ x: 0, y: 0, zoom: 0.35 });
    expect(createBoardArea(1)).toEqual({ x: 1600, y: 0, zoom: 0.35 });
    expect(createBoardArea(2)).toEqual({ x: 3200, y: 0, zoom: 0.35 });
  });
});

describe("classifyStudentTurn", () => {
  it("marks explicit confusion as a re-explanation that needs a fresh board area", () => {
    expect(
      classifyStudentTurn({
        prompt: "I don't get it yet",
        awaitingStudentReply: true,
        activeTopic: "fractions",
      })
    ).toMatchObject({
      interactionMode: "child_confused",
      nextTopic: "fractions",
      useFreshBoardArea: true,
    });
  });

  it("detects a topic switch and extracts the requested topic", () => {
    expect(
      classifyStudentTurn({
        prompt: "Now teach me multiplication instead",
        awaitingStudentReply: false,
        activeTopic: "fractions",
      })
    ).toMatchObject({
      interactionMode: "topic_switch",
      nextTopic: "multiplication",
      useFreshBoardArea: true,
    });
  });

  it("treats follow-up text as an answer when the tutor was waiting on the child", () => {
    expect(
      classifyStudentTurn({
        prompt: "I think it is the left side",
        awaitingStudentReply: true,
        activeTopic: "fractions",
      })
    ).toMatchObject({
      interactionMode: "child_answer",
      nextTopic: "fractions",
      useFreshBoardArea: false,
    });
  });

  it("treats a first request as a new tutoring question without forcing a topic switch", () => {
    expect(
      classifyStudentTurn({
        prompt: "Teach me division",
        awaitingStudentReply: false,
        activeTopic: null,
      })
    ).toMatchObject({
      interactionMode: "child_question",
      nextTopic: "division",
      useFreshBoardArea: false,
    });
  });
});
