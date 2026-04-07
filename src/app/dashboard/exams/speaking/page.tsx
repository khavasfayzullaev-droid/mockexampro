"use client";
import ExamHeader from "@/components/ExamHeader";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SpeakingTest() {
  const [stage, setStage] = useState<"prep" | "recording" | "done">("prep");
  const [timeLeft, setTimeLeft] = useState(60); 
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (stage === "prep") {
      const timer = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) {
            setStage("recording");
            setTimeLeft(120); // 2 minutes to record
            return 120;
          }
          return p - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (stage === "recording") {
      setPulse(true);
      const timer = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) {
            setStage("done");
            setPulse(false);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col h-screen overflow-hidden">
      <ExamHeader title="Full IELTS Mock Test #45" section="Gapirish (Speaking) - 4/4" initialMinutes={15} />

      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-bg to-bg relative">
        
        {/* Cue Card */}
        <div className="w-full max-w-2xl card shadow-ambient-lg border border-outline-variant/30 mb-12 fade-in relative z-10 bg-white">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white py-1.5 px-6 rounded-full font-bold text-sm tracking-wider uppercase shadow-md">
             Part 2: Cue Card
           </div>
           
           <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold mb-6 text-on-surface">Describe a book that you enjoyed reading.</h2>
              <div className="text-left max-w-md mx-auto space-y-3 text-lg text-on-surface-variant font-medium">
                <p>You should say:</p>
                <ul className="list-disc pl-8 space-y-2">
                  <li>what the book is</li>
                  <li>what it is about</li>
                  <li>why you read it</li>
                </ul>
                <p className="pt-2">and explain why you enjoyed it.</p>
              </div>
           </div>
        </div>

        {/* Recorder Interface */}
        <div className="flex flex-col items-center gap-6 fade-in" style={{ animationDelay: "0.2s" }}>
          
          <div className="text-center h-8">
            {stage === "prep" && (
              <p className="text-warning font-bold text-lg flex items-center gap-2">
                <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Tayyorgarlik uchun vaqtingiz: <span className="text-2xl ml-1">{formatTime(timeLeft)}</span>
              </p>
            )}
            {stage === "recording" && (
              <p className="text-danger font-bold text-lg flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-danger animate-pulse"></span>
                Yozib olinmoqda... <span className="text-2xl ml-1">{formatTime(timeLeft)}</span>
              </p>
            )}
            {stage === "done" && (
              <p className="text-success font-bold text-lg flex items-center gap-2">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Ovoz muvaffaqiyatli saqlandi
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 h-32 w-full max-w-md justify-center mt-2 px-8">
            {stage === "prep" && (
               <div className="text-outline-variant font-medium text-lg">Mikrofon kutilmoqda...</div>
            )}
            {(stage === "recording" || stage === "done") && Array.from({length: 40}).map((_, i) => (
               <div 
                 key={i} 
                 className={`w-1.5 rounded-full ${stage === "done" ? "bg-success/50 h-2" : "wave-bar"}`} 
                 style={stage === "recording" ? { animationDelay: `${i * 0.05}s`, height: `${Math.max(10, Math.random() * 40)}px` } : {}}
               ></div>
            ))}
          </div>

          <div className="mt-4">
             {stage === "prep" && (
               <button onClick={() => { setStage("recording"); setTimeLeft(120); }} className="btn-primary py-4 px-10 text-lg shadow-ambient">Boshlash</button>
             )}
             {stage === "recording" && (
               <div className="pulse-record">
                 <button onClick={() => { setStage("done"); setPulse(false); }} className="w-20 h-20 bg-danger text-white rounded-full flex items-center justify-center shadow-lg relative z-10 hover:bg-danger/80">
                   <div className="w-6 h-6 bg-white rounded-sm"></div>
                 </button>
               </div>
             )}
             {stage === "done" && (
               <Link href="/dashboard/results" className="btn-primary py-4 px-10 text-lg bg-success shadow-ambient hover:shadow-success/30">
                 Imtihonni yakunlash
                 <svg className="ml-2" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
               </Link>
             )}
          </div>

        </div>

      </main>
    </div>
  );
}
