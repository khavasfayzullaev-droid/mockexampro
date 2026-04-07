"use client";
import React, { useState } from "react";
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
  const [examTitle] = useState("Mid-Term Proficiency Exam");

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              {"EXAM BUILDER"}
            </span>
            <h2 className="text-2xl font-extrabold font-headline text-on-surface">{examTitle}</h2>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-surface-container-highest text-on-surface font-semibold text-sm hover:opacity-90 transition-all active:scale-95">
              {"Preview"}
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95">
              {"Publish Exam"}
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
