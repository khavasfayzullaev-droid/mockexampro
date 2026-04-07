/* ══════════════════════════════════════════════
   Writing Test Constructor — Type Definitions
   TZ: IELTS Task 1/2, CEFR Part 1/2, Grading
   ══════════════════════════════════════════════ */

export type WritingExamType = "IELTS_ACADEMIC" | "IELTS_GENERAL" | "CEFR";

export const WRITING_EXAM_LABELS: Record<WritingExamType, string> = {
  IELTS_ACADEMIC: "IELTS Academic",
  IELTS_GENERAL: "IELTS General Training",
  CEFR: "CEFR",
};

export type WritingTaskType =
  | "IELTS_TASK_1_ACADEMIC"
  | "IELTS_TASK_1_GENERAL"
  | "IELTS_TASK_2"
  | "CEFR_PART_1"
  | "CEFR_PART_2";

export const TASK_TYPE_LABELS: Record<WritingTaskType, string> = {
  IELTS_TASK_1_ACADEMIC: "Task 1 — Academic (Grafik tahlili)",
  IELTS_TASK_1_GENERAL: "Task 1 — General (Xat yozish)",
  IELTS_TASK_2: "Task 2 — Essay",
  CEFR_PART_1: "Part 1 — Email / Xat",
  CEFR_PART_2: "Part 2 — Essay / Maqola",
};

export const TASK_TYPE_ICONS: Record<WritingTaskType, string> = {
  IELTS_TASK_1_ACADEMIC: "bar_chart",
  IELTS_TASK_1_GENERAL: "mail",
  IELTS_TASK_2: "edit_note",
  CEFR_PART_1: "mail",
  CEFR_PART_2: "edit_note",
};

/* ── Grading Criteria ── */
export interface GradingCriteria {
  TR: number;  // Task Response
  CC: number;  // Coherence & Cohesion
  LR: number;  // Lexical Resource
  GRA: number; // Grammatical Range & Accuracy
}

export const CRITERIA_LABELS: Record<keyof GradingCriteria, string> = {
  TR: "Task Response (TR)",
  CC: "Coherence & Cohesion (CC)",
  LR: "Lexical Resource (LR)",
  GRA: "Grammatical Range & Accuracy (GRA)",
};

export const CRITERIA_COLORS: Record<keyof GradingCriteria, string> = {
  TR: "bg-blue-500",
  CC: "bg-emerald-500",
  LR: "bg-violet-500",
  GRA: "bg-amber-500",
};

/* ── Writing Task ── */
export interface WritingTask {
  id: string;
  taskType: WritingTaskType;
  /** Rich text prompt */
  prompt: string;
  /** Image for Task 1 (graph/chart/map) */
  imageUrl: string | null;
  imageFile: File | null;
  /** Word limits */
  minWords: number;
  maxWords: number;
  /** Time in minutes (per task) */
  timeLimit: number;
  /** Sample answer (for teacher reference) */
  sampleAnswer: string;
  /** Grading rubric notes */
  gradingNotes: string;
}

/* ── Full Writing Exam ── */
export interface WritingExam {
  examType: WritingExamType;
  /** Overall time, or 0 if per-task */
  overallTimeLimit: number;
  tasks: WritingTask[];
}

/* ── Helpers ── */
export function uid(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function createWritingTask(taskType: WritingTaskType): WritingTask {
  const defaults: Record<WritingTaskType, { min: number; max: number; time: number }> = {
    IELTS_TASK_1_ACADEMIC: { min: 150, max: 200, time: 20 },
    IELTS_TASK_1_GENERAL: { min: 150, max: 200, time: 20 },
    IELTS_TASK_2: { min: 250, max: 350, time: 40 },
    CEFR_PART_1: { min: 100, max: 150, time: 25 },
    CEFR_PART_2: { min: 200, max: 300, time: 35 },
  };
  const d = defaults[taskType];
  return {
    id: uid(),
    taskType,
    prompt: "",
    imageUrl: null,
    imageFile: null,
    minWords: d.min,
    maxWords: d.max,
    timeLimit: d.time,
    sampleAnswer: "",
    gradingNotes: "",
  };
}

export function defaultWritingExam(): WritingExam {
  return {
    examType: "IELTS_ACADEMIC",
    overallTimeLimit: 60,
    tasks: [],
  };
}

export function getTaskTypesForExam(examType: WritingExamType): WritingTaskType[] {
  switch (examType) {
    case "IELTS_ACADEMIC":
      return ["IELTS_TASK_1_ACADEMIC", "IELTS_TASK_2"];
    case "IELTS_GENERAL":
      return ["IELTS_TASK_1_GENERAL", "IELTS_TASK_2"];
    case "CEFR":
      return ["CEFR_PART_1", "CEFR_PART_2"];
  }
}
