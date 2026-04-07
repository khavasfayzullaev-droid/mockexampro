"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  WritingExam,
  WritingTask,
  WritingTaskType,
  WritingExamType,
  GradingCriteria,
  WRITING_EXAM_LABELS,
  TASK_TYPE_LABELS,
  TASK_TYPE_ICONS,
  CRITERIA_LABELS,
  CRITERIA_COLORS,
  uid,
  createWritingTask,
  defaultWritingExam,
  getTaskTypesForExam,
} from "./writingTypes";

const STORAGE_KEY = "writing_exam_v2";

function saveDraft(exam: WritingExam) {
  try {
    const s = {
      ...exam,
      tasks: exam.tasks.map((t) => ({ ...t, imageFile: null })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

function loadDraft(): Partial<WritingExam> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

/* ══════════════════════════════════════════════
   STEP BAR
   ══════════════════════════════════════════════ */
const STEPS = [
  { label: "Umumiy sozlamalar", icon: "settings" },
  { label: "Topshiriqlar yaratish", icon: "edit_note" },
  { label: "Baholash sozlamalari", icon: "grading" },
];

function StepBar({ current, onStep }: { current: number; onStep: (s: number) => void }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <React.Fragment key={i}>
          <button
            onClick={() => onStep(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              i === current
                ? "bg-primary text-white shadow-md"
                : i < current
                ? "bg-primary/10 text-primary"
                : "bg-surface-container-high text-outline"
            }`}
          >
            <span className="material-symbols-outlined text-lg">{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
          {i < STEPS.length - 1 && (
            <div className={`h-[2px] w-8 ${i < current ? "bg-primary" : "bg-outline-variant/30"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MINI RICH TEXT EDITOR
   ══════════════════════════════════════════════ */
function MiniRTE({ content, onChange, placeholder }: { content: string; onChange: (h: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const init = useRef(true);

  useEffect(() => {
    if (init.current && ref.current) {
      ref.current.innerHTML = content;
      init.current = false;
    }
  }, [content]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
  };

  return (
    <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-high border-b border-outline-variant/20">
        <button onClick={() => exec("bold")} className="p-1 rounded hover:bg-surface-container-highest transition-all">
          <span className="material-symbols-outlined text-base">{"format_bold"}</span>
        </button>
        <button onClick={() => exec("italic")} className="p-1 rounded hover:bg-surface-container-highest transition-all">
          <span className="material-symbols-outlined text-base">{"format_italic"}</span>
        </button>
        <button onClick={() => exec("underline")} className="p-1 rounded hover:bg-surface-container-highest transition-all">
          <span className="material-symbols-outlined text-base">{"format_underlined"}</span>
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        className="p-4 min-h-[120px] outline-none text-sm leading-relaxed"
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}

/* ══════════════════════════════════════════════
   STEP 1: GENERAL SETTINGS
   ══════════════════════════════════════════════ */
function WStep1({
  exam,
  setExam,
  onNext,
}: {
  exam: WritingExam;
  setExam: React.Dispatch<React.SetStateAction<WritingExam>>;
  onNext: () => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Exam Type */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Imtihon turi"}</h3>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(WRITING_EXAM_LABELS) as WritingExamType[]).map((t) => (
              <button
                key={t}
                onClick={() => setExam((p) => ({ ...p, examType: t, tasks: [] }))}
                className={`p-4 rounded-xl text-sm font-bold transition-all text-center ${
                  exam.examType === t
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                {WRITING_EXAM_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Time */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Umumiy vaqt"}</h3>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={1}
              value={exam.overallTimeLimit}
              onChange={(e) => setExam((p) => ({ ...p, overallTimeLimit: Number(e.target.value) || 1 }))}
              className="w-32 bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm font-bold outline-none focus:bg-surface-container-lowest transition-all"
            />
            <span className="text-sm text-on-surface-variant font-semibold">{"daqiqa"}</span>
            <span className="text-xs text-outline ml-auto">{"IELTS: 60 daq standart"}</span>
          </div>
        </div>

        {/* Available task types info */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Mavjud topshiriq turlari"}</h3>
          <div className="grid grid-cols-2 gap-3">
            {getTaskTypesForExam(exam.examType).map((tt) => (
              <div key={tt} className="p-4 bg-surface-container-high rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">{TASK_TYPE_ICONS[tt]}</span>
                <span className="text-sm font-semibold">{TASK_TYPE_LABELS[tt]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="col-span-12 lg:col-span-4">
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <h3 className="font-headline font-extrabold text-lg mb-4">{"Xulosa"}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Turi:"}</span>
                <span className="font-bold">{WRITING_EXAM_LABELS[exam.examType]}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Vaqt:"}</span>
                <span className="font-bold">{exam.overallTimeLimit + " daq"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Topshiriqlar:"}</span>
                <span className="font-bold">{exam.tasks.length + " ta"}</span>
              </div>
            </div>
          </div>
          <button onClick={onNext} className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2">
            {"Keyingi"}<span className="material-symbols-outlined">{"arrow_forward"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STEP 2: TASK BUILDER
   ══════════════════════════════════════════════ */
function WStep2({
  exam,
  setExam,
  onNext,
  onBack,
}: {
  exam: WritingExam;
  setExam: React.Dispatch<React.SetStateAction<WritingExam>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const [activeTask, setActiveTask] = useState(0);
  const availableTypes = getTaskTypesForExam(exam.examType);

  const updateTask = (idx: number, patch: Partial<WritingTask>) =>
    setExam((p) => ({
      ...p,
      tasks: p.tasks.map((t, i) => (i === idx ? { ...t, ...patch } : t)),
    }));

  const deleteTask = (idx: number) => {
    setExam((p) => ({ ...p, tasks: p.tasks.filter((_, i) => i !== idx) }));
    if (activeTask > 0 && activeTask >= exam.tasks.length - 1) setActiveTask(activeTask - 1);
  };

  const addTask = (type: WritingTaskType) => {
    setExam((p) => ({ ...p, tasks: [...p.tasks, createWritingTask(type)] }));
    setActiveTask(exam.tasks.length);
  };

  const handleImage = (file: File) => {
    const url = URL.createObjectURL(file);
    updateTask(activeTask, { imageFile: file, imageUrl: url });
  };

  const task = exam.tasks[activeTask];
  const isTask1 = task && (task.taskType === "IELTS_TASK_1_ACADEMIC" || task.taskType === "IELTS_TASK_1_GENERAL");

  return (
    <div className="space-y-6">
      {/* Task Tabs + Add */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-wrap">
        {exam.tasks.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActiveTask(i)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              i === activeTask
                ? "bg-primary text-white shadow-md"
                : "bg-surface-container-high text-on-surface hover:bg-surface-dim"
            }`}
          >
            <span className="material-symbols-outlined text-base mr-1 align-middle">{TASK_TYPE_ICONS[t.taskType]}</span>
            {TASK_TYPE_LABELS[t.taskType]}
          </button>
        ))}
        {/* Add task buttons */}
        {availableTypes.map((tt) => (
          <button
            key={tt}
            onClick={() => addTask(tt)}
            className="px-3 py-2.5 rounded-xl text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">{"add"}</span>
            {TASK_TYPE_LABELS[tt].split("—")[0]}
          </button>
        ))}
      </div>

      {task ? (
        <div className="grid grid-cols-12 gap-8">
          {/* Left: Task Editor */}
          <div className="col-span-12 lg:col-span-8 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-primary/10 text-primary rounded-xl">
                  <span className="material-symbols-outlined">{TASK_TYPE_ICONS[task.taskType]}</span>
                </span>
                <div>
                  <h3 className="font-bold text-lg">{TASK_TYPE_LABELS[task.taskType]}</h3>
                  <p className="text-[10px] text-outline uppercase tracking-widest">{"Topshiriq muharriri"}</p>
                </div>
              </div>
              <button onClick={() => deleteTask(activeTask)} className="p-2 text-outline hover:text-error rounded-lg transition-all">
                <span className="material-symbols-outlined">{"delete"}</span>
              </button>
            </div>

            {/* Prompt Editor */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
              <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-3">{"Topshiriq matni"}</h4>
              <MiniRTE
                content={task.prompt}
                onChange={(html) => updateTask(activeTask, { prompt: html })}
                placeholder="Topshiriq matnini kiriting..."
              />
            </div>

            {/* Image Upload (Task 1) */}
            {isTask1 && (
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
                <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-3">{"Grafik / Diagramma / Xarita"}</h4>
                {task.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden bg-slate-50">
                    <img src={task.imageUrl} alt="Task visual" className="w-full max-h-80 object-contain" />
                    <button
                      onClick={() => {
                        if (task.imageUrl) URL.revokeObjectURL(task.imageUrl);
                        updateTask(activeTask, { imageUrl: null, imageFile: null });
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-error shadow"
                    >
                      <span className="material-symbols-outlined text-sm">{"close"}</span>
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-outline-variant/40 rounded-2xl p-10 text-center cursor-pointer hover:border-primary/50 transition-all group">
                    <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-primary text-2xl">{"bar_chart"}</span>
                    </div>
                    <p className="font-semibold text-sm">{"Rasm yuklang"}</p>
                    <p className="text-xs text-outline mt-1">{"JPEG, PNG format"}</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
                  </label>
                )}
              </div>
            )}

            {/* Word Limit & Timer */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
              <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Parametrlar"}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{"Min so'z"}</label>
                  <input type="number" min={1} value={task.minWords} onChange={(e) => updateTask(activeTask, { minWords: Number(e.target.value) || 1 })} className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{"Maks so'z"}</label>
                  <input type="number" min={1} value={task.maxWords} onChange={(e) => updateTask(activeTask, { maxWords: Number(e.target.value) || 1 })} className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{"Vaqt (daq)"}</label>
                  <input type="number" min={1} value={task.timeLimit} onChange={(e) => updateTask(activeTask, { timeLimit: Number(e.target.value) || 1 })} className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm font-bold outline-none" />
                </div>
              </div>
            </div>

            {/* Sample Answer */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
              <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-3">{"Namuna javob (ixtiyoriy)"}</h4>
              <textarea
                value={task.sampleAnswer}
                onChange={(e) => updateTask(activeTask, { sampleAnswer: e.target.value })}
                placeholder="Ustoz uchun ideal javob namunasi..."
                className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm min-h-[100px] outline-none resize-none focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right: Student Preview */}
          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-surface-container-high px-4 py-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{"O'quvchi ko'rinishi"}</span>
                  <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">{"Preview"}</span>
                </div>
                <div className="p-5 space-y-4">
                  {/* Timer preview */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                    <span className="material-symbols-outlined text-emerald-600 text-lg">{"timer"}</span>
                    <span className="text-sm font-bold text-emerald-700">{task.timeLimit + ":00"}</span>
                    <div className="w-24 h-2 bg-white rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
                    </div>
                  </div>

                  {/* Split screen simulate */}
                  <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
                    <div className="p-3 bg-surface-container-low/50">
                      <p className="text-[10px] font-bold text-outline uppercase mb-2">{"Topshiriq"}</p>
                      <div className="text-xs leading-relaxed opacity-70 max-h-24 overflow-hidden" dangerouslySetInnerHTML={{ __html: task.prompt || "<em>Matn kiritilmagan...</em>" }} />
                      {task.imageUrl && <img src={task.imageUrl} alt="" className="w-full h-16 object-cover rounded mt-2 opacity-70" />}
                    </div>
                    <div className="p-3 border-t border-outline-variant/20">
                      <p className="text-[10px] font-bold text-outline uppercase mb-2">{"Javob yozish maydoni"}</p>
                      <div className="h-20 bg-surface-container-high rounded-lg flex items-center justify-center">
                        <span className="text-[10px] text-outline">{"O'quvchi bu yerga yozadi"}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-outline">{"0 / " + task.minWords + "–" + task.maxWords + " so'z"}</span>
                        <span className="text-[10px] text-primary font-bold">{"Word Counter"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={onBack} className="flex-1 py-3 bg-surface-container-highest text-on-surface font-bold rounded-2xl hover:bg-surface-dim transition-all active:scale-95">{"Orqaga"}</button>
                <button onClick={onNext} disabled={exam.tasks.length === 0} className="flex-1 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-2xl shadow-lg hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  {"Keyingi"}<span className="material-symbols-outlined">{"arrow_forward"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">{"edit_note"}</span>
          </div>
          <p className="text-on-surface-variant mb-4">{"Topshiriq qo'shing — yuqoridagi tugmalardan birini tanlang"}</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   STEP 3: GRADING & EXPORT
   ══════════════════════════════════════════════ */
function WStep3({
  exam,
  setExam,
  onBack,
}: {
  exam: WritingExam;
  setExam: React.Dispatch<React.SetStateAction<WritingExam>>;
  onBack: () => void;
}) {
  const updateTask = (idx: number, patch: Partial<WritingTask>) =>
    setExam((p) => ({
      ...p,
      tasks: p.tasks.map((t, i) => (i === idx ? { ...t, ...patch } : t)),
    }));

  const handleExport = () => {
    const json = {
      exam_type: exam.examType,
      overall_time: exam.overallTimeLimit,
      tasks: exam.tasks.map((t) => ({
        task_id: t.id,
        task_type: t.taskType,
        question: t.prompt.replace(/<[^>]+>/g, ""),
        image_url: t.imageUrl || undefined,
        min_words: t.minWords,
        max_words: t.maxWords,
        time_limit: t.timeLimit,
        sample_answer: t.sampleAnswer || undefined,
        grading_notes: t.gradingNotes || undefined,
      })),
    };
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "writing_exam.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Grading Criteria Info */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Baholash kriteriyalari (IELTS/CEFR)"}</h3>
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(CRITERIA_LABELS) as (keyof GradingCriteria)[]).map((key) => (
              <div key={key} className="p-4 bg-surface-container-high rounded-xl flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${CRITERIA_COLORS[key]}`} />
                <div>
                  <p className="text-sm font-bold">{CRITERIA_LABELS[key]}</p>
                  <p className="text-[10px] text-outline">{"1.0 — 9.0 orasida baholanadi"}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-on-surface-variant leading-relaxed">
            {"Ustoz har bir o'quvchi ishini tekshirganda, bu 4 kriteriyaga ball qo'yadi. Tizim o'rtacha ballni avtomatik hisoblab chiqaradi."}
          </p>
        </div>

        {/* Grading Notes per Task */}
        {exam.tasks.map((task, ti) => (
          <div key={task.id} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2 bg-primary/10 text-primary rounded-xl">
                <span className="material-symbols-outlined">{TASK_TYPE_ICONS[task.taskType]}</span>
              </span>
              <div>
                <h4 className="font-bold text-sm">{TASK_TYPE_LABELS[task.taskType]}</h4>
                <p className="text-[10px] text-outline">{"Baholash uchun izohlar"}</p>
              </div>
            </div>
            <textarea
              value={task.gradingNotes}
              onChange={(e) => updateTask(ti, { gradingNotes: e.target.value })}
              placeholder="Masalan: Task 1 uchun kamida 2 ta asosiy trend ta'riflangan bo'lishi kerak. Overview paragraf zarur..."
              className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm min-h-[80px] outline-none resize-none focus:bg-white transition-all"
            />
          </div>
        ))}

        {/* Grading Workflow Preview */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Baholash jarayoni (Preview)"}</h3>
          <div className="p-4 bg-surface-container-high rounded-xl space-y-4">
            {/* Simulated grading card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600 text-lg">{"person"}</span>
                </div>
                <div>
                  <p className="text-xs font-bold">{"Ali Karimov"}</p>
                  <p className="text-[10px] text-outline">{"254 so'z · 38 daqiqa"}</p>
                </div>
              </div>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold">{"⏳ Tekshirilmagan"}</span>
            </div>

            {/* Criteria bars */}
            <div className="space-y-2">
              {(Object.keys(CRITERIA_LABELS) as (keyof GradingCriteria)[]).map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-outline w-8">{key}</span>
                  <div className="flex-grow h-2 bg-surface-container-lowest rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${CRITERIA_COLORS[key]} opacity-30`} style={{ width: "0%" }} />
                  </div>
                  <span className="text-[10px] font-bold text-outline w-8 text-right">{"—"}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-outline text-center">{"Ustoz tekshirganda kriteriyalar to'ldiriladi"}</p>
          </div>
        </div>
      </div>

      {/* Right: Summary & Actions */}
      <div className="col-span-12 lg:col-span-4">
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <h3 className="font-headline font-extrabold text-lg mb-4">{"Yakuniy xulosa"}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Format:"}</span>
                <span className="font-bold">{WRITING_EXAM_LABELS[exam.examType]}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Umumiy vaqt:"}</span>
                <span className="font-bold">{exam.overallTimeLimit + " daq"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Topshiriqlar:"}</span>
                <span className="font-bold">{exam.tasks.length + " ta"}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-outline-variant/20 space-y-2">
              {exam.tasks.map((t, i) => (
                <div key={t.id} className="flex items-center gap-2 text-[10px]">
                  <span className="w-5 h-5 bg-primary/10 text-primary rounded flex items-center justify-center font-bold">{i + 1}</span>
                  <span className="flex-grow truncate">{TASK_TYPE_LABELS[t.taskType]}</span>
                  <span className="text-outline">{t.minWords + "–" + t.maxWords + " so'z"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={handleExport} className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">{"publish"}</span>{"Imtihonni yakunlash (JSON)"}
            </button>
            <button onClick={onBack} className="w-full py-4 bg-surface-container-highest text-on-surface font-bold rounded-2xl hover:bg-surface-dim transition-all active:scale-95">{"Orqaga"}</button>
          </div>

          {/* Tip */}
          <div className="bg-tertiary-container/10 p-5 rounded-2xl border border-tertiary-fixed-dim/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-tertiary text-lg">{"tips_and_updates"}</span>
              <span className="font-bold text-xs text-tertiary">{"Maslahat"}</span>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              {"Tekshirilmagan ishlar panelda to'q sariq (Orange) rang bilan ajralib turadi. Inline Feedback orqali matn ichidagi xatolarni bevosita belgilashingiz mumkin bo'ladi."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN WRITING PANEL
   ══════════════════════════════════════════════ */
export default function WritingPanel() {
  const [step, setStep] = useState(0);
  const [exam, setExam] = useState<WritingExam>(defaultWritingExam);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.tasks && draft.tasks.length > 0) {
      setExam((p) => ({
        ...p,
        examType: draft.examType || p.examType,
        overallTimeLimit: draft.overallTimeLimit || p.overallTimeLimit,
        tasks: (draft.tasks || []) as WritingTask[],
      }));
    }
  }, []);

  useEffect(() => {
    if (exam.tasks.length > 0) {
      saveDraft(exam);
      setShowSaved(true);
      const t = setTimeout(() => setShowSaved(false), 1500);
      return () => clearTimeout(t);
    }
  }, [exam]);

  return (
    <div>
      {showSaved && (
        <div className="fixed top-4 right-4 z-50 bg-primary/90 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
          <span className="material-symbols-outlined text-sm">{"save"}</span>{"Saqlandi"}
        </div>
      )}
      <StepBar current={step} onStep={setStep} />
      {step === 0 && <WStep1 exam={exam} setExam={setExam} onNext={() => setStep(1)} />}
      {step === 1 && <WStep2 exam={exam} setExam={setExam} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <WStep3 exam={exam} setExam={setExam} onBack={() => setStep(1)} />}
    </div>
  );
}
