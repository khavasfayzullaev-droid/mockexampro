"use client";
import ExamHeader from "@/components/ExamHeader";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function WritingTest() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(true);

  // Auto-save simulation
  useEffect(() => {
    if (text === "") return;
    setSaved(false);
    const delay = setTimeout(() => {
      setSaved(true);
    }, 1500);
    return () => clearTimeout(delay);
  }, [text]);

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  return (
    <div className="min-h-screen bg-bg flex flex-col h-screen overflow-hidden">
      <ExamHeader title="Full IELTS Mock Test #45" section="Yozish (Writing) - 3/4" initialMinutes={60} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Pane - Instructions */}
        <div className="w-full lg:w-[45%] overflow-y-auto bg-surface p-6 md:p-8 border-r border-outline-variant/30">
          <div className="card shadow-sm border border-outline-variant/30 sticky top-0">
             <h2 className="text-xl font-bold mb-4 bg-primary text-white py-2 px-4 rounded-lg inline-block">Task 2</h2>
             <p className="text-on-surface-variant font-medium mb-6">You should spend about 40 minutes on this task.</p>
             <p className="text-on-surface mb-6">Write about the following topic:</p>
             
             <div className="p-5 border-l-4 border-primary bg-primary/5 rounded-r-lg mb-6">
                <p className="text-lg font-semibold italic text-on-surface">
                  &quot;Some people believe that the purpose of education is to prepare individuals for the workforce, while others argue that its main purpose should be personal development.&quot;
                </p>
                <p className="mt-4 text-base font-semibold">
                  Discuss both views and give your own opinion.
                </p>
             </div>

             <p className="text-on-surface-variant text-sm mb-4">
                Give reasons for your answer and include any relevant examples from your own knowledge or experience.
             </p>
             <p className="text-on-surface font-bold">Write at least 250 words.</p>
          </div>
        </div>

        {/* Right Pane - Text Editor */}
        <div className="flex-1 flex flex-col bg-white relative">
          
          <div className="absolute inset-0 p-6 sm:p-10 pb-24 overflow-y-auto">
            <textarea 
              className="w-full h-full min-h-[500px] resize-none outline-none text-lg leading-relaxed text-on-surface placeholder:text-outline-variant bg-transparent"
              placeholder="Javobingizni shu yerga yozing..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
            ></textarea>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-outline-variant/30 p-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                 <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">So&apos;zlar soni</span>
                 <span className={`text-xl font-bold ${wordCount < 250 ? 'text-warning' : 'text-success'}`}>{wordCount}</span>
              </div>
              <div className="h-10 w-px bg-outline-variant/30"></div>
              <div className="flex items-center gap-2">
                 {saved ? (
                   <>
                    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm font-medium text-success">Saqlangan</span>
                   </>
                 ) : (
                   <>
                    <div className="w-4 h-4 border-2 border-outline/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-sm font-medium text-on-surface-variant">Saqlanmoqda...</span>
                   </>
                 )}
              </div>
            </div>

            <Link href="/dashboard/exams/speaking" className="btn-primary py-3 px-8">
              Keyingi bo&apos;lim (Speaking)
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
