/* ══════════════════════════════════════════════
   Listening Test Constructor — Type Definitions
   Based on TZ specification for IELTS & CEFR
   ══════════════════════════════════════════════ */

/* ── Exam & Format Types ── */
export type ExamType = "IELTS_ACADEMIC" | "IELTS_GENERAL" | "CEFR_MULTI";

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  IELTS_ACADEMIC: "IELTS Academic",
  IELTS_GENERAL: "IELTS General Training",
  CEFR_MULTI: "CEFR Multi-level",
};

export type CEFRLevel = "A2" | "B1" | "B2" | "C1";

/* ── Question Types ── */
export type QuestionType = "MCQ" | "GAP_FILL" | "MATCHING" | "MAP_LABEL";

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: "Multiple Choice",
  GAP_FILL: "Bo'sh joyni to'ldirish",
  MATCHING: "Moslashtirish",
  MAP_LABEL: "Xarita / Diagramma",
};

export const QUESTION_TYPE_ICONS: Record<QuestionType, string> = {
  MCQ: "checklist",
  GAP_FILL: "format_color_text",
  MATCHING: "compare_arrows",
  MAP_LABEL: "map",
};

/* ── MCQ Question ── */
export interface MCQOption {
  id: string;
  label: string; // A, B, C, D
  text: string;
}

export interface MCQQuestion {
  id: string;
  type: "MCQ";
  text: string;
  options: MCQOption[];
  correctAnswer: string; // option label: "A", "B", etc.
  cefrLevel?: CEFRLevel;
}

/* ── Gap Fill Question ── */
export interface GapFillQuestion {
  id: string;
  type: "GAP_FILL";
  /** Text with [1], [2], etc. placeholders */
  text: string;
  /** Correct answers: key=gap number, value=accepted answers (synonyms) */
  answers: Record<number, string[]>;
  cefrLevel?: CEFRLevel;
}

/* ── Matching Question ── */
export interface MatchingItem {
  id: string;
  left: string;
  right: string;
}

export interface MatchingQuestion {
  id: string;
  type: "MATCHING";
  instruction: string;
  items: MatchingItem[];
  cefrLevel?: CEFRLevel;
}

/* ── Map / Diagram Labeling ── */
export interface MapHotspot {
  id: string;
  label: string; // 1, 2, 3... or A, B, C...
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  correctAnswer: string;
}

export interface MapLabelQuestion {
  id: string;
  type: "MAP_LABEL";
  instruction: string;
  imageUrl: string | null;
  imageFile: File | null;
  hotspots: MapHotspot[];
  cefrLevel?: CEFRLevel;
}

/* ── Union type ── */
export type Question = MCQQuestion | GapFillQuestion | MatchingQuestion | MapLabelQuestion;

/* ── Section / Part ── */
export interface Section {
  id: string;
  title: string; // e.g. "Part 1: Questions 1–10"
  instruction: string; // e.g. "Write NO MORE THAN TWO WORDS"
  /** Section-specific image (for maps/diagrams) */
  imageUrl: string | null;
  imageFile: File | null;
  /** CEFR: per-section audio */
  audioUrl: string | null;
  audioFile: File | null;
  audioName: string | null;
  audioDuration: number;
  /** CEFR: per-section play count */
  playLimit: number;
  questions: Question[];
}

/* ── IELTS Band Mapping ── */
export interface BandScoreEntry {
  rawScore: number; // 0–40
  bandScore: number; // 1.0–9.0
}

/* ── General Settings ── */
export interface GeneralSettings {
  examType: ExamType;
  /** Global play limit (IELTS: usually 1) */
  playLimit: number;
  /** Overall test time in minutes */
  timeLimit: number;
  /** IELTS: Raw Score → Band table */
  bandScoreTable: BandScoreEntry[];
  /** Transcript text/file for post-test review */
  transcriptText: string;
}

/* ── Full Listening Exam ── */
export interface ListeningExam {
  settings: GeneralSettings;
  /** Global audio (IELTS uses one audio for all) */
  audioFile: File | null;
  audioUrl: string | null;
  audioName: string | null;
  audioDuration: number;
  sections: Section[];
}

/* ── JSON Export Structure (as per TZ) ── */
export interface ExamJSON {
  exam_type: string;
  audio_url: string;
  time_limit: number;
  play_limit: number;
  sections: {
    section_id: number;
    title: string;
    instructions: string;
    image_url?: string;
    audio_url?: string;
    play_limit?: number;
    questions: {
      id: number;
      type: string;
      text?: string;
      options?: string[];
      answer: string | string[];
      cefr_level?: string;
    }[];
  }[];
  band_score_table?: { raw: number; band: number }[];
  transcript?: string;
}

