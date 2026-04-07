"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  SpeakingExam,
  SpeakingPart,
  SpeakingQuestion,
  SpeakingExamType,
  SpeakingGradingCriteria,
  SPEAKING_EXAM_LABELS,
  SPEAKING_CRITERIA_LABELS,
  SPEAKING_CRITERIA_COLORS,
  uid,
  createSpeakingQuestion,
  createSpeakingPart,
  defaultSpeakingExam,
  createIELTSSpeaking,
  formatSeconds,
} from "./speakingTypes";

const STORAGE_KEY = "speaking_exam_v2";

function saveDraft(exam: SpeakingExam) {
  try {
    const s = {
      ...exam,
      parts: exam.parts.map((p) => ({
        ...p,
        imageFile: null,
        questions: p.questions.map((q) => ({ ...q, audioFile: null })),
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

function loadDraft(): Partial<SpeakingExam> | null {
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
  { label: "Bo'limlar va savollar", icon: "record_voice_over" },
  { label: "Baholash va yakunlash", icon: "grading" },
];

function StepBar({ current, onStep }: { current: number; onStep: (s: number) => void }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <React.Fragment key={i}>
          <button onClick={() => onStep(i)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${i === current ? "bg-primary text-white shadow-md" : i < current ? "bg-primary/10 text-primary" : "bg-surface-container-high text-outline"}`}>
            <span className="material-symbols-outlined text-lg">{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
          {i < STEPS.length - 1 && <div className={`h-[2px] w-8 ${i < current ? "bg-primary" : "bg-outline-variant/30"}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   STEP 1: GENERAL SETTINGS
   ══════════════════════════════════════════════ */
function SStep1({ exam, setExam, onNext }: { exam: SpeakingExam; setExam: React.Dispatch<React.SetStateAction<SpeakingExam>>; onNext: () => void }) {
  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Exam Type */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Imtihon turi"}</h3>
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(SPEAKING_EXAM_LABELS) as SpeakingExamType[]).map((t) => (
              <button
                key={t}
                onClick={() => setExam((p) => ({ ...p, examType: t, parts: [] }))}
                className={`p-5 rounded-xl text-sm font-bold transition-all text-center ${exam.examType === t ? "bg-primary text-white shadow-md" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
              >
                <span className="material-symbols-outlined text-2xl block mb-2">{t === "IELTS" ? "mic" : "record_voice_over"}</span>
                {SPEAKING_EXAM_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Setup */}
        {exam.examType === "IELTS" && exam.parts.length === 0 && (
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-primary">{"auto_awesome"}</span>
              <h3 className="font-bold text-sm text-primary">{"Tez sozlash"}</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              {"IELTS standart 3 ta bo'limni avtomatik yaratish (Interview, Cue Card, Discussion)"}
            </p>
            <button
              onClick={() => setExam((p) => ({ ...p, parts: createIELTSSpeaking() }))}
              className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all active:scale-95"
            >
              {"IELTS 3-Part yaratish"}
            </button>
          </div>
        )}

        {/* Settings */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Imtihon sozlamalari"}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-high rounded-xl">
              <div>
                <p className="text-sm font-bold">{"Mikrofon tekshiruvi (Mic Check)"}</p>
                <p className="text-[10px] text-outline">{"Imtihon oldidan o'quvchi mikrofonini sinab ko'radi"}</p>
              </div>
              <button
                onClick={() => setExam((p) => ({ ...p, micCheckEnabled: !p.micCheckEnabled }))}
                className={`w-12 h-7 rounded-full transition-all relative ${exam.micCheckEnabled ? "bg-primary" : "bg-outline-variant/30"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-1 transition-all ${exam.micCheckEnabled ? "left-6" : "left-1"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-high rounded-xl">
              <div>
                <p className="text-sm font-bold">{"Qayta tinglash (Playback)"}</p>
                <p className="text-[10px] text-outline">{"O'quvchi o'z javobini eshita oladi (real imtihonda o'chirilgan)"}</p>
              </div>
              <button
                onClick={() => setExam((p) => ({ ...p, allowPlayback: !p.allowPlayback }))}
                className={`w-12 h-7 rounded-full transition-all relative ${exam.allowPlayback ? "bg-primary" : "bg-outline-variant/30"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-1 transition-all ${exam.allowPlayback ? "left-6" : "left-1"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="col-span-12 lg:col-span-4">
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <h3 className="font-headline font-extrabold text-lg mb-4">{"Xulosa"}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs"><span className="text-outline">{"Turi:"}</span><span className="font-bold">{SPEAKING_EXAM_LABELS[exam.examType]}</span></div>
              <div className="flex justify-between text-xs"><span className="text-outline">{"Bo'limlar:"}</span><span className="font-bold">{exam.parts.length + " ta"}</span></div>
              <div className="flex justify-between text-xs"><span className="text-outline">{"Mic Check:"}</span><span className="font-bold">{exam.micCheckEnabled ? "✅" : "❌"}</span></div>
              <div className="flex justify-between text-xs"><span className="text-outline">{"Playback:"}</span><span className="font-bold">{exam.allowPlayback ? "✅ Ruxsat" : "❌ Taqiqlangan"}</span></div>
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
   QUESTION CARD
   ══════════════════════════════════════════════ */
function QuestionCard({ q, index, onChange, onDelete }: { q: SpeakingQuestion; index: number; onChange: (q: SpeakingQuestion) => void; onDelete: () => void }) {
  const audioRef = useRef<HTMLInputElement>(null);

  const handleAudio = (file: File) => {
    const url = URL.createObjectURL(file);
    onChange({ ...q, audioFile: file, audioUrl: url, audioName: file.name });
  };

  return (
    <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border-l-4 border-primary">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">{(index + 1) + "-savol"}</span>
        <button onClick={onDelete} className="p-1 text-outline hover:text-error transition-all"><span className="material-symbols-outlined text-lg">{"delete"}</span></button>
      </div>

      {/* Text prompt */}
      <textarea
        value={q.text}
        onChange={(e) => onChange({ ...q, text: e.target.value })}
        placeholder="Savol matnini kiriting... (masalan: Tell me about your hometown)"
        className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm min-h-[60px] outline-none resize-none focus:bg-white transition-all mb-3"
      />

      {/* Audio prompt */}
      <div className="flex items-center gap-3 mb-3">
        <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudio(f); }} />
        {q.audioUrl ? (
          <div className="flex items-center gap-2 p-2 bg-surface-container-high rounded-xl flex-grow">
            <span className="material-symbols-outlined text-primary text-lg">{"audio_file"}</span>
            <span className="text-xs font-bold truncate flex-grow">{q.audioName}</span>
            <button onClick={() => { if (q.audioUrl) URL.revokeObjectURL(q.audioUrl); onChange({ ...q, audioUrl: null, audioFile: null, audioName: null }); }} className="p-1 text-error">
              <span className="material-symbols-outlined text-sm">{"close"}</span>
            </button>
          </div>
        ) : (
          <button onClick={() => audioRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-surface-container-high rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-dim transition-all">
            <span className="material-symbols-outlined text-base">{"mic"}</span>{"Audio prompt yuklash"}
          </button>
        )}
      </div>

      {/* Follow-up questions */}
      {q.followUps.length > 0 && (
        <div className="space-y-2 mb-2">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{"Davomiy savollar"}</p>
          {q.followUps.map((fu, fi) => (
            <div key={fi} className="flex items-center gap-2 group">
              <span className="text-[10px] text-outline font-bold">{(fi + 1) + "."}</span>
              <input
                className="flex-grow bg-surface-container-low border-none rounded-lg p-2 text-xs outline-none focus:bg-white transition-all"
                value={fu}
                onChange={(e) => { const n = [...q.followUps]; n[fi] = e.target.value; onChange({ ...q, followUps: n }); }}
                placeholder="Follow-up savol..."
              />
              <button onClick={() => onChange({ ...q, followUps: q.followUps.filter((_, i) => i !== fi) })} className="opacity-0 group-hover:opacity-100 p-0.5 text-outline-variant hover:text-error">
                <span className="material-symbols-outlined text-sm">{"close"}</span>
              </button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => onChange({ ...q, followUps: [...q.followUps, ""] })} className="flex items-center gap-1 text-primary font-bold text-[10px] hover:opacity-70">
        <span className="material-symbols-outlined text-sm">{"add"}</span>{"Follow-up qo'shish"}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STEP 2: PARTS & QUESTIONS
   ══════════════════════════════════════════════ */
function SStep2({ exam, setExam, onNext, onBack }: { exam: SpeakingExam; setExam: React.Dispatch<React.SetStateAction<SpeakingExam>>; onNext: () => void; onBack: () => void }) {
  const [activePart, setActivePart] = useState(0);

  const updatePart = (idx: number, patch: Partial<SpeakingPart>) =>
    setExam((p) => ({ ...p, parts: p.parts.map((pt, i) => (i === idx ? { ...pt, ...patch } : pt)) }));

  const deletePart = (idx: number) => {
    setExam((p) => ({ ...p, parts: p.parts.filter((_, i) => i !== idx) }));
    if (activePart > 0 && activePart >= exam.parts.length - 1) setActivePart(activePart - 1);
  };

  const updateQuestion = (pi: number, qi: number, q: SpeakingQuestion) => {
    setExam((p) => {
      const np = [...p.parts];
      const nq = [...np[pi].questions];
      nq[qi] = q;
      np[pi] = { ...np[pi], questions: nq };
      return { ...p, parts: np };
    });
  };

  const deleteQuestion = (pi: number, qi: number) => {
    setExam((p) => {
      const np = [...p.parts];
      np[pi] = { ...np[pi], questions: np[pi].questions.filter((_, i) => i !== qi) };
      return { ...p, parts: np };
    });
  };

  const part = exam.parts[activePart];

  return (
    <div className="space-y-6">
      {/* Part Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {exam.parts.map((p, i) => (
          <button key={p.id} onClick={() => setActivePart(i)} className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${i === activePart ? "bg-primary text-white shadow-md" : "bg-surface-container-high text-on-surface hover:bg-surface-dim"}`}>
            {p.title}<span className="ml-2 opacity-60">{"(" + p.questions.length + ")"}</span>
          </button>
        ))}
        <button onClick={() => { setExam((p) => ({ ...p, parts: [...p.parts, createSpeakingPart(p.parts.length, exam.examType)] })); setActivePart(exam.parts.length); }} className="px-3 py-2.5 rounded-xl text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">{"add"}</span>{"Yangi Part"}
        </button>
      </div>

      {part ? (
        <div className="grid grid-cols-12 gap-8">
          {/* Left: Part Editor */}
          <div className="col-span-12 lg:col-span-8 space-y-5">
            {/* Part Header */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <input className="text-lg font-bold bg-transparent outline-none flex-grow focus:bg-surface-container-high focus:rounded-lg focus:p-2 transition-all" value={part.title} onChange={(e) => updatePart(activePart, { title: e.target.value })} />
                <button onClick={() => deletePart(activePart)} className="p-2 text-outline hover:text-error rounded-lg transition-all"><span className="material-symbols-outlined">{"delete"}</span></button>
              </div>

              {/* Instruction */}
              <input className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm outline-none focus:bg-surface-container-lowest transition-all mb-4" value={part.instruction} onChange={(e) => updatePart(activePart, { instruction: e.target.value })} placeholder="Ko'rsatma (masalan: Answer the following questions about yourself)" />

              {/* Timing */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{"Tayyorlanish vaqti (soniya)"}</label>
                  <input type="number" min={0} value={part.prepTime} onChange={(e) => updatePart(activePart, { prepTime: Number(e.target.value) || 0 })} className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm font-bold outline-none" />
                  <p className="text-[10px] text-outline mt-1">{formatSeconds(part.prepTime)}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{"Javob vaqti (soniya)"}</label>
                  <input type="number" min={10} value={part.responseTime} onChange={(e) => updatePart(activePart, { responseTime: Number(e.target.value) || 10 })} className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm font-bold outline-none" />
                  <p className="text-[10px] text-outline mt-1">{formatSeconds(part.responseTime)}</p>
                </div>
              </div>

              {/* Cue Card toggle */}
              <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-xl">
                <div>
                  <p className="text-sm font-bold">{"Cue Card (Long Turn)"}</p>
                  <p className="text-[10px] text-outline">{"IELTS Part 2 uslubida rasmli kartochka"}</p>
                </div>
                <button onClick={() => updatePart(activePart, { isCueCard: !part.isCueCard, cueCardPoints: !part.isCueCard ? ["", "", "", ""] : [] })} className={`w-12 h-7 rounded-full transition-all relative ${part.isCueCard ? "bg-primary" : "bg-outline-variant/30"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-1 transition-all ${part.isCueCard ? "left-6" : "left-1"}`} />
                </button>
              </div>
            </div>

            {/* Cue Card Editor */}
            {part.isCueCard && (
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border-l-4 border-tertiary">
                <h4 className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4">{"Cue Card"}</h4>
                {/* Image */}
                {part.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden mb-4">
                    <img src={part.imageUrl} alt="Cue Card" className="w-full max-h-48 object-contain bg-slate-50" />
                    <button onClick={() => { if (part.imageUrl) URL.revokeObjectURL(part.imageUrl); updatePart(activePart, { imageUrl: null, imageFile: null }); }} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-error shadow">
                      <span className="material-symbols-outlined text-sm">{"close"}</span>
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-outline-variant/30 rounded-xl p-6 text-center cursor-pointer hover:border-tertiary/40 transition-all mb-4">
                    <span className="material-symbols-outlined text-outline text-2xl">{"image"}</span>
                    <p className="text-xs text-outline mt-1">{"Cue Card rasmi (ixtiyoriy)"}</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const url = URL.createObjectURL(f); updatePart(activePart, { imageFile: f, imageUrl: url }); } }} />
                  </label>
                )}
                {/* Bullet points */}
                <p className="text-[10px] font-bold text-outline uppercase mb-2">{"Nima haqida gapirish kerak:"}</p>
                <div className="space-y-2">
                  {part.cueCardPoints.map((cp, ci) => (
                    <div key={ci} className="flex items-center gap-2">
                      <span className="text-tertiary font-bold text-xs">{"•"}</span>
                      <input className="flex-grow bg-surface-container-low border-none rounded-lg p-2.5 text-sm outline-none focus:bg-white transition-all" value={cp} onChange={(e) => { const n = [...part.cueCardPoints]; n[ci] = e.target.value; updatePart(activePart, { cueCardPoints: n }); }} placeholder="Masalan: What it is" />
                    </div>
                  ))}
                </div>
                <button onClick={() => updatePart(activePart, { cueCardPoints: [...part.cueCardPoints, ""] })} className="flex items-center gap-1 text-tertiary font-bold text-xs mt-2 hover:opacity-70">
                  <span className="material-symbols-outlined text-sm">{"add"}</span>{"Band qo'shish"}
                </button>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-4">
              {part.questions.map((q, qi) => (
                <QuestionCard key={q.id} q={q} index={qi} onChange={(nq) => updateQuestion(activePart, qi, nq)} onDelete={() => deleteQuestion(activePart, qi)} />
              ))}
            </div>

            <button onClick={() => updatePart(activePart, { questions: [...part.questions, createSpeakingQuestion()] })} className="w-full border-2 border-dashed border-outline-variant/20 rounded-xl p-4 flex items-center justify-center gap-2 text-outline hover:text-primary hover:border-primary/30 transition-all">
              <span className="material-symbols-outlined text-sm">{"add"}</span>
              <span className="text-xs font-bold uppercase tracking-widest">{"Savol qo'shish"}</span>
            </button>
          </div>

          {/* Right: Student Preview */}
          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Live Simulation Preview */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-surface-container-high px-4 py-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{"🎙 O'quvchi ko'rinishi"}</span>
                  <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">{"Preview"}</span>
                </div>
                <div className="p-5 space-y-4">
                  {/* Timer */}
                  {part.prepTime > 0 && (
                    <div className="p-3 bg-amber-50 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-amber-700 uppercase">{"Tayyorlanish"}</p>
                      <p className="text-xl font-extrabold text-amber-700">{formatSeconds(part.prepTime)}</p>
                      <div className="h-1.5 bg-amber-200 rounded-full mt-2"><div className="h-full w-3/4 bg-amber-500 rounded-full" /></div>
                    </div>
                  )}

                  {/* Question preview */}
                  <div className="p-3 bg-surface rounded-xl">
                    <p className="text-[10px] font-bold text-outline uppercase mb-2">{"Savol"}</p>
                    <p className="text-sm font-semibold">{part.questions[0]?.text || "..."}</p>
                  </div>

                  {/* Cue Card preview */}
                  {part.isCueCard && (
                    <div className="p-3 bg-tertiary-container/10 rounded-xl border border-tertiary/20">
                      <p className="text-[10px] font-bold text-tertiary uppercase mb-2">{"Cue Card"}</p>
                      {part.imageUrl && <img src={part.imageUrl} alt="" className="w-full h-16 object-cover rounded mb-2 opacity-70" />}
                      <ul className="space-y-1">
                        {part.cueCardPoints.filter(Boolean).map((cp, ci) => (
                          <li key={ci} className="text-[10px] text-on-surface-variant">{"• " + cp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recording indicator */}
                  <div className="p-4 bg-slate-900 rounded-xl text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-red-400 uppercase">{"Recording"}</span>
                    </div>
                    {/* Waveform simulation */}
                    <div className="flex items-center justify-center gap-[3px] h-8">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }} />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">{formatSeconds(part.responseTime) + " maks"}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={onBack} className="flex-1 py-3 bg-surface-container-highest text-on-surface font-bold rounded-2xl hover:bg-surface-dim transition-all active:scale-95">{"Orqaga"}</button>
                <button onClick={onNext} disabled={exam.parts.length === 0} className="flex-1 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-2xl shadow-lg hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  {"Keyingi"}<span className="material-symbols-outlined">{"arrow_forward"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><span className="material-symbols-outlined text-primary text-3xl">{"mic"}</span></div>
          <p className="text-on-surface-variant">{"Bo'lim qo'shing yoki IELTS tez sozlash tugmasini bosing"}</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   STEP 3: GRADING & EXPORT
   ══════════════════════════════════════════════ */
function SStep3({ exam, onBack }: { exam: SpeakingExam; onBack: () => void }) {
  const totalQ = exam.parts.reduce((s, p) => s + p.questions.length, 0);

  const handleExport = () => {
    const json = {
      exam_type: exam.examType,
      mic_check: exam.micCheckEnabled,
      allow_playback: exam.allowPlayback,
      parts: exam.parts.map((p, pi) => ({
        part_number: pi + 1,
        title: p.title,
        instruction: p.instruction,
        is_cue_card: p.isCueCard,
        cue_card_points: p.cueCardPoints.filter(Boolean),
        cue_card_image: p.imageUrl || undefined,
        prep_time: p.prepTime,
        response_time: p.responseTime,
        questions: p.questions.map((q, qi) => ({
          q_number: qi + 1,
          text: q.text,
          audio_prompt: q.audioName || undefined,
          follow_ups: q.followUps.filter(Boolean),
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "speaking_exam.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Grading Criteria */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Speaking baholash kriteriyalari"}</h3>
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(SPEAKING_CRITERIA_LABELS) as (keyof SpeakingGradingCriteria)[]).map((key) => (
              <div key={key} className="p-4 bg-surface-container-high rounded-xl flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${SPEAKING_CRITERIA_COLORS[key]}`} />
                <div>
                  <p className="text-sm font-bold">{SPEAKING_CRITERIA_LABELS[key]}</p>
                  <p className="text-[10px] text-outline">{"1.0 — 9.0"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grading Workflow */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Baholash jarayoni (Preview)"}</h3>
          <div className="space-y-4">
            {/* Simulated student card */}
            <div className="p-4 bg-surface-container-high rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-orange-600">{"person"}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{"Madina Rahimova"}</p>
                    <p className="text-[10px] text-outline">{exam.parts.length + " ta part · " + totalQ + " savol"}</p>
                  </div>
                </div>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold">{"⏳ Tekshirilmagan"}</span>
              </div>

              {/* Audio player preview */}
              <div className="p-3 bg-slate-900 rounded-xl flex items-center gap-3 mb-4">
                <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{"play_arrow"}</span>
                </button>
                <div className="flex-grow">
                  <div className="h-1.5 bg-white/20 rounded-full"><div className="h-full w-1/3 bg-emerald-400 rounded-full" /></div>
                  <div className="flex justify-between mt-1"><span className="text-[10px] text-slate-500">{"0:00"}</span><span className="text-[10px] text-slate-500">{"1:45"}</span></div>
                </div>
                <div className="flex gap-1">
                  <button className="px-2 py-1 bg-white/10 rounded text-[10px] text-white font-bold">{"x1"}</button>
                  <button className="px-2 py-1 bg-white/5 rounded text-[10px] text-slate-400 font-bold hover:bg-white/10">{"x1.5"}</button>
                </div>
              </div>

              {/* Criteria */}
              <div className="space-y-2">
                {(Object.keys(SPEAKING_CRITERIA_LABELS) as (keyof SpeakingGradingCriteria)[]).map((key) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-outline w-8">{key}</span>
                    <div className="flex-grow h-2 bg-surface-container-lowest rounded-full overflow-hidden"><div className={`h-full rounded-full ${SPEAKING_CRITERIA_COLORS[key]} opacity-30`} style={{ width: "0%" }} /></div>
                    <span className="text-[10px] font-bold text-outline w-8 text-right">{"—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Feedback */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-lg">{"mic"}</span>
                <p className="text-xs font-bold text-primary">{"Ovozli feedback (Premium)"}</p>
              </div>
              <p className="text-[10px] text-on-surface-variant">{"Ustoz o'zining ovozli izohini yozib qoldirishi mumkin — bu o'quvchiga shaxsiy yondashuvni ta'minlaydi."}</p>
            </div>
          </div>
        </div>

        {/* Part Summary */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Bo'limlar tarkibi"}</h3>
          <div className="space-y-3">
            {exam.parts.map((p, i) => (
              <div key={p.id} className="p-4 bg-surface-container-high rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-xs">{i + 1}</span>
                    <span className="text-sm font-bold">{p.title}</span>
                  </div>
                  <span className="text-[10px] text-outline">{p.questions.length + " savol"}</span>
                </div>
                <div className="flex gap-4 text-[10px] text-outline">
                  <span>{"⏱ Tayyor: " + formatSeconds(p.prepTime)}</span>
                  <span>{"🎙 Javob: " + formatSeconds(p.responseTime)}</span>
                  {p.isCueCard && <span className="text-tertiary font-bold">{"📋 Cue Card"}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="col-span-12 lg:col-span-4">
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <h3 className="font-headline font-extrabold text-lg mb-4">{"Yakuniy xulosa"}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs"><span className="text-outline">{"Format:"}</span><span className="font-bold">{SPEAKING_EXAM_LABELS[exam.examType]}</span></div>
              <div className="flex justify-between text-xs"><span className="text-outline">{"Bo'limlar:"}</span><span className="font-bold">{exam.parts.length + " ta"}</span></div>
              <div className="flex justify-between text-xs"><span className="text-outline">{"Savollar:"}</span><span className="font-bold">{totalQ + " ta"}</span></div>
              <div className="flex justify-between text-xs"><span className="text-outline">{"Mic Check:"}</span><span className="font-bold">{exam.micCheckEnabled ? "✅" : "❌"}</span></div>
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
              <span className="font-bold text-xs text-tertiary">{"Texnik maslahat"}</span>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              {"O'quvchi imtihon paytida MediaRecorder API orqali ovozi yoziladi. Internet uzilsa, IndexedDB ga saqlanadi va keyinroq avtomatik yuboriladi."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN SPEAKING PANEL
   ══════════════════════════════════════════════ */
export default function SpeakingPanel() {
  const [step, setStep] = useState(0);
  const [exam, setExam] = useState<SpeakingExam>(defaultSpeakingExam);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.parts && draft.parts.length > 0) {
      setExam((p) => ({
        ...p,
        examType: draft.examType || p.examType,
        micCheckEnabled: draft.micCheckEnabled ?? p.micCheckEnabled,
        allowPlayback: draft.allowPlayback ?? p.allowPlayback,
        parts: (draft.parts || []) as SpeakingPart[],
      }));
    }
  }, []);

  useEffect(() => {
    if (exam.parts.length > 0) {
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
      {step === 0 && <SStep1 exam={exam} setExam={setExam} onNext={() => setStep(1)} />}
      {step === 1 && <SStep2 exam={exam} setExam={setExam} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <SStep3 exam={exam} onBack={() => setStep(1)} />}
    </div>
  );
}
