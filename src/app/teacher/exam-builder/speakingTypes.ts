/* ══════════════════════════════════════════════
   Speaking Test Constructor — Type Definitions
   TZ: IELTS 3 Parts, CEFR 3-4 Parts, Audio
   ══════════════════════════════════════════════ */

export type SpeakingExamType = "IELTS" | "CEFR";

export const SPEAKING_EXAM_LABELS: Record<SpeakingExamType, string> = {
  IELTS: "IELTS Speaking",
  CEFR: "CEFR Speaking",
};

/* ── Grading Criteria ── */
export interface SpeakingGradingCriteria {
  FC: number;   // Fluency & Coherence
  LR: number;   // Lexical Resource
  GRA: number;  // Grammatical Range & Accuracy
  PR: number;   // Pronunciation
}

export const SPEAKING_CRITERIA_LABELS: Record<keyof SpeakingGradingCriteria, string> = {
  FC: "Fluency & Coherence (FC)",
  LR: "Lexical Resource (LR)",
  GRA: "Grammatical Range & Accuracy (GRA)",
  PR: "Pronunciation (PR)",
};

export const SPEAKING_CRITERIA_COLORS: Record<keyof SpeakingGradingCriteria, string> = {
  FC: "bg-blue-500",
  LR: "bg-violet-500",
  GRA: "bg-amber-500",
  PR: "bg-emerald-500",
};

/* ── Question ── */
export interface SpeakingQuestion {
  id: string;
  /** Text prompt */
  text: string;
  /** Audio prompt file (teacher reads question) */
  audioUrl: string | null;
  audioFile: File | null;
  audioName: string | null;
  /** Follow-up questions (IELTS Part 3 style) */
  followUps: string[];
}

/* ── Part ── */
export interface SpeakingPart {
  id: string;
  title: string;
  instruction: string;
  /** Image for cue card (IELTS Part 2) */
  imageUrl: string | null;
  imageFile: File | null;
  /** Preparation time in seconds */
  prepTime: number;
  /** Response time in seconds */
  responseTime: number;
  /** Is this a cue card / long turn part? */
  isCueCard: boolean;
  /** Cue card bullet points (IELTS Part 2) */
  cueCardPoints: string[];
  questions: SpeakingQuestion[];
}

/* ── Full Speaking Exam ── */
export interface SpeakingExam {
  examType: SpeakingExamType;
  /** Mic check enabled */
  micCheckEnabled: boolean;
  /** Allow playback (usually false for real exams) */
  allowPlayback: boolean;
  parts: SpeakingPart[];
}

/* ── Helpers ── */
export function uid(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function createSpeakingQuestion(): SpeakingQuestion {
  return {
    id: uid(),
    text: "",
    audioUrl: null,
    audioFile: null,
    audioName: null,
    followUps: [],
  };
}

export function createSpeakingPart(index: number, examType: SpeakingExamType): SpeakingPart {
  // IELTS defaults
  const ieltsDefaults: Record<number, { title: string; prep: number; resp: number; cue: boolean }> = {
    0: { title: "Part 1: Introduction & Interview", prep: 0, resp: 30, cue: false },
    1: { title: "Part 2: Long Turn (Cue Card)", prep: 60, resp: 120, cue: true },
    2: { title: "Part 3: Discussion", prep: 0, resp: 60, cue: false },
  };

  const d = examType === "IELTS" && ieltsDefaults[index]
    ? ieltsDefaults[index]
    : { title: `Part ${index + 1}`, prep: 30, resp: 60, cue: false };

  return {
    id: uid(),
    title: d.title,
    instruction: "",
    imageUrl: null,
    imageFile: null,
    prepTime: d.prep,
    responseTime: d.resp,
    isCueCard: d.cue,
    cueCardPoints: d.cue ? ["", "", "", ""] : [],
    questions: [createSpeakingQuestion()],
  };
}

export function defaultSpeakingExam(): SpeakingExam {
  return {
    examType: "IELTS",
    micCheckEnabled: true,
    allowPlayback: false,
    parts: [],
  };
}

/** Create IELTS standard 3-part exam */
export function createIELTSSpeaking(): SpeakingPart[] {
  return [0, 1, 2].map((i) => createSpeakingPart(i, "IELTS"));
}

export function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} soniya`;
  if (s === 0) return `${m} daqiqa`;
  return `${m} daq ${s} son`;
}
