"use client";
import ExamHeader from "@/components/ExamHeader";
import { useState } from "react";
import Link from "next/link";

export default function ListeningTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);

  return (
    <div className="min-h-screen bg-bg">
      <ExamHeader title="Full IELTS Mock Test #45" section="Eshitish (Listening) - 1/4" initialMinutes={40} />

      {/* Sticky Audio Player */}
      <div className="sticky top-[73px] z-40 bg-white border-b border-outline-variant/30 px-4 py-3 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
            ) : (
              <svg className="ml-1" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <div className="text-sm font-medium w-16">
            12:40
          </div>
        </div>
        
        {/* Progress Timeline */}
        <div className="flex-1 w-full max-w-2xl relative h-12 flex items-center">
           {/* Decorative Waveform */}
           <div className="absolute inset-0 flex items-center gap-1 opacity-20 pointer-events-none px-2 overflow-hidden">
             {Array.from({length: 80}).map((_, i) => (
                <div key={i} className="w-1.5 bg-on-surface rounded-full" style={{ height: `${Math.max(10, Math.random() * 32)}px` }}></div>
             ))}
           </div>
           {/* Actual progress bar */}
           <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden z-10 cursor-pointer">
              <div 
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              ></div>
           </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-outline"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
          <input type="range" className="w-24 accent-primary" />
        </div>
      </div>

      {/* Main Content */}
      <main className="page-container py-8 max-w-4xl max-auto space-y-6">
        
        {/* Section 1 */}
        <div className="card shadow-sm border border-outline-variant/30">
          <h2 className="text-lg font-bold mb-4 bg-surface-container py-2 px-4 rounded-lg">Part 1: Questions 1-5</h2>
          <p className="text-on-surface-variant font-medium mb-6 italic">Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.</p>
          
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 leading-loose text-lg">
              <span>Customer&apos;s name:</span>
              <span className="font-bold">John</span>
              <input type="text" className="w-48 bg-surface-container-high border-b-2 border-outline-variant focus:border-primary px-3 py-1 outline-none text-on-surface font-semibold" placeholder="1" />
            </div>
            <div className="flex flex-wrap items-center gap-3 leading-loose text-lg">
              <span>Delivery address:</span>
              <input type="text" className="w-16 bg-surface-container-high border-b-2 border-outline-variant focus:border-primary px-3 py-1 outline-none text-center font-semibold" placeholder="2" />
              <span>South Street, London</span>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="card shadow-sm border border-outline-variant/30">
          <h2 className="text-lg font-bold mb-4 bg-surface-container py-2 px-4 rounded-lg">Part 2: Questions 6-10</h2>
          <p className="text-on-surface-variant font-medium mb-6 italic">Choose the correct letter, A, B, or C.</p>
          
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="font-bold text-lg mb-2">6. The speaker says the main purpose of the museum is to:</p>
              {['Educate local children', 'Preserve ancient history', 'Attract tourists'].map((opt, i) => (
                <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors border border-transparent hover:border-outline-variant/30">
                  <input type="radio" name="q6" className="w-5 h-5 accent-primary" />
                  <span className="text-lg">{String.fromCharCode(65+i)}. {opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-8 pb-16">
          <Link href="/dashboard/exams/reading" className="btn-primary py-3 px-8 text-lg">
            Keyingi bo&apos;lim (Reading)
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