/* ══════════════════════════════════════════════
   HELPER FUNCTIONS
   ══════════════════════════════════════════════ */

export function uid(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/* ── Factory: Create empty question by type ── */
export function createQuestion(type: QuestionType): Question {
  const id = uid();
  switch (type) {
    case "MCQ":
      return {
        id,
        type: "MCQ",
        text: "",
        options: [
          { id: uid(), label: "A", text: "" },
          { id: uid(), label: "B", text: "" },
          { id: uid(), label: "C", text: "" },
        ],
        correctAnswer: "A",
      };
    case "GAP_FILL":
      return {
        id,
        type: "GAP_FILL",
        text: "",
        answers: {},
      };
    case "MATCHING":
      return {
        id,
        type: "MATCHING",
        instruction: "",
        items: [
          { id: uid(), left: "", right: "" },
          { id: uid(), left: "", right: "" },
          { id: uid(), left: "", right: "" },
        ],
      };
    case "MAP_LABEL":
      return {
        id,
        type: "MAP_LABEL",
        instruction: "",
        imageUrl: null,
        imageFile: null,
        hotspots: [],
      };
  }
}

/* ── Factory: Create empty section ── */
export function createSection(index: number): Section {
  return {
    id: uid(),
    title: `Part ${index + 1}`,
    instruction: "",
    imageUrl: null,
    imageFile: null,
    audioUrl: null,
    audioFile: null,
    audioName: null,
    audioDuration: 0,
    playLimit: 2,
    questions: [],
  };
}

/* ── Default general settings ── */
export function defaultSettings(): GeneralSettings {
  return {
    examType: "IELTS_ACADEMIC",
    playLimit: 1,
    timeLimit: 30,
    bandScoreTable: [],
    transcriptText: "",
  };
}

/* ── Default exam ── */
export function defaultExam(): ListeningExam {
  return {
    settings: defaultSettings(),
    audioFile: null,
    audioUrl: null,
    audioName: null,
    audioDuration: 0,
    sections: [],
  };
}

/* ── Export to JSON (TZ format) ── */
export function examToJSON(exam: ListeningExam): ExamJSON {
  let globalQId = 0;
  return {
    exam_type: exam.settings.examType,
    audio_url: exam.audioName || "",
    time_limit: exam.settings.timeLimit,
    play_limit: exam.settings.playLimit,
    sections: exam.sections.map((sec, si) => ({
      section_id: si + 1,
      title: sec.title,
      instructions: sec.instruction,
      ...(sec.imageUrl ? { image_url: sec.imageUrl } : {}),
      ...(sec.audioUrl ? { audio_url: sec.audioName || "" } : {}),
      ...(sec.playLimit !== exam.settings.playLimit
        ? { play_limit: sec.playLimit }
        : {}),
      questions: sec.questions.map((q) => {
        globalQId++;
        if (q.type === "MCQ") {
          return {
            id: globalQId,
            type: "mcq",
            text: q.text,
            options: q.options.map((o) => o.label),
            answer: q.correctAnswer,
            ...(q.cefrLevel ? { cefr_level: q.cefrLevel } : {}),
          };
        }
        if (q.type === "GAP_FILL") {
          return {
            id: globalQId,
            type: "gap_fill",
            text: q.text,
            answer: Object.values(q.answers).map((a) => a.join("|")),
            ...(q.cefrLevel ? { cefr_level: q.cefrLevel } : {}),
          };
        }
        if (q.type === "MATCHING") {
          return {
            id: globalQId,
            type: "matching",
            text: q.instruction,
            answer: q.items.map((it) => `${it.left}=${it.right}`),
            ...(q.cefrLevel ? { cefr_level: q.cefrLevel } : {}),
          };
        }
        // MAP_LABEL
        return {
          id: globalQId,
          type: "map_label",
          text: q.instruction,
          answer: q.hotspots.map((h) => `${h.label}=${h.correctAnswer}`),
          ...(q.cefrLevel ? { cefr_level: q.cefrLevel } : {}),
        };
      }),
    })),
    ...(exam.settings.bandScoreTable.length > 0
      ? {
          band_score_table: exam.settings.bandScoreTable.map((e) => ({
            raw: e.rawScore,
            band: e.bandScore,
          })),
        }
      : {}),
    ...(exam.settings.transcriptText
      ? { transcript: exam.settings.transcriptText }
      : {}),
  };
}
