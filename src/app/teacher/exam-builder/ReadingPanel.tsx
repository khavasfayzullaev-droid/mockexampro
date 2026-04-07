"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ReadingExam,
  ReadingSection,
  ReadingQuestion,
  ReadingQuestionType,
  ReadingExamType,
  CEFRLevel,
  READING_EXAM_LABELS,
  RQ_LABELS,
  RQ_ICONS,
  uid,
  createReadingQuestion,
  createReadingSection,
  defaultReadingExam,
} from "./readingTypes";

const STORAGE_KEY = "reading_exam_v2";

function saveDraft(exam: ReadingExam) {
  try {
    const s = {
      settings: exam.settings,
      sections: exam.sections.map((sec) => ({ ...sec, imageFile: null })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

function loadDraft(): Partial<ReadingExam> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

/* ══════════════════════════════════════════════
   STEP INDICATOR
   ══════════════════════════════════════════════ */
const STEPS = [
  { label: "Umumiy sozlamalar", icon: "settings" },
  { label: "Passage yaratish", icon: "article" },
  { label: "Savollar konstruktori", icon: "edit_note" },
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
   RICH TEXT EDITOR (contentEditable based)
   ══════════════════════════════════════════════ */
function RichTextEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current && editorRef.current) {
      editorRef.current.innerHTML = content;
      isInitialMount.current = false;
    }
  }, [content]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  const btnClass = "p-1.5 rounded-lg hover:bg-surface-container-highest transition-all text-on-surface-variant";

  return (
    <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-surface-container-high border-b border-outline-variant/20 flex-wrap">
        <button onClick={() => exec("bold")} className={btnClass} title="Qalin">
          <span className="material-symbols-outlined text-lg">{"format_bold"}</span>
        </button>
        <button onClick={() => exec("italic")} className={btnClass} title="Kursiv">
          <span className="material-symbols-outlined text-lg">{"format_italic"}</span>
        </button>
        <button onClick={() => exec("underline")} className={btnClass} title="Tagiga chizish">
          <span className="material-symbols-outlined text-lg">{"format_underlined"}</span>
        </button>
        <div className="w-[1px] h-5 bg-outline-variant/30 mx-1" />
        <button onClick={() => exec("formatBlock", "h3")} className={btnClass} title="Sarlavha">
          <span className="material-symbols-outlined text-lg">{"title"}</span>
        </button>
        <button onClick={() => exec("formatBlock", "p")} className={btnClass} title="Oddiy matn">
          <span className="material-symbols-outlined text-lg">{"notes"}</span>
        </button>
        <div className="w-[1px] h-5 bg-outline-variant/30 mx-1" />
        <button onClick={() => exec("insertUnorderedList")} className={btnClass} title="Ro'yxat">
          <span className="material-symbols-outlined text-lg">{"format_list_bulleted"}</span>
        </button>
        <button onClick={() => exec("insertOrderedList")} className={btnClass} title="Raqamli ro'yxat">
          <span className="material-symbols-outlined text-lg">{"format_list_numbered"}</span>
        </button>
      </div>
      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        className="p-6 min-h-[250px] outline-none text-sm leading-relaxed prose prose-sm max-w-none"
        onInput={() => {
          if (editorRef.current) onChange(editorRef.current.innerHTML);
        }}
        suppressContentEditableWarning
      />
    </div>
  );
}

/* ══════════════════════════════════════════════
   STEP 1: GENERAL SETTINGS
   ══════════════════════════════════════════════ */
function ReadingStep1({
  exam,
  setExam,
  onNext,
}: {
  exam: ReadingExam;
  setExam: React.Dispatch<React.SetStateAction<ReadingExam>>;
  onNext: () => void;
}) {
  const s = exam.settings;
  const update = (p: Partial<typeof s>) =>
    setExam((prev) => ({ ...prev, settings: { ...prev.settings, ...p } }));

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Exam Type */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Imtihon turi"}</h3>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(READING_EXAM_LABELS) as ReadingExamType[]).map((t) => (
              <button
                key={t}
                onClick={() => update({ examType: t })}
                className={`p-4 rounded-xl text-sm font-bold transition-all text-center ${
                  s.examType === t
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                {READING_EXAM_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Timer & Settings */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">{"Sozlamalar"}</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                {"Vaqt (daqiqa)"}
              </label>
              <input
                type="number"
                min={1}
                value={s.timeLimit}
                onChange={(e) => update({ timeLimit: Number(e.target.value) || 1 })}
                className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm font-bold outline-none focus:bg-surface-container-lowest transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                {"Highlighter vositasi"}
              </label>
              <button
                onClick={() => update({ highlighterEnabled: !s.highlighterEnabled })}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  s.highlighterEnabled
                    ? "bg-primary text-white"
                    : "bg-surface-container-high text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{"highlight"}</span>
                {s.highlighterEnabled ? "Yoqilgan" : "O'chirilgan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <h3 className="font-headline font-extrabold text-lg mb-4">{"Xulosa"}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Turi:"}</span>
                <span className="font-bold">{READING_EXAM_LABELS[s.examType]}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Vaqt:"}</span>
                <span className="font-bold">{s.timeLimit + " daq"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-outline">{"Highlighter:"}</span>
                <span className="font-bold">{s.highlighterEnabled ? "✅" : "❌"}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onNext}
            className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {"Keyingi"}
            <span className="material-symbols-outlined">{"arrow_forward"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STEP 2: PASSAGE EDITOR
   ══════════════════════════════════════════════ */
function ReadingStep2({
  exam,
  setExam,
  onNext,
  onBack,
}: {
  exam: ReadingExam;
  setExam: React.Dispatch<React.SetStateAction<ReadingExam>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const isCEFR = exam.settings.examType === "CEFR_MULTI";

  const updateSection = (idx: number, patch: Partial<ReadingSection>) =>
    setExam((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));

  const deleteSection = (idx: number) => {
    setExam((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== idx),
    }));
    if (activeIdx >= exam.sections.length - 1 && activeIdx > 0) setActiveIdx(activeIdx - 1);
  };

  const sec = exam.sections[activeIdx];

  return (
    <div className="space-y-6">
      {/* Passage Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {exam.sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveIdx(i)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              i === activeIdx
                ? "bg-primary text-white shadow-md"
                : "bg-surface-container-high text-on-surface hover:bg-surface-dim"
            }`}
          >
            {s.title}
          </button>
        ))}
        <button
          onClick={() => {
            setExam((prev) => ({
              ...prev,
              sections: [...prev.sections, createReadingSection(prev.sections.length)],
            }));
            setActiveIdx(exam.sections.length);
          }}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">{"add"}</span>
          {"Yangi Passage"}
        </button>
      </div>

      {sec ? (
        <div className="grid grid-cols-12 gap-8">
          {/* Left: Editor */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-3">
              <input
                className="text-xl font-bold font-headline bg-transparent outline-none flex-grow focus:bg-surface-container-high focus:rounded-lg focus:p-2 transition-all"
                value={sec.title}
                onChange={(e) => updateSection(activeIdx, { title: e.target.value })}
                placeholder="Passage sarlavhasi"
              />
              {isCEFR && (
                <select
                  value={sec.cefrLevel || ""}
                  onChange={(e) =>
                    updateSection(activeIdx, {
                      cefrLevel: (e.target.value || undefined) as CEFRLevel | undefined,
                    })
                  }
                  className="text-xs font-bold bg-surface-container-high border-none rounded-lg py-2 px-3 outline-none"
                >
                  <option value="">{"Daraja"}</option>
                  <option value="A2">{"A2"}</option>
                  <option value="B1">{"B1"}</option>
                  <option value="B2">{"B2"}</option>
                  <option value="C1">{"C1"}</option>
                </select>
              )}
              <button
                onClick={() => deleteSection(activeIdx)}
                className="p-2 text-outline hover:text-error rounded-lg transition-all"
              >
                <span className="material-symbols-outlined">{"delete"}</span>
              </button>
            </div>

            {/* Rich Text Editor */}
            <RichTextEditor
              content={sec.content}
              onChange={(html) => updateSection(activeIdx, { content: html })}
            />

            {/* Image upload */}
            <div className="flex items-center gap-4">
              {sec.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden bg-slate-50 w-48">
                  <img src={sec.imageUrl} alt="Passage" className="w-full h-24 object-cover" />
                  <button
                    onClick={() => {
                      if (sec.imageUrl) URL.revokeObjectURL(sec.imageUrl);
                      updateSection(activeIdx, { imageUrl: null, imageFile: null });
                    }}
                    className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-error"
                  >
                    <span className="material-symbols-outlined text-sm">{"close"}</span>
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-xl cursor-pointer hover:bg-surface-dim transition-all text-sm font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">{"image"}</span>
                  {"Rasm / Diagramma qo'shish"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const url = URL.createObjectURL(f);
                        updateSection(activeIdx, { imageFile: f, imageUrl: url });
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Right: Split-Screen Preview */}
          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-surface-container-high px-4 py-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                    {"O'quvchi ko'rinishi"}
                  </span>
                  <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {"Preview"}
                  </span>
                </div>
                <div className="p-4 max-h-[500px] overflow-y-auto">
                  <h4 className="font-bold text-sm mb-3">{sec.title}</h4>
                  {sec.imageUrl && (
                    <img src={sec.imageUrl} alt="" className="w-full rounded-lg mb-3" />
                  )}
                  <div
                    className="prose prose-xs max-w-none text-xs leading-relaxed opacity-70"
                    dangerouslySetInnerHTML={{ __html: sec.content || "<p class='text-outline'>Matn hali kiritilmagan...</p>" }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className="flex-1 py-3 bg-surface-container-highest text-on-surface font-bold rounded-2xl hover:bg-surface-dim transition-all active:scale-95"
                >
                  {"Orqaga"}
                </button>
                <button
                  onClick={onNext}
                  disabled={exam.sections.length === 0}
                  className="flex-1 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-2xl shadow-lg hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {"Keyingi"}
                  <span className="material-symbols-outlined">{"arrow_forward"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm">
          <p className="text-on-surface-variant">{"Passage yaratish uchun \"Yangi Passage\" tugmasini bosing"}</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   QUESTION EDITORS (per type)
   ══════════════════════════════════════════════ */
function QMCQEditor({ q, onChange }: { q: ReadingQuestion & { type: "MCQ" }; onChange: (q: ReadingQuestion) => void }) {
  return (
    <div className="space-y-3">
      <input className="w-full text-sm font-bold bg-surface-container-high border-none rounded-xl p-3 outline-none focus:bg-surface-container-lowest transition-all" value={q.text} onChange={(e) => onChange({ ...q, text: e.target.value })} placeholder="Savol matni..." />
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-3 group">
            <button onClick={() => onChange({ ...q, correctAnswer: opt.label })} className={`w-8 h-8 border-2 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${q.correctAnswer === opt.label ? "border-primary bg-primary text-white" : "border-outline-variant text-outline hover:border-primary/50"}`}>{opt.label}</button>
            <input className="flex-grow bg-surface-container-low border-none rounded-xl p-3 text-sm outline-none focus:bg-white transition-all" value={opt.text} onChange={(e) => { const n = [...q.options]; n[i] = { ...n[i], text: e.target.value }; onChange({ ...q, options: n }); }} placeholder={`${opt.label}-variant`} />
            {q.options.length > 2 && <button onClick={() => onChange({ ...q, options: q.options.filter(o => o.id !== opt.id) })} className="opacity-0 group-hover:opacity-100 p-1 text-outline-variant hover:text-error"><span className="material-symbols-outlined text-sm">{"close"}</span></button>}
          </div>
        ))}
      </div>
      <button onClick={() => { const l = String.fromCharCode(65 + q.options.length); onChange({ ...q, options: [...q.options, { id: uid(), label: l, text: "" }] }); }} className="flex items-center gap-2 text-primary font-bold text-xs hover:opacity-70">
        <span className="material-symbols-outlined text-sm">{"add_circle"}</span>{"Variant qo'shish"}
      </button>
    </div>
  );
}

function QTFNGEditor({ q, onChange }: { q: ReadingQuestion & { type: "TFNG" }; onChange: (q: ReadingQuestion) => void }) {
  const opts = ["TRUE", "FALSE", "NOT GIVEN"] as const;
  return (
    <div className="space-y-3">
      <input className="w-full text-sm font-bold bg-surface-container-high border-none rounded-xl p-3 outline-none focus:bg-surface-container-lowest transition-all" value={q.text} onChange={(e) => onChange({ ...q, text: e.target.value })} placeholder="Gapni kiriting..." />
      <div className="flex gap-2">
        {opts.map((o) => (
          <button key={o} onClick={() => onChange({ ...q, correctAnswer: o })} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${q.correctAnswer === o ? "bg-primary text-white" : "bg-surface-container-high text-on-surface hover:bg-surface-dim"}`}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function QYNNGEditor({ q, onChange }: { q: ReadingQuestion & { type: "YNNG" }; onChange: (q: ReadingQuestion) => void }) {
  const opts = ["YES", "NO", "NOT GIVEN"] as const;
  return (
    <div className="space-y-3">
      <input className="w-full text-sm font-bold bg-surface-container-high border-none rounded-xl p-3 outline-none focus:bg-surface-container-lowest transition-all" value={q.text} onChange={(e) => onChange({ ...q, text: e.target.value })} placeholder="Gapni kiriting..." />
      <div className="flex gap-2">
        {opts.map((o) => (
          <button key={o} onClick={() => onChange({ ...q, correctAnswer: o })} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${q.correctAnswer === o ? "bg-primary text-white" : "bg-surface-container-high text-on-surface hover:bg-surface-dim"}`}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function QMatchHeadingsEditor({ q, onChange }: { q: ReadingQuestion & { type: "MATCHING_HEADINGS" }; onChange: (q: ReadingQuestion) => void }) {
  return (
    <div className="space-y-3">
      <input className="w-full text-sm bg-surface-container-high border-none rounded-xl p-3 outline-none focus:bg-surface-container-lowest transition-all" value={q.instruction} onChange={(e) => onChange({ ...q, instruction: e.target.value })} placeholder="Yo'riqnoma..." />
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{"Sarlavhalar"}</p>
        {q.headings.map((h, i) => (
          <div key={h.id} className="flex items-center gap-3 group">
            <span className="text-xs font-bold text-outline w-4">{(i + 1) + "."}</span>
            <input className="flex-grow bg-surface-container-low border-none rounded-xl p-3 text-sm outline-none focus:bg-white transition-all" value={h.text} onChange={(e) => { const n = [...q.headings]; n[i] = { ...n[i], text: e.target.value }; onChange({ ...q, headings: n }); }} placeholder="Sarlavha matni" />
            {q.headings.length > 2 && <button onClick={() => onChange({ ...q, headings: q.headings.filter((hh) => hh.id !== h.id) })} className="opacity-0 group-hover:opacity-100 p-1 text-outline-variant hover:text-error"><span className="material-symbols-outlined text-sm">{"close"}</span></button>}
          </div>
        ))}
        <button onClick={() => onChange({ ...q, headings: [...q.headings, { id: uid(), text: "" }] })} className="flex items-center gap-2 text-primary font-bold text-xs hover:opacity-70"><span className="material-symbols-outlined text-sm">{"add_circle"}</span>{"Sarlavha qo'shish"}</button>
      </div>
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{"Paragraf → Sarlavha mosligi"}</p>
        {q.paragraphs.map((p) => (
          <div key={p} className="flex items-center gap-3">
            <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-sm">{p}</span>
            <select value={q.correctMapping[p] || ""} onChange={(e) => onChange({ ...q, correctMapping: { ...q.correctMapping, [p]: e.target.value } })} className="flex-grow bg-surface-container-low border-none rounded-xl p-3 text-sm outline-none">
              <option value="">{"Tanlang..."}</option>
              {q.headings.map((h, hi) => <option key={h.id} value={h.id}>{(hi + 1) + ". " + (h.text || "—")}</option>)}
            </select>
          </div>
        ))}
        <button onClick={() => { const n = String.fromCharCode(65 + q.paragraphs.length); onChange({ ...q, paragraphs: [...q.paragraphs, n] }); }} className="flex items-center gap-2 text-primary font-bold text-xs hover:opacity-70"><span className="material-symbols-outlined text-sm">{"add_circle"}</span>{"Paragraf qo'shish"}</button>
      </div>
    </div>
  );
}

function QSentenceCompEditor({ q, onChange }: { q: ReadingQuestion & { type: "SENTENCE_COMPLETION" }; onChange: (q: ReadingQuestion) => void }) {
  const gaps = (q.text.match(/\[\d+\]/g) || []).map((g) => Number(g.replace(/[[\]]/g, "")));
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] text-on-surface-variant font-bold mb-2 uppercase tracking-widest">{"[1], [2] shaklida bo'sh joy qo'ying"}</p>
        <textarea className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm min-h-[80px] outline-none resize-none focus:bg-white transition-all" value={q.text} onChange={(e) => onChange({ ...q, text: e.target.value })} placeholder="The experiment was conducted in [1] using [2] method." />
      </div>
      {gaps.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{"Javoblar (sinonimlar vergul bilan)"}</p>
          {gaps.map((gn) => (
            <div key={gn} className="flex items-center gap-3">
              <span className="w-8 h-8 bg-secondary-container/30 rounded-lg flex items-center justify-center text-xs font-bold">{"[" + gn + "]"}</span>
              <input className="flex-grow bg-surface-container-low border-none rounded-xl p-3 text-sm outline-none focus:bg-white transition-all" value={(q.answers[gn] || []).join(", ")} onChange={(e) => { const v = e.target.value.split(",").map(s => s.trim()).filter(Boolean); onChange({ ...q, answers: { ...q.answers, [gn]: v } }); }} placeholder="javob1, sinonim1" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QMatchInfoEditor({ q, onChange }: { q: ReadingQuestion & { type: "MATCHING_INFO" }; onChange: (q: ReadingQuestion) => void }) {
  return (
    <div className="space-y-3">
      <input className="w-full text-sm bg-surface-container-high border-none rounded-xl p-3 outline-none focus:bg-surface-container-lowest transition-all" value={q.instruction} onChange={(e) => onChange({ ...q, instruction: e.target.value })} placeholder="Yo'riqnoma: Qaysi paragrafda berilgan?" />
      <div className="space-y-2">
        {q.statements.map((st, i) => (
          <div key={st.id} className="flex items-center gap-3 group">
            <span className="text-xs font-bold text-outline w-4">{(i + 1) + "."}</span>
            <input className="flex-grow bg-surface-container-low border-none rounded-xl p-3 text-sm outline-none focus:bg-white transition-all" value={st.text} onChange={(e) => { const n = [...q.statements]; n[i] = { ...n[i], text: e.target.value }; onChange({ ...q, statements: n }); }} placeholder="Gap..." />
            <input className="w-12 bg-surface-container-high border-none rounded-lg p-2 text-sm text-center font-bold outline-none" value={st.correctParagraph} onChange={(e) => { const n = [...q.statements]; n[i] = { ...n[i], correctParagraph: e.target.value.toUpperCase() }; onChange({ ...q, statements: n }); }} placeholder="A" maxLength={2} />
            {q.statements.length > 1 && <button onClick={() => onChange({ ...q, statements: q.statements.filter(s => s.id !== st.id) })} className="opacity-0 group-hover:opacity-100 p-1 text-outline-variant hover:text-error"><span className="material-symbols-outlined text-sm">{"close"}</span></button>}
          </div>
        ))}
      </div>
      <button onClick={() => onChange({ ...q, statements: [...q.statements, { id: uid(), text: "", correctParagraph: "" }] })} className="flex items-center gap-2 text-primary font-bold text-xs hover:opacity-70"><span className="material-symbols-outlined text-sm">{"add_circle"}</span>{"Gap qo'shish"}</button>
    </div>
  );
}

/* ── Universal Question Card ── */
function ReadingQCard({ q, index, isCEFR, onChange, onDelete }: { q: ReadingQuestion; index: number; isCEFR: boolean; onChange: (q: ReadingQuestion) => void; onDelete: () => void }) {
  const colors: Record<string, string> = { MCQ: "border-tertiary", MCQ_MULTI: "border-tertiary", TFNG: "border-error", YNNG: "border-error", MATCHING_HEADINGS: "border-primary", SENTENCE_COMPLETION: "border-secondary", MATCHING_INFO: "border-primary" };
  const lc: Record<string, string> = { MCQ: "text-tertiary", MCQ_MULTI: "text-tertiary", TFNG: "text-error", YNNG: "text-error", MATCHING_HEADINGS: "text-primary", SENTENCE_COMPLETION: "text-secondary", MATCHING_INFO: "text-primary" };

  return (
    <div className={`bg-surface-container-lowest p-5 rounded-2xl shadow-sm border-l-4 ${colors[q.type]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-widest ${lc[q.type]}`}>{(index + 1) + "-savol"}</span>
          <span className="text-[10px] text-outline bg-surface-container-high px-2 py-0.5 rounded-full">{RQ_LABELS[q.type]}</span>
        </div>
        <div className="flex items-center gap-2">
          {isCEFR && (
            <select value={q.cefrLevel || ""} onChange={(e) => onChange({ ...q, cefrLevel: (e.target.value || undefined) as CEFRLevel | undefined })} className="text-[10px] font-bold bg-surface-container-high border-none rounded-lg py-1 px-2 outline-none">
              <option value="">{"Daraja"}</option>
              <option value="A2">{"A2"}</option><option value="B1">{"B1"}</option><option value="B2">{"B2"}</option><option value="C1">{"C1"}</option>
            </select>
          )}
          <button onClick={onDelete} className="p-1 text-outline hover:text-error transition-all"><span className="material-symbols-outlined text-lg">{"delete"}</span></button>
        </div>
      </div>
      {q.type === "MCQ" && <QMCQEditor q={q} onChange={onChange} />}
      {q.type === "MCQ_MULTI" && <QMCQEditor q={q as any} onChange={onChange} />}
      {q.type === "TFNG" && <QTFNGEditor q={q} onChange={onChange} />}
      {q.type === "YNNG" && <QYNNGEditor q={q} onChange={onChange} />}
      {q.type === "MATCHING_HEADINGS" && <QMatchHeadingsEditor q={q} onChange={onChange} />}
      {q.type === "SENTENCE_COMPLETION" && <QSentenceCompEditor q={q} onChange={onChange} />}
      {q.type === "MATCHING_INFO" && <QMatchInfoEditor q={q} onChange={onChange} />}
    </div>
  );
}

/* ══════════════════════════════════════════════
   STEP 3: QUESTION BUILDER (Split Screen)
   ══════════════════════════════════════════════ */
function ReadingStep3({ exam, setExam, onBack }: { exam: ReadingExam; setExam: React.Dispatch<React.SetStateAction<ReadingExam>>; onBack: () => void }) {
  const [activeSection, setActiveSection] = useState(0);
  const isCEFR = exam.settings.examType === "CEFR_MULTI";
  const sec = exam.sections[activeSection];
  if (!sec) return null;

  const updateQ = (qi: number, q: ReadingQuestion) => {
    setExam((prev) => {
      const ns = [...prev.sections];
      const nq = [...ns[activeSection].questions];
      nq[qi] = q;
      ns[activeSection] = { ...ns[activeSection], questions: nq };
      return { ...prev, sections: ns };
    });
  };

  const deleteQ = (qi: number) => {
    setExam((prev) => {
      const ns = [...prev.sections];
      ns[activeSection] = { ...ns[activeSection], questions: ns[activeSection].questions.filter((_, i) => i !== qi) };
      return { ...prev, sections: ns };
    });
  };

  const addQ = (type: ReadingQuestionType) => {
    setExam((prev) => {
      const ns = [...prev.sections];
      ns[activeSection] = { ...ns[activeSection], questions: [...ns[activeSection].questions, createReadingQuestion(type)] };
      return { ...prev, sections: ns };
    });
  };

  const totalQ = exam.sections.reduce((s, sec2) => s + sec2.questions.length, 0);

  const handleExport = () => {
    const json = {
      exam_title: "Reading Exam",
      exam_type: exam.settings.examType,
      time_limit: exam.settings.timeLimit,
      highlighter: exam.settings.highlighterEnabled,
      sections: exam.sections.map((s) => ({
        passage_title: s.title,
        content: s.content,
        cefr_level: s.cefrLevel,
        questions: s.questions.map((q, qi) => ({
          q_number: qi + 1,
          type: q.type,
          ...(q.type === "MCQ" ? { question_text: q.text, options: q.options.map(o => o.label), correct_answer: q.correctAnswer } : {}),
          ...(q.type === "TFNG" ? { question_text: q.text, correct_answer: q.correctAnswer } : {}),
          ...(q.type === "YNNG" ? { question_text: q.text, correct_answer: q.correctAnswer } : {}),
          ...(q.type === "SENTENCE_COMPLETION" ? { question_text: q.text, correct_answer: Object.values(q.answers) } : {}),
          ...(q.type === "MATCHING_HEADINGS" ? { instruction: q.instruction, correct_answer: q.correctMapping } : {}),
          ...(q.type === "MATCHING_INFO" ? { instruction: q.instruction, correct_answer: q.statements.map(s => ({ text: s.text, paragraph: s.correctParagraph })) } : {}),
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "reading_exam.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {exam.sections.map((s, i) => (
          <button key={s.id} onClick={() => setActiveSection(i)} className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${i === activeSection ? "bg-primary text-white shadow-md" : "bg-surface-container-high text-on-surface hover:bg-surface-dim"}`}>
            {s.title}<span className="ml-2 opacity-60">{"(" + s.questions.length + ")"}</span>
          </button>
        ))}
      </div>

      {/* Split Screen: Passage (left) + Questions (right) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Passage content (scrollable) */}
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-24 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-surface-container-high px-4 py-3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{"📖 Passage"}</span>
              {sec.cefrLevel && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">{sec.cefrLevel}</span>}
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <h3 className="font-bold font-headline text-base mb-4">{sec.title}</h3>
              {sec.imageUrl && <img src={sec.imageUrl} alt="" className="w-full rounded-lg mb-4" />}
              <div className="prose prose-sm max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: sec.content || "<p class='text-slate-400'>Matn 2-bosqichda kiritilgan...</p>" }} />
            </div>
          </div>
        </div>

        {/* Right: Questions */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          {sec.questions.map((q, qi) => (
            <ReadingQCard key={q.id} q={q} index={qi} isCEFR={isCEFR} onChange={(nq) => updateQ(qi, nq)} onDelete={() => deleteQ(qi)} />
          ))}

          {/* Add Question Buttons */}
          <div className="bg-surface-container-low/50 rounded-2xl p-5">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">{"Savol qo'shish"}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(RQ_LABELS) as ReadingQuestionType[]).map((type) => (
                <button key={type} onClick={() => addQ(type)} className="bg-surface-container-lowest p-3 rounded-xl border border-transparent hover:border-primary/20 active:scale-95 transition-all flex flex-col items-center gap-1.5 group">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{RQ_ICONS[type]}</span>
                  <span className="text-[9px] font-bold text-on-surface text-center leading-tight">{RQ_LABELS[type]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary + Actions */}
          <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline font-extrabold text-base">{"Xulosa"}</h3>
              <span className="text-xs font-bold text-primary">{totalQ + " / 40 savol"}</span>
            </div>
            {exam.sections.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 text-[10px] mb-1">
                <span className="w-5 h-5 bg-primary/10 text-primary rounded flex items-center justify-center font-bold">{i + 1}</span>
                <span className="flex-grow truncate">{s.title}</span>
                <span className="text-outline font-bold">{s.questions.length}</span>
              </div>
            ))}
            <div className="flex gap-3 mt-4">
              <button onClick={onBack} className="flex-1 py-3 bg-surface-container-highest text-on-surface font-bold rounded-xl hover:bg-surface-dim transition-all active:scale-95">{"Orqaga"}</button>
              <button onClick={handleExport} className="flex-1 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">{"publish"}</span>{"Yakunlash"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN READING PANEL
   ══════════════════════════════════════════════ */
export default function ReadingPanel() {
  const [step, setStep] = useState(0);
  const [exam, setExam] = useState<ReadingExam>(defaultReadingExam);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.sections && draft.sections.length > 0) {
      setExam((prev) => ({
        ...prev,
        settings: (draft.settings as any) || prev.settings,
        sections: (draft.sections || []) as ReadingSection[],
      }));
    }
  }, []);

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
          <span className="material-symbols-outlined text-sm">{"save"}</span>{"Saqlandi"}
        </div>
      )}
      <StepBar current={step} onStep={setStep} />
      {step === 0 && <ReadingStep1 exam={exam} setExam={setExam} onNext={() => setStep(1)} />}
      {step === 1 && <ReadingStep2 exam={exam} setExam={setExam} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <ReadingStep3 exam={exam} setExam={setExam} onBack={() => setStep(1)} />}
    </div>
  );
}
