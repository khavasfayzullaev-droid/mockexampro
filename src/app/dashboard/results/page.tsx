"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ResultsPage() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Imtihon Natijalari</h1>
        <p className="text-on-surface-variant">Sizning Mock #45 bo&apos;yicha yakuniy hisobotingiz</p>
      </div>

      <div className={`transition-all duration-1000 transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Main Certificate Card */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-ambient-lg border border-outline-variant/20 relative overflow-hidden text-center max-w-3xl mx-auto">
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-success/5 to-transparent rounded-tr-full pointer-events-none"></div>
           
           <div className="relative z-10">
             <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-dark to-primary-container text-white rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 shadow-lg shadow-primary/30">M</div>
             <h2 className="uppercase tracking-widest text-outline font-bold text-sm mb-2">Mock Exam Pro Result</h2>
             <h3 className="text-3xl font-bold mb-10 text-on-surface">Test Report Form</h3>

             {/* Band Score Circle */}
             <div className="w-40 h-40 mx-auto rounded-full border-8 border-surface-container flex flex-col items-center justify-center relative my-10 shadow-[inset_0_4px_20px_rgba(0,0,0,0.05)]">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="72" fill="none" strokeWidth="8" className="stroke-success" strokeDasharray="452.4" strokeDashoffset={452.4 - (452.4 * 7.5) / 9}></circle>
                </svg>
                <span className="text-5xl font-black text-on-surface">7.5</span>
                <span className="text-sm font-bold text-outline uppercase tracking-widest mt-1">Overall Band</span>
             </div>

             {/* 4 Skills */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-12">
                {[
                  { name: "Listening", score: "8.0", color: "bg-primary/10 text-primary" },
                  { name: "Reading", score: "8.5", color: "bg-success/10 text-success" },
                  { name: "Writing", score: "6.5", color: "bg-warning/10 text-warning" },
                  { name: "Speaking", score: "7.0", color: "bg-primary/10 text-primary" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface border border-outline-variant/30">
                     <span className="text-sm font-medium text-on-surface-variant">{s.name}</span>
                     <span className={`text-2xl font-black py-1 px-4 rounded-xl ${s.color}`}>{s.score}</span>
                  </div>
                ))}
             </div>

             <div className="h-px w-full bg-outline-variant/30 my-8"></div>

             <div className="text-left bg-surface-container-low p-6 rounded-2xl">
               <h4 className="font-bold mb-2 flex items-center gap-2">
                 <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-primary"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 O&apos;qituvchi izohi (Feedback)
               </h4>
               <p className="text-on-surface-variant text-sm leading-relaxed italic">
                 &quot;Sizning Reading va Listening natijalaringiz ajoyib! Biroq Writing bo&apos;limida Grammar va Lexical Resource ustida ko&apos;proq ishlashingizni maslahat beraman. Argumentlarni kengaytirishga e&apos;tibor qarating.&quot;
               </p>
               <p className="text-sm font-bold mt-3 text-on-surface">— Teacher Maftuna</p>
             </div>

           </div>
        </div>

        <div className="flex justify-center mt-10 gap-4">
          <button className="btn-secondary bg-white shadow-sm flex items-center gap-2 font-bold px-8">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Sertifikatni yuklash
          </button>
          <Link href="/dashboard" className="btn-primary shadow-ambient px-8 font-bold">
            Asosiy panelga qaytish
          </Link>
        </div>

      </div>
    </div>
  );
}
