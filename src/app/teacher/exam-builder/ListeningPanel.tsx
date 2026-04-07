"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ListeningExam,
  Section,
  Question,
  QuestionType,
  ExamType,
  CEFRLevel,
  MCQQuestion,
  GapFillQuestion,
  MatchingQuestion,
  MapLabelQuestion,
  BandScoreEntry,
  EXAM_TYPE_LABELS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_ICONS,
  uid,
  formatTime,
  createQuestion,
  createSection,
  defaultExam,
  examToJSON,
} from "./types";

const STORAGE_KEY = "listening_exam_v2";

function saveDraft(exam: ListeningExam) {
  try {
    const s = {
      settings: exam.settings,
      audioName: exam.audioName,
      audioDuration: exam.audioDuration,
      sections: exam.sections.map((sec) => ({
        ...sec,
        imageFile: null,
        audioFile: null,
        questions: sec.questions.map((q) =>
          q.type === "MAP_LABEL" ? { ...q, imageFile: null } : q
        ),
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function loadDraft(): Partial<ListeningExam> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ══════════════════════════════════════════════
   STEP INDICATOR
   ══════════════════════════════════════════════ */
const STEPS = [
  { label: "Umumiy sozlamalar", icon: "settings" },
  { label: "Bo'limlar (Sections)", icon: "view_list" },
  { label: "Savollar konstruktori", icon: "edit_note" },
];

function StepIndicator({ current, onStep }: { current: number; onStep: (s: number) => void }) {
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
            <span className="sm:hidden">{i + 1}</span>
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
   STEP 1: GENERAL SETTINGS
   ══════════════════════════════════════════════ */
function Step1GeneralSettings({
  exam,
  setExam,
  onNext,
}: {
  exam: ListeningExam;
  setExam: React.Dispatch<React.SetStateAction<ListeningExam>>;
  onNext: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const s = exam.settings;

  const updateSettings = (patch: Partial<typeof s>) =>
    setExam((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));

  const handleAudio = useCallback(
    (file: File) => {
      if (exam.audioUrl) URL.revokeObjectURL(exam.audioUrl);
      const url = URL.createObjectURL(file);
      const tmp = new Audio(url);
      tmp.addEventListener("loadedmetadata", () => {
        setExam((prev) => ({
          ...prev,
          audioFile: file,
          audioUrl: url,
          audioName: file.name,
          audioDuration: tmp.duration,
        }));
      });
    },
    [exam.audioUrl, setExam]
  );

  const isCEFR = s.examType === "CEFR_MULTI";

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Exam Type */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">
            {"Imtihon turi"}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(EXAM_TYPE_LABELS) as ExamType[]).map((t) => (
              <button
                key={t}
                onClick={() => updateSettings({ examType: t })}
                className={`p-4 rounded-xl text-sm font-bold transition-all text-center ${
                  s.examType === t
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                {EXAM_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Upload (Global — for IELTS) */}
        {!isCEFR && (
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">
              {"Asosiy audio fayl"}
            </h3>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAudio(f);
              }}
            />
            {!exam.audioUrl ? (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f && f.type.startsWith("audio/")) handleAudio(f);
                }}
                className="border-2 border-dashed border-outline-variant/50 rounded-2xl p-10 text-center cursor-pointer hover:border-primary/50 transition-all bg-surface-container-low/30 group"
              >
                <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    {"cloud_upload"}
                  </span>
                </div>
                <p className="font-semibold mb-1">{"Audio faylni yuklang"}</p>
                <p className="text-sm text-on-surface-variant">
                  {".mp3 yoki .wav format, maks 50MB"}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-surface-container-high rounded-2xl flex items-center gap-4">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {"audio_file"}
                </span>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-bold truncate">{exam.audioName}</p>
                  <p className="text-xs text-outline">
                    {"Davomiyligi: " + formatTime(exam.audioDuration)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (exam.audioUrl) URL.revokeObjectURL(exam.audioUrl);
                    setExam((prev) => ({
                      ...prev,
                      audioFile: null,
                      audioUrl: null,
                      audioName: null,
                      audioDuration: 0,
                    }));
                  }}
                  className="p-2 text-error hover:bg-error/5 rounded-lg transition-all"
                >
                  <span className="material-symbols-outlined">{"delete"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Timer & Play Limit */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">
            {"Vaqt va audio sozlamalari"}
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                {"Umumiy vaqt (daqiqa)"}
              </label>
              <input
                type="number"
                min={1}
                value={s.timeLimit}
                onChange={(e) => updateSettings({ timeLimit: Number(e.target.value) || 1 })}
                className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm font-bold outline-none focus:bg-surface-container-lowest transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                {"Tinglash soni (Play Limit)"}
              </label>
              <div className="flex gap-3">
                {[1, 2].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateSettings({ playLimit: n })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      s.playLimit === n
                        ? "bg-primary text-white"
                        : "bg-surface-container-high text-on-surface hover:bg-surface-dim"
                    }`}
                  >
                    {n + " marta"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* IELTS: Band Score Table */}
        {!isCEFR && (
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-outline uppercase tracking-widest">
                {"Band Score jadvali (ixtiyoriy)"}
              </h3>
              <button
                onClick={() =>
                  updateSettings({
                    bandScoreTable: [
                      ...s.bandScoreTable,
                      { rawScore: s.bandScoreTable.length > 0 ? s.bandScoreTable[s.bandScoreTable.length - 1].rawScore + 1 : 0, bandScore: 4.0 },
                    ],
                  })
                }
                className="text-xs font-bold text-primary flex items-center gap-1 hover:opacity-70"
              >
                <span className="material-symbols-outlined text-sm">{"add"}</span>
                {"Qator qo'shish"}
              </button>
            </div>
            {s.bandScoreTable.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-3 text-[10px] font-bold text-outline uppercase tracking-widest px-1">
                  <span>{"Raw Score"}</span>
                  <span>{"Band Score"}</span>
                  <span></span>
                </div>
                {s.bandScoreTable.map((entry, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3">
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={entry.rawScore}
                      onChange={(e) => {
                        const t = [...s.bandScoreTable];
                        t[i] = { ...t[i], rawScore: Number(e.target.value) };
                        updateSettings({ bandScoreTable: t });
                      }}
                      className="bg-surface-container-high border-none rounded-lg py-2 px-3 text-sm font-bold outline-none"
                    />
                    <input
                      type="number"
                      min={1}
                      max={9}
                      step={0.5}
                      value={entry.bandScore}
                      onChange={(e) => {
                        const t = [...s.bandScoreTable];
                        t[i] = { ...t[i], bandScore: Number(e.target.value) };
                        updateSettings({ bandScoreTable: t });
                      }}
                      className="bg-surface-container-high border-none rounded-lg py-2 px-3 text-sm font-bold outline-none"
                    />
                    <button
                      onClick={() =>
                        updateSettings({
                          bandScoreTable: s.bandScoreTable.filter((_, j) => j !== i),
                        })
                      }
                      className="p-1 text-outline hover:text-error transition-all self-center"
                    >
                      <span className="material-symbols-outlined text-sm">{"close"}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-outline">
                {"Jadval bo'sh. \"Qator qo'shish\" tugmasini bosib, raw score → band score konvertatsiyasini kiriting."}
              </p>
            )}
          </div>
        )}

        {/* Transcript */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">
            {"Transkript (ixtiyoriy)"}
          </h3>
          <textarea
            value={s.transcriptText}
            onChange={(e) => updateSettings({ transcriptText: e.target.value })}
            placeholder="Audio matnining yozma varianti. O'quvchi testni tugatgandan so'ng ko'rish uchun..."
            className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm min-h-[100px] outline-none resize-none focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Side: Summary */}
      <div className="col-span-12 lg:col-span-4">
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <h3 className="font-headline font-extrabold text-lg mb-4">{"Sozlamalar xulosasi"}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Turi:"}</span>
                <span className="font-bold">{EXAM_TYPE_LABELS[s.examType]}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Vaqt:"}</span>
                <span className="font-bold">{s.timeLimit + " daqiqa"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Tinglash:"}</span>
                <span className="font-bold">{s.playLimit + " marta"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Audio:"}</span>
                <span className="font-bold">
                  {exam.audioName ? "✅ Yuklangan" : isCEFR ? "Har bo'limga alohida" : "❌ Yuklanmagan"}
                </span>
              </div>
              {!isCEFR && (
                <div className="flex justify-between text-xs">
                  <span className="text-outline">{"Band jadvali:"}</span>
                  <span className="font-bold">
                    {s.bandScoreTable.length > 0 ? s.bandScoreTable.length + " qator" : "Kiritilmagan"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {"Keyingi qadam"}
            <span className="material-symbols-outlined">{"arrow_forward"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STEP 2: SECTIONS / PARTS
   ══════════════════════════════════════════════ */
function Step2Sections({
  exam,
  setExam,
  onNext,
  onBack,
}: {
  exam: ListeningExam;
  setExam: React.Dispatch<React.SetStateAction<ListeningExam>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const isCEFR = exam.settings.examType === "CEFR_MULTI";

  const updateSection = (idx: number, patch: Partial<Section>) =>
    setExam((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));

  const deleteSection = (idx: number) =>
    setExam((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== idx),
    }));

  const moveSection = (idx: number, dir: -1 | 1) =>
    setExam((prev) => {
      const arr = [...prev.sections];
      const t = idx + dir;
      if (t < 0 || t >= arr.length) return prev;
      [arr[idx], arr[t]] = [arr[t], arr[idx]];
      return { ...prev, sections: arr };
    });

  const handleSectionAudio = (idx: number, file: File) => {
    const url = URL.createObjectURL(file);
    const tmp = new Audio(url);
    tmp.addEventListener("loadedmetadata", () => {
      updateSection(idx, {
        audioFile: file,
        audioUrl: url,
        audioName: file.name,
        audioDuration: tmp.duration,
      });
    });
  };

  const handleSectionImage = (idx: number, file: File) => {
    const url = URL.createObjectURL(file);
    updateSection(idx, { imageFile: file, imageUrl: url });
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {exam.sections.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm">
            <p className="text-on-surface-variant mb-4">
              {"Hozircha bo'limlar yo'q. Yangi bo'lim qo'shing."}
            </p>
          </div>
        )}

        {exam.sections.map((sec, si) => (
          <div
            key={sec.id}
            className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border-l-4 border-primary"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-extrabold text-lg">
                  {si + 1}
                </div>
                <input
                  className="text-lg font-bold bg-transparent border-none outline-none p-0 focus:bg-surface-container-high focus:rounded-lg focus:p-2 transition-all"
                  value={sec.title}
                  onChange={(e) => updateSection(si, { title: e.target.value })}
                  placeholder="Masalan: Part 1: Questions 1–10"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSection(si, -1)}
                  disabled={si === 0}
                  className="p-1.5 text-outline hover:text-primary disabled:opacity-20 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">{"arrow_upward"}</span>
                </button>
                <button
                  onClick={() => moveSection(si, 1)}
                  disabled={si === exam.sections.length - 1}
                  className="p-1.5 text-outline hover:text-primary disabled:opacity-20 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">{"arrow_downward"}</span>
                </button>
                <button
                  onClick={() => deleteSection(si)}
                  className="p-1.5 text-outline hover:text-error transition-all"
                >
                  <span className="material-symbols-outlined text-lg">{"delete"}</span>
                </button>
              </div>
            </div>

            {/* Instruction */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                {"Ko'rsatma (Instruction)"}
              </label>
              <input
                className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm outline-none focus:bg-surface-container-lowest transition-all"
                value={sec.instruction}
                onChange={(e) => updateSection(si, { instruction: e.target.value })}
                placeholder="Write NO MORE THAN TWO WORDS AND/OR A NUMBER"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Section Image */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {"Rasm (ixtiyoriy)"}
                </label>
                {sec.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden bg-slate-50">
                    <img src={sec.imageUrl} alt="Section" className="w-full h-32 object-cover" />
                    <button
                      onClick={() => {
                        if (sec.imageUrl) URL.revokeObjectURL(sec.imageUrl);
                        updateSection(si, { imageUrl: null, imageFile: null });
                      }}
                      className="absolute top-2 right-2 p-1 bg-white/80 rounded-full text-error hover:bg-white transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">{"close"}</span>
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-outline-variant/30 rounded-xl p-4 text-center cursor-pointer hover:border-primary/40 transition-all">
                    <span className="material-symbols-outlined text-outline text-2xl">{"image"}</span>
                    <p className="text-[10px] text-outline mt-1">{"Yuklang"}</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSectionImage(si, f);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* CEFR: Per-section audio */}
              {isCEFR && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {"Bo'lim audiosi"}
                  </label>
                  {sec.audioUrl ? (
                    <div className="p-3 bg-surface-container-high rounded-xl flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">{"audio_file"}</span>
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-bold truncate">{sec.audioName}</p>
                        <p className="text-[10px] text-outline">{formatTime(sec.audioDuration)}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (sec.audioUrl) URL.revokeObjectURL(sec.audioUrl);
                          updateSection(si, {
                            audioUrl: null,
                            audioFile: null,
                            audioName: null,
                            audioDuration: 0,
                          });
                        }}
                        className="p-1 text-error"
                      >
                        <span className="material-symbols-outlined text-sm">{"close"}</span>
                      </button>
                    </div>
                  ) : (
                    <label className="block border-2 border-dashed border-outline-variant/30 rounded-xl p-4 text-center cursor-pointer hover:border-primary/40 transition-all">
                      <span className="material-symbols-outlined text-outline text-2xl">
                        {"headphones"}
                      </span>
                      <p className="text-[10px] text-outline mt-1">{"Audio yuklang"}</p>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleSectionAudio(si, f);
                        }}
                      />
                    </label>
                  )}
                  {/* Per-section play limit */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-outline font-bold">{"Tinglash:"}</span>
                    {[1, 2].map((n) => (
                      <button
                        key={n}
                        onClick={() => updateSection(si, { playLimit: n })}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          sec.playLimit === n
                            ? "bg-primary text-white"
                            : "bg-surface-container-high text-on-surface"
                        }`}
                      >
                        {n + "x"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Question count badge */}
            <div className="mt-4 flex items-center gap-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                {sec.questions.length + " ta savol"}
              </span>
            </div>
          </div>
        ))}

        {/* Add Section Button */}
        <button
          onClick={() =>
            setExam((prev) => ({
              ...prev,
              sections: [...prev.sections, createSection(prev.sections.length)],
            }))
          }
          className="w-full border-2 border-dashed border-outline-variant/30 rounded-2xl p-6 flex items-center justify-center gap-3 text-outline hover:text-primary hover:border-primary/40 transition-all"
        >
          <span className="material-symbols-outlined">{"add"}</span>
          <span className="font-bold text-sm">{"Yangi bo'lim qo'shish"}</span>
        </button>
      </div>

      {/* Right: Navigation */}
      <div className="col-span-12 lg:col-span-4">
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <h3 className="font-headline font-extrabold text-lg mb-4">{"Bo'limlar"}</h3>
            <div className="space-y-2">
              {exam.sections.map((sec, i) => (
                <div key={sec.id} className="flex items-center gap-3 p-2 bg-surface rounded-xl">
                  <div className="w-6 h-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-xs">
                    {i + 1}
                  </div>
                  <span className="text-xs font-semibold flex-grow truncate">{sec.title}</span>
                  <span className="text-[10px] text-outline">{sec.questions.length + " savol"}</span>
                </div>
              ))}
              {exam.sections.length === 0 && (
                <p className="text-xs text-outline text-center py-4">{"Hali bo'lim yo'q"}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-4 bg-surface-container-highest text-on-surface font-bold rounded-2xl hover:bg-surface-dim transition-all active:scale-95"
            >
              {"Orqaga"}
            </button>
            <button
              onClick={onNext}
              disabled={exam.sections.length === 0}
              className="flex-1 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {"Keyingi"}
              <span className="material-symbols-outlined">{"arrow_forward"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   QUESTION EDITORS
   ══════════════════════════════════════════════ */
function MCQEditor({ q, onChange }: { q: MCQQuestion; onChange: (q: MCQQuestion) => void }) {
  return (
    <div className="space-y-3">
      <input
        className="w-full text-sm font-bold bg-surface-container-high border-none rounded-xl p-3 outline-none focus:bg-surface-container-lowest transition-all"
        value={q.text}
        onChange={(e) => onChange({ ...q, text: e.target.value })}
        placeholder="Savol matnini kiriting..."
      />
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-3 group">
            <button
              onClick={() => onChange({ ...q, correctAnswer: opt.label })}
              className={`w-8 h-8 border-2 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                q.correctAnswer === opt.label
                  ? "border-primary bg-primary text-white"
                  : "border-outline-variant text-outline hover:border-primary/50"
              }`}
            >
              {opt.label}
            </button>
            <input
              className="flex-grow bg-surface-container-low border-none rounded-xl p-3 text-sm outline-none focus:bg-white transition-all"
              value={opt.text}
              onChange={(e) => {
                const newOpts = [...q.options];
                newOpts[i] = { ...newOpts[i], text: e.target.value };
                onChange({ ...q, options: newOpts });
              }}
              placeholder={`${opt.label}-variant`}
            />
            {q.correctAnswer === opt.label && (
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                {"check_circle"}
              </span>
            )}
            {q.options.length > 2 && (
              <button
                onClick={() => onChange({ ...q, options: q.options.filter((o) => o.id !== opt.id) })}
                className="opacity-0 group-hover:opacity-100 p-1 text-outline-variant hover:text-error transition-all"
              >
                <span className="material-symbols-outlined text-sm">{"close"}</span>
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          const nextLabel = String.fromCharCode(65 + q.options.length);
          onChange({ ...q, options: [...q.options, { id: uid(), label: nextLabel, text: "" }] });
        }}
        className="flex items-center gap-2 text-primary font-bold text-xs hover:opacity-70"
      >
        <span className="material-symbols-outlined text-sm">{"add_circle"}</span>
        {"Variant qo'shish"}
      </button>
    </div>
  );
}

function GapFillEditor({ q, onChange }: { q: GapFillQuestion; onChange: (q: GapFillQuestion) => void }) {
  const gaps = (q.text.match(/\[\d+\]/g) || []).map((g) => Number(g.replace(/[[\]]/g, "")));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] text-on-surface-variant font-bold mb-2 uppercase tracking-widest">
          {"Bo'sh joylarni [1], [2] shaklida belgilang"}
        </p>
        <textarea
          className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm min-h-[80px] outline-none resize-none focus:bg-white transition-all"
          value={q.text}
          onChange={(e) => onChange({ ...q, text: e.target.value })}
          placeholder="Masalan: The hotel is on [1] Street, [2] minutes from station."
        />
      </div>
      {gaps.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
            {"To'g'ri javoblar (sinonimlarni vergul bilan ajrating)"}
          </p>
          {gaps.map((gapNum) => (
            <div key={gapNum} className="flex items-center gap-3">
              <span className="w-8 h-8 bg-secondary-container/30 rounded-lg flex items-center justify-center text-xs font-bold">
                {"[" + gapNum + "]"}
              </span>
              <input
                className="flex-grow bg-surface-container-low border-none rounded-xl p-3 text-sm outline-none focus:bg-white transition-all"
                value={(q.answers[gapNum] || []).join(", ")}
                onChange={(e) => {
                  const vals = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                  onChange({
                    ...q,
                    answers: { ...q.answers, [gapNum]: vals },
                  });
                }}
                placeholder="centre, center"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchingEditor2({ q, onChange }: { q: MatchingQuestion; onChange: (q: MatchingQuestion) => void }) {
  return (
    <div className="space-y-3">
      <input
        className="w-full text-sm bg-surface-container-high border-none rounded-xl p-3 outline-none focus:bg-surface-container-lowest transition-all"
        value={q.instruction}
        onChange={(e) => onChange({ ...q, instruction: e.target.value })}
        placeholder="Yo'riqnoma..."
      />
      <div className="grid grid-cols-2 gap-2 mb-1">
        <span className="text-[10px] font-bold text-outline uppercase px-1">{"Chap ustun"}</span>
        <span className="text-[10px] font-bold text-outline uppercase px-1">{"O'ng ustun (javob)"}</span>
      </div>
      {q.items.map((item, i) => (
        <div key={item.id} className="grid grid-cols-2 gap-2 group">
          <input
            className="bg-surface-container-low border-none rounded-xl p-3 text-sm outline-none focus:bg-white transition-all"
            value={item.left}
            onChange={(e) => {
              const n = [...q.items];
              n[i] = { ...n[i], left: e.target.value };
              onChange({ ...q, items: n });
            }}
            placeholder={`${i + 1}`}
          />
          <div className="flex gap-1">
            <input
              className="flex-grow bg-surface-container-low border-none rounded-xl p-3 text-sm outline-none focus:bg-white transition-all"
              value={item.right}
              onChange={(e) => {
                const n = [...q.items];
                n[i] = { ...n[i], right: e.target.value };
                onChange({ ...q, items: n });
              }}
              placeholder="Javob"
            />
            {q.items.length > 2 && (
              <button
                onClick={() => onChange({ ...q, items: q.items.filter((it) => it.id !== item.id) })}
                className="opacity-0 group-hover:opacity-100 p-1 text-outline-variant hover:text-error"
              >
                <span className="material-symbols-outlined text-sm">{"close"}</span>
              </button>
            )}
          </div>
        </div>
      ))}
      <button
        onClick={() =>
          onChange({ ...q, items: [...q.items, { id: uid(), left: "", right: "" }] })
        }
        className="flex items-center gap-2 text-primary font-bold text-xs hover:opacity-70"
      >
        <span className="material-symbols-outlined text-sm">{"add_circle"}</span>
        {"Juftlik qo'shish"}
      </button>
    </div>
  );
}

function MapLabelEditor({ q, onChange }: { q: MapLabelQuestion; onChange: (q: MapLabelQuestion) => void }) {
  const imageRef = useRef<HTMLInputElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!q.imageUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const label = String(q.hotspots.length + 1);
    onChange({
      ...q,
      hotspots: [...q.hotspots, { id: uid(), label, x, y, correctAnswer: "" }],
    });
  };

  return (
    <div className="space-y-4">
      <input
        className="w-full text-sm bg-surface-container-high border-none rounded-xl p-3 outline-none focus:bg-surface-container-lowest transition-all"
        value={q.instruction}
        onChange={(e) => onChange({ ...q, instruction: e.target.value })}
        placeholder="Yo'riqnoma: Xaritadagi belgilarni nomlang"
      />

      {/* Image upload + hotspot placement */}
      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            const url = URL.createObjectURL(f);
            onChange({ ...q, imageFile: f, imageUrl: url });
          }
        }}
      />
      {q.imageUrl ? (
        <div className="relative rounded-xl overflow-hidden cursor-crosshair" onClick={handleImageClick}>
          <img src={q.imageUrl} alt="Map" className="w-full" />
          {q.hotspots.map((hs) => (
            <div
              key={hs.id}
              className="absolute w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg -translate-x-1/2 -translate-y-1/2 border-2 border-white"
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
            >
              {hs.label}
            </div>
          ))}
          <p className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
            {"Bosib belgi qo'ying"}
          </p>
        </div>
      ) : (
        <button
          onClick={() => imageRef.current?.click()}
          className="w-full border-2 border-dashed border-outline-variant/30 rounded-xl p-8 text-center hover:border-primary/40 transition-all"
        >
          <span className="material-symbols-outlined text-outline text-3xl">{"image"}</span>
          <p className="text-xs text-outline mt-2">{"Xarita yoki diagramma rasmini yuklang"}</p>
        </button>
      )}

      {/* Hotspot answers */}
      {q.hotspots.length > 0 && (
        <div className="space-y-2">
          {q.hotspots.map((hs, i) => (
            <div key={hs.id} className="flex items-center gap-3 group">
              <div className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0">
                {hs.label}
              </div>
              <input
                className="flex-grow bg-surface-container-low border-none rounded-xl p-3 text-sm outline-none focus:bg-white transition-all"
                value={hs.correctAnswer}
                onChange={(e) => {
                  const n = [...q.hotspots];
                  n[i] = { ...n[i], correctAnswer: e.target.value };
                  onChange({ ...q, hotspots: n });
                }}
                placeholder="To'g'ri javob"
              />
              <button
                onClick={() => onChange({ ...q, hotspots: q.hotspots.filter((h) => h.id !== hs.id) })}
                className="opacity-0 group-hover:opacity-100 p-1 text-outline-variant hover:text-error"
              >
                <span className="material-symbols-outlined text-sm">{"close"}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Universal question card ── */
function QuestionCard({
  q,
  index,
  isCEFR,
  onChange,
  onDelete,
}: {
  q: Question;
  index: number;
  isCEFR: boolean;
  onChange: (q: Question) => void;
  onDelete: () => void;
}) {
  const borderColor: Record<string, string> = {
    MCQ: "border-tertiary",
    GAP_FILL: "border-secondary",
    MATCHING: "border-primary",
    MAP_LABEL: "border-error",
  };
  const labelColor: Record<string, string> = {
    MCQ: "text-tertiary",
    GAP_FILL: "text-secondary",
    MATCHING: "text-primary",
    MAP_LABEL: "text-error",
  };

  return (
    <div className={`bg-surface-container-lowest p-5 rounded-2xl shadow-sm border-l-4 ${borderColor[q.type]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-widest ${labelColor[q.type]}`}>
            {(index + 1) + "-savol"}
          </span>
          <span className="text-[10px] text-outline bg-surface-container-high px-2 py-0.5 rounded-full">
            {QUESTION_TYPE_LABELS[q.type]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCEFR && (
            <select
              value={q.cefrLevel || ""}
              onChange={(e) => onChange({ ...q, cefrLevel: (e.target.value || undefined) as CEFRLevel | undefined })}
              className="text-[10px] font-bold bg-surface-container-high border-none rounded-lg py-1 px-2 outline-none"
            >
              <option value="">{"Daraja"}</option>
              <option value="A2">{"A2"}</option>
              <option value="B1">{"B1"}</option>
              <option value="B2">{"B2"}</option>
              <option value="C1">{"C1"}</option>
            </select>
          )}
          <button onClick={onDelete} className="p-1 text-outline hover:text-error transition-all">
            <span className="material-symbols-outlined text-lg">{"delete"}</span>
          </button>
        </div>
      </div>

      {q.type === "MCQ" && <MCQEditor q={q} onChange={(nq) => onChange(nq)} />}
      {q.type === "GAP_FILL" && <GapFillEditor q={q} onChange={(nq) => onChange(nq)} />}
      {q.type === "MATCHING" && <MatchingEditor2 q={q} onChange={(nq) => onChange(nq)} />}
      {q.type === "MAP_LABEL" && <MapLabelEditor q={q} onChange={(nq) => onChange(nq)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════
   STEP 3: QUESTION BUILDER
   ══════════════════════════════════════════════ */
function Step3Questions({
  exam,
  setExam,
  onBack,
}: {
  exam: ListeningExam;
  setExam: React.Dispatch<React.SetStateAction<ListeningExam>>;
  onBack: () => void;
}) {
  const [activeSection, setActiveSection] = useState(0);
  const isCEFR = exam.settings.examType === "CEFR_MULTI";

  const sec = exam.sections[activeSection];
  if (!sec) return null;

  const updateQuestion = (qIdx: number, q: Question) => {
    setExam((prev) => {
      const newSections = [...prev.sections];
      const newQs = [...newSections[activeSection].questions];
      newQs[qIdx] = q;
      newSections[activeSection] = { ...newSections[activeSection], questions: newQs };
      return { ...prev, sections: newSections };
    });
  };

  const deleteQuestion = (qIdx: number) => {
    setExam((prev) => {
      const newSections = [...prev.sections];
      newSections[activeSection] = {
        ...newSections[activeSection],
        questions: newSections[activeSection].questions.filter((_, i) => i !== qIdx),
      };
      return { ...prev, sections: newSections };
    });
  };

  const addQuestion = (type: QuestionType) => {
    setExam((prev) => {
      const newSections = [...prev.sections];
      newSections[activeSection] = {
        ...newSections[activeSection],
        questions: [...newSections[activeSection].questions, createQuestion(type)],
      };
      return { ...prev, sections: newSections };
    });
  };

  const totalQuestions = exam.sections.reduce((s, sec2) => s + sec2.questions.length, 0);

  const handleExport = () => {
    const json = examToJSON(exam);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "listening_exam.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {exam.sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(i)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                i === activeSection
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface-container-high text-on-surface hover:bg-surface-dim"
              }`}
            >
              {s.title}
              <span className="ml-2 opacity-60">{"(" + s.questions.length + ")"}</span>
            </button>
          ))}
        </div>

        {/* Section Info */}
        <div className="bg-surface-container-low/50 p-4 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">{"info"}</span>
          <p className="text-xs text-on-surface-variant">
            <strong>{sec.title}</strong>
            {sec.instruction ? " — " + sec.instruction : ""}
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {sec.questions.map((q, qi) => (
            <QuestionCard
              key={q.id}
              q={q}
              index={qi}
              isCEFR={isCEFR}
              onChange={(nq) => updateQuestion(qi, nq)}
              onDelete={() => deleteQuestion(qi)}
            />
          ))}
        </div>

        {/* Add Question Buttons */}
        <div className="bg-surface-container-low/50 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">
            {"Savol qo'shish (" + sec.title + ")"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
              <button
                key={type}
                onClick={() => addQuestion(type)}
                className="bg-surface-container-lowest p-3 rounded-xl border border-transparent hover:border-primary/20 active:scale-95 transition-all flex flex-col items-center gap-2 group"
              >
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                  {QUESTION_TYPE_ICONS[type]}
                </span>
                <span className="text-[10px] font-bold text-on-surface text-center">
                  {QUESTION_TYPE_LABELS[type]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Preview + Actions */}
      <div className="col-span-12 lg:col-span-4">
        <div className="lg:sticky lg:top-24 space-y-6">
          {/* Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <h3 className="font-headline font-extrabold text-lg mb-4">{"Test xulosasi"}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Format:"}</span>
                <span className="font-bold">{EXAM_TYPE_LABELS[exam.settings.examType]}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Vaqt:"}</span>
                <span className="font-bold">{exam.settings.timeLimit + " daq"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Bo'limlar:"}</span>
                <span className="font-bold">{exam.sections.length + " ta"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Jami savollar:"}</span>
                <span className="font-bold">{totalQuestions + " ta"}</span>
              </div>
            </div>

            {/* Per-section breakdown */}
            <div className="mt-4 space-y-1 pt-4 border-t border-outline-variant/20">
              {exam.sections.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 text-[10px]">
                  <span className="w-5 h-5 bg-primary/10 text-primary rounded flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="flex-grow truncate">{s.title}</span>
                  <span className="text-outline font-bold">{s.questions.length}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">{"publish"}</span>
              {"Imtihonni yakunlash (JSON)"}
            </button>
            <button
              onClick={onBack}
              className="w-full py-4 bg-surface-container-highest text-on-surface font-bold rounded-2xl hover:bg-surface-dim transition-all active:scale-95"
            >
              {"Orqaga"}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-tertiary-container/10 p-5 rounded-2xl border border-tertiary-fixed-dim/30">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-tertiary">{"tips_and_updates"}</span>
              <span className="font-bold text-xs text-tertiary">{"Maslahat"}</span>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              {
                "Gap Fill savollarida to'g'ri javoblarni vergul bilan ajratib kiriting (masalan: centre, center) — bu sinonimlarni qabul qilish uchun ishlaydi."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN LISTENING PANEL
   ══════════════════════════════════════════════ */
export default function ListeningPanel() {
  const [step, setStep] = useState(0);
  const [exam, setExam] = useState<ListeningExam>(defaultExam);
  const [showSaved, setShowSaved] = useState(false);

  // Load draft
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.sections && draft.sections.length > 0) {
      setExam((prev) => ({
        ...prev,
        settings: draft.settings || prev.settings,
        audioName: draft.audioName || null,
        audioDuration: draft.audioDuration || 0,
        sections: (draft.sections || []) as Section[],
      }));
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (exam.sections.length > 0 || exam.settings.examType !== "IELTS_ACADEMIC") {
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
          <span className="material-symbols-outlined text-sm">{"save"}</span>
          {"Saqlandi"}
        </div>
      )}

      <StepIndicator current={step} onStep={setStep} />

      {step === 0 && (
        <Step1GeneralSettings exam={exam} setExam={setExam} onNext={() => setStep(1)} />
      )}
      {step === 1 && (
        <Step2Sections
          exam={exam}
          setExam={setExam}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <Step3Questions exam={exam} setExam={setExam} onBack={() => setStep(1)} />
      )}
    </div>
  );
}
