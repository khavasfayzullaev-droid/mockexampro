/* ══════════════════════════════════════════════
   Reading Test Constructor — Type Definitions
   Based on TZ: IELTS & CEFR Reading Formats
   ══════════════════════════════════════════════ */

export type ReadingExamType = "IELTS_ACADEMIC" | "IELTS_GENERAL" | "CEFR_MULTI";

export const READING_EXAM_LABELS: Record<ReadingExamType, string> = {
  IELTS_ACADEMIC: "IELTS Academic",
  IELTS_GENERAL: "IELTS General Training",
  CEFR_MULTI: "CEFR Multi-level",
};

export type CEFRLevel = "A2" | "B1" | "B2" | "C1";

/* ── Question Types ── */
export type ReadingQuestionType =
  | "MCQ"
  | "MCQ_MULTI"
  | "TFNG"
  | "YNNG"
  | "MATCHING_HEADINGS"
  | "SENTENCE_COMPLETION"
  | "MATCHING_INFO";

export const RQ_LABELS: Record<ReadingQuestionType, string> = {
  MCQ: "Multiple Choice",
  MCQ_MULTI: "Multiple Choice (ko'p javob)",
  TFNG: "True / False / Not Given",
  YNNG: "Yes / No / Not Given",
  MATCHING_HEADINGS: "Matching Headings",
  SENTENCE_COMPLETION: "Sentence Completion",
  MATCHING_INFO: "Matching Information",
};

export const RQ_ICONS: Record<ReadingQuestionType, string> = {
  MCQ: "checklist",
  MCQ_MULTI: "checklist_rtl",
  TFNG: "rule",
  YNNG: "rule",
  MATCHING_HEADINGS: "view_headline",
  SENTENCE_COMPLETION: "format_color_text",
  MATCHING_INFO: "find_in_page",
};

/* ── MCQ (single answer) ── */
export interface ReadingMCQ {
  id: string;
  type: "MCQ";
  text: string;
  options: { id: string; label: string; text: string }[];
  correctAnswer: string;
  cefrLevel?: CEFRLevel;
}

/* ── MCQ (multiple answers) ── */
export interface ReadingMCQMulti {
  id: string;
  type: "MCQ_MULTI";
  text: string;
  options: { id: string; label: string; text: string }[];
  correctAnswers: string[];
  cefrLevel?: CEFRLevel;
}

/* ── True/False/Not Given ── */
export interface ReadingTFNG {
  id: string;
  type: "TFNG";
  text: string;
  correctAnswer: "TRUE" | "FALSE" | "NOT GIVEN";
  cefrLevel?: CEFRLevel;
}

/* ── Yes/No/Not Given ── */
export interface ReadingYNNG {
  id: string;
  type: "YNNG";
  text: string;
  correctAnswer: "YES" | "NO" | "NOT GIVEN";
  cefrLevel?: CEFRLevel;
}

/* ── Matching Headings ── */
export interface MatchingHeadingsQ {
  id: string;
  type: "MATCHING_HEADINGS";
  instruction: string;
  paragraphs: string[]; // A, B, C...
  headings: { id: string; text: string }[];
  /** key=paragraph letter, value=heading id */
  correctMapping: Record<string, string>;
  cefrLevel?: CEFRLevel;
}

/* ── Sentence/Table Completion ── */
export interface SentenceCompletionQ {
  id: string;
  type: "SENTENCE_COMPLETION";
  /** Text with [1], [2] blanks */
  text: string;
  /** key=gap number, value=accepted answers (synonyms) */
  answers: Record<number, string[]>;
  cefrLevel?: CEFRLevel;
}

/* ── Matching Information ── */
export interface MatchingInfoQ {
  id: string;
  type: "MATCHING_INFO";
  instruction: string;
  statements: { id: string; text: string; correctParagraph: string }[];
  cefrLevel?: CEFRLevel;
}

export type ReadingQuestion =
  | ReadingMCQ
  | ReadingMCQMulti
  | ReadingTFNG
  | ReadingYNNG
  | MatchingHeadingsQ
  | SentenceCompletionQ
  | MatchingInfoQ;

/* ── Section / Passage ── */
export interface ReadingSection {
  id: string;
  title: string;
  /** Rich text HTML content */
  content: string;
  /** Image for diagrams/tables */
  imageUrl: string | null;
  imageFile: File | null;
  cefrLevel?: CEFRLevel;
  questions: ReadingQuestion[];
}

/* ── General Settings ── */
export interface ReadingSettings {
  examType: ReadingExamType;
  timeLimit: number;
  highlighterEnabled: boolean;
}

/* ── Full Reading Exam ── */
export interface ReadingExam {
  settings: ReadingSettings;
  sections: ReadingSection[];
}

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */
export function uid(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function createReadingQuestion(type: ReadingQuestionType): ReadingQuestion {
  const id = uid();
  switch (type) {
    case "MCQ":
      return {
        id, type: "MCQ", text: "",
        options: [
          { id: uid(), label: "A", text: "" },
          { id: uid(), label: "B", text: "" },
          { id: uid(), label: "C", text: "" },
        ],
        correctAnswer: "A",
      };
    case "MCQ_MULTI":
      return {
        id, type: "MCQ_MULTI", text: "",
        options: [
          { id: uid(), label: "A", text: "" },
          { id: uid(), label: "B", text: "" },
          { id: uid(), label: "C", text: "" },
          { id: uid(), label: "D", text: "" },
        ],
        correctAnswers: [],
      };
    case "TFNG":
      return { id, type: "TFNG", text: "", correctAnswer: "TRUE" };
    case "YNNG":
      return { id, type: "YNNG", text: "", correctAnswer: "YES" };
    case "MATCHING_HEADINGS":
      return {
        id, type: "MATCHING_HEADINGS", instruction: "",
        paragraphs: ["A", "B", "C"],
        headings: [
          { id: uid(), text: "" },
          { id: uid(), text: "" },
          { id: uid(), text: "" },
        ],
        correctMapping: {},
      };
    case "SENTENCE_COMPLETION":
      return { id, type: "SENTENCE_COMPLETION", text: "", answers: {} };
    case "MATCHING_INFO":
      return {
        id, type: "MATCHING_INFO", instruction: "",
        statements: [
          { id: uid(), text: "", correctParagraph: "" },
          { id: uid(), text: "", correctParagraph: "" },
        ],
      };
  }
}

export function createReadingSection(index: number): ReadingSection {
  return {
    id: uid(),
    title: `Passage ${index + 1}`,
    content: "",
    imageUrl: null,
    imageFile: null,
    questions: [],
  };
}

export function defaultReadingExam(): ReadingExam {
  return {
    settings: {
      examType: "IELTS_ACADEMIC",
      timeLimit: 60,
      highlighterEnabled: true,
    },
    sections: [],
  };
}
