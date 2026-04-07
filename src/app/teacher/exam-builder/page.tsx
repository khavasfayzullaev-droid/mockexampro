"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ListeningPanel from "./ListeningPanel";
import ReadingPanel from "./ReadingPanel";
import WritingPanel from "./WritingPanel";
import SpeakingPanel from "./SpeakingPanel";

const TABS = ["Listening", "Reading", "Writing", "Speaking"] as const;
type Tab = (typeof TABS)[number];

const TAB_ICONS: Record<Tab, string> = {
  Listening: "hearing",
  Reading: "menu_book",
  Writing: "edit_square",
  Speaking: "record_voice_over",
};

/* ───────────── Placeholder Panels ───────────── */
function ComingSoonPanel({ title }: { title: string }) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-surface-container-lowest rounded-2xl p-16 text-center shadow-sm">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-4xl">{"construction"}</span>
        </div>
        <h3 className="font-headline font-extrabold text-2xl mb-3">{title}</h3>
        <p className="text-on-surface-variant max-w-md mx-auto">
          {"Bu bo'lim tez orada qo'shiladi. Hozircha Listening va Reading panellaridan foydalanishingiz mumkin."}
        </p>
      </div>
    </div>
  );
}

/* ───────────── Main Page ───────────── */
export default function ExamBuilderPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Listening");
  const [examTitle, setExamTitle] = useState("Mock Exam #1");
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Seans tugagan. Iltimos qayta login qiling.");

      // 1. Create main Exam record
      const { data: examData, error: examErr } = await supabase
        .from("exams")
        .insert({
          title: examTitle,
          teacher_id: user.id,
          duration_minutes: 180,
          is_active: true
        })
        .select()
        .single();
        
      if (examErr) throw examErr;

      // 2. Extract Drafts from localStorage
      const getDraft = (key: string) => {
        try {
          const d = localStorage.getItem(key);
          return d ? JSON.parse(d) : null;
        } catch { return null; }
      };
      
      const parts = [
        { key: 'listening_exam_v2', section: 'listening' },
        { key: 'reading_exam_v2', section: 'reading' },
        { key: 'writing_exam_v2', section: 'writing' },
        { key: 'speaking_exam_v2', section: 'speaking' },
      ];

      const questionsToInsert = parts.map((p, index) => {
        const draft = getDraft(p.key);
        // We only insert if the draft has actual content (parts/sections)
        const hasContent = draft && (
          (draft.sections && draft.sections.length > 0) || 
          (draft.parts && draft.parts.length > 0) ||
          (draft.tasks && draft.tasks.length > 0)
        );

        return hasContent ? {
          exam_id: examData.id,
          section: p.section,
          question_type: 'exam_section_v1',
          content: draft,
          order_index: index + 1
        } : null;
      }).filter(Boolean);

      if (questionsToInsert.length === 0) {
        // Rollback just in case
        await supabase.from("exams").delete().eq("id", examData.id);
        throw new Error("Hech qanday bo'lim to'ldirilmagan. Kamida 1 ta qism qo'shing.");
      }

      // 3. Bulk insert sections
      const { error: insErr } = await supabase.from("questions").insert(questionsToInsert);
      if (insErr) throw insErr;

      // 4. Clean Drafts
      parts.forEach(p => localStorage.removeItem(p.key));
      
      alert("✅ Imtihon muvaffaqiyatli nashr etildi!");
      router.push("/teacher"); // Go back to teacher dashboard / library
    } catch (err: any) {
      alert("Xatolik yuz berdi: " + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              {"EXAM BUILDER"}
            </span>
            <input 
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="text-2xl font-extrabold font-headline text-on-surface bg-transparent border-none outline-none focus:bg-surface-container-high focus:px-3 focus:rounded-xl transition-all w-full max-w-sm"
              placeholder="Imtihon nomi..."
            />
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-surface-container-highest text-on-surface font-semibold text-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">{"visibility"}</span>{"Preview"}
            </button>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isPublishing ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-sm">{"publish"}</span>
              )}
              {isPublishing ? "Saqlanmoqda..." : "Publish Exam"}
            </button>
          </div>
        </div>

        {/* Skill Tabs */}
        <div className="flex gap-8 border-b border-outline-variant/20">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold transition-colors flex items-center gap-2 relative ${
                activeTab === tab ? "text-primary" : "text-slate-400 hover:text-primary"
              }`}
            >
              {activeTab === tab && (
                <span className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-primary rounded-t-full"></span>
              )}
              <span className="material-symbols-outlined text-lg">{TAB_ICONS[tab]}</span>
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === "Listening" && <ListeningPanel />}
        {activeTab === "Reading" && <ReadingPanel />}
        {activeTab === "Writing" && <WritingPanel />}
        {activeTab === "Speaking" && <SpeakingPanel />}
      </div>
    </div>
  );
}
