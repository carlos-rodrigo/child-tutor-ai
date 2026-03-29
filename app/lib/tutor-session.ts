export type InteractionMode =
  | "child_question"
  | "child_answer"
  | "child_confused"
  | "topic_switch";

export interface StudentTurnAnalysis {
  interactionMode: InteractionMode;
  nextTopic: string | null;
  useFreshBoardArea: boolean;
}

export interface BoardArea {
  x: number;
  y: number;
  zoom: number;
}

interface ClassifyStudentTurnOptions {
  prompt: string;
  awaitingStudentReply: boolean;
  activeTopic: string | null;
}

const BOARD_AREA_SPACING_X = 1600;
const DEFAULT_BOARD_AREA_ZOOM = 0.35;
const CONFUSION_PATTERNS = [
  /\bi do not get it\b/i,
  /\bi don't get it\b/i,
  /\bi am confused\b/i,
  /\bi'm confused\b/i,
  /\bstill confused\b/i,
  /\bdon't understand\b/i,
  /\btoo hard\b/i,
  /\bhelp me\b/i,
];
const SWITCH_PATTERNS = [/\bnow\b/i, /\binstead\b/i, /\bswitch\b/i, /\bchange\b/i];
const KNOWN_TOPICS = [
  "fractions",
  "multiplication",
  "division",
  "addition",
  "subtraction",
  "decimals",
  "place value",
];

export function shouldAwaitStudentReply(text: string) {
  return /\?\s*["')\]]*\s*$/.test(text.trim());
}

export function createBoardArea(index: number): BoardArea {
  return {
    x: BOARD_AREA_SPACING_X * Math.max(index, 0),
    y: 0,
    zoom: DEFAULT_BOARD_AREA_ZOOM,
  };
}

export function classifyStudentTurn({
  prompt,
  awaitingStudentReply,
  activeTopic,
}: ClassifyStudentTurnOptions): StudentTurnAnalysis {
  const normalizedPrompt = prompt.trim();
  const requestedTopic = extractTopic(normalizedPrompt);

  if (isConfusionPrompt(normalizedPrompt)) {
    return {
      interactionMode: "child_confused",
      nextTopic: activeTopic,
      useFreshBoardArea: true,
    };
  }

  if (requestedTopic && isTopicSwitch(normalizedPrompt, requestedTopic, activeTopic)) {
    return {
      interactionMode: "topic_switch",
      nextTopic: requestedTopic,
      useFreshBoardArea: true,
    };
  }

  if (awaitingStudentReply) {
    return {
      interactionMode: "child_answer",
      nextTopic: activeTopic,
      useFreshBoardArea: false,
    };
  }

  return {
    interactionMode: "child_question",
    nextTopic: requestedTopic ?? activeTopic,
    useFreshBoardArea: false,
  };
}

function isConfusionPrompt(prompt: string) {
  return CONFUSION_PATTERNS.some((pattern) => pattern.test(prompt));
}

function isTopicSwitch(
  prompt: string,
  requestedTopic: string,
  activeTopic: string | null
) {
  if (!activeTopic) {
    return false;
  }

  if (requestedTopic !== activeTopic) {
    return true;
  }

  return SWITCH_PATTERNS.some((pattern) => pattern.test(prompt));
}

function extractTopic(prompt: string) {
  const normalized = prompt.toLowerCase();

  for (const topic of KNOWN_TOPICS) {
    if (normalized.includes(topic)) {
      return topic;
    }
  }

  const teachMatch = normalized.match(/teach me ([a-z ]+)/i);
  if (teachMatch?.[1]) {
    return teachMatch[1].trim();
  }

  return null;
}
