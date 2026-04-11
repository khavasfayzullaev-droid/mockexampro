"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function GradingCenter() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  
  // Specific criteria scores (mock)
  const [criteria, setCriteria] = useState({
    c1: 0, // TR / Fluency
    c2: 0, // CC / Lexical
    c3: 0, // LR / Grammar
    c4: 0, // GRA / Pronunciation
  });
  
  const [overall, setOverall] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'writing' | 'speaking'>('writing');

  useEffect(() => {
    async function fetchSubmission() {
      if (!id) return;
      // In a real app we'd fetch all students for the exam to populate the left list
      // For now we just fetch the current submission and mock the list
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          profiles:student_id (display_name),
          exams:exam_id (title)
        `)
        .eq('id', id)
        .single();
      
      if (data) {
        setSubmission(data);
        setFeedback(data.teacher_feedback || "");
        setOverall(data.score_writing || data.score_speaking || 0);
        
        // Mocking students list
        setStudents([
           { id: data.id, name: data.profiles?.display_name || "O'quvchi", status: 'testing', time: '10:30 AM' },
           { id: 'mock-1', name: 'Sarah Chen', status: 'graded', time: '09:12 AM' },
           { id: 'mock-2', name: 'David Lee', status: 'pending', time: '11:45 AM' },
        ]);
      }
      setLoading(false);
    }
    fetchSubmission();
  }, [id, supabase]);

  useEffect(() => {
    // Auto calculate overall band based on standard average
    const vals = Object.values(criteria);
    const avg = vals.reduce((a,b)=>a+b, 0) / 4;
    // IELTS rounding logic simplified
    setOverall(Math.round(avg * 2) / 2);
  }, [criteria]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('results')
        .update({
          score_writing: activeTab === 'writing' ? overall : submission?.score_writing || 0,
          score_speaking: activeTab === 'speaking' ? overall : submission?.score_speaking || 0,
          overall_band: overall,
          teacher_feedback: feedback,
          status: 'graded',
          graded_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      alert("Baho muvaffaqiyatli saqlandi!");
      router.push('/teacher');
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Yuklanmoqda...</div>;
  }

  if (!submission) {
    return <div className="min-h-screen flex items-center justify-center text-error font-bold">Ma&apos;lumot topilmadi...</div>;
  }

  const writingAnswer = submission.answers?.writing?.text || "O'quvchi yozma javob kiritmagan.";
  const speakingAudio = submission.answers?.speaking?.audio_url || null;
  const wordCount = writingAnswer.trim().split(/\s+/).filter((w: string) => w.length > 0).length;

  return (
    <div className="bg-[#f0f4f9] min-h-screen w-full lg:pl-[241px] xl:pl-[241px]">
      <main className="max-w-[1600px] mx-auto p-4 md:p-6 h-screen flex flex-col pt-24 lg:pt-6">
        
        {/* Header Options */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-4">
             <Link href="/teacher" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-outline-variant/20 hover:bg-surface-container transition-colors">
               <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
             </Link>
             <div>
               <h1 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">Language Grading Dashboard</h1>
               <div className="flex gap-2 mt-1">
                 <button onClick={() => setActiveTab('writing')} className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md ${activeTab === 'writing' ? 'bg-primary/10 text-primary' : 'text-outline hover:text-on-surface-variant'}`}>Writing Assessment</button>
                 <button onClick={() => setActiveTab('speaking')} className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md ${activeTab === 'speaking' ? 'bg-primary/10 text-primary' : 'text-outline hover:text-on-surface-variant'}`}>Speaking Assessment</button>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant font-medium text-sm">
             <span className="material-symbols-outlined text-[20px]">schedule</span>
             Bugun, 10:30 AM
          </div>
        </div>

        {/* 3 Column Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
           
           {/* Column 1: Students List */}
           <div className="w-full lg:w-[320px] shrink-0 bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.03)] flex flex-col p-6 overflow-hidden">
             <div className="flex justify-between items-center mb-6">
               <h2 className="font-headline font-bold text-xl">Students List</h2>
               <span className="material-symbols-outlined text-outline">more_horiz</span>
             </div>
             <div className="relative mb-6">
               <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
               <input type="text" placeholder="Search..." className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-0 outline-none" />
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {students.map((s, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl flex items-center justify-between border cursor-pointer transition-all ${s.id === submission.id ? 'bg-primary/5 border-primary/20 shadow-sm' : 'border-transparent hover:bg-surface-container-lowest'}`}>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-primary font-headline">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface leading-tight">{s.name}</p>
                          <p className="text-[11px] text-outline font-medium mt-0.5">ID: {s.id.substring(0,8)}</p>
                        </div>
                     </div>
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${s.status === 'graded' ? 'bg-success-container/50 text-success' : s.id === submission.id ? 'bg-primary/10 text-primary' : 'bg-warning-container/30 text-warning'}`}>
                       {s.status === 'graded' ? 'Graded' : s.id === submission.id ? 'Active' : 'Pending'}
                     </span>
                  </div>
                ))}
             </div>
           </div>

           {/* Column 2: Student Answer Workspace */}
           <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.03)] flex flex-col p-6 lg:p-8 overflow-hidden relative">
              <div className="flex justify-between items-center mb-6 shrink-0">
                 <h2 className="font-headline font-bold text-2xl">Student Answer</h2>
                 <button className="material-symbols-outlined text-outline">more_horiz</button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
                {activeTab === 'writing' ? (
                  <>
                    <div className="bg-white border border-outline-variant/20 shadow-sm rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-on-surface mb-2 font-label">IELTS Writing Task 2 Prompt:</h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        Some people believe that university education should be free for everyone, while others think students should pay context fees. Discuss both views and give your opinion.
                      </p>
                    </div>
                    <div className="bg-white border border-outline-variant/20 shadow-sm rounded-2xl p-8 min-h-[400px] flex flex-col relative group">
                      <div className="prose prose-sm max-w-none text-on-surface leading-[1.8] font-serif mb-8 whitespace-pre-wrap">
                        {writingAnswer}
                      </div>
                      <div className="mt-auto pt-4 border-t border-outline-variant/20 flex justify-end text-xs font-bold text-outline">
                        Word Count: <span className="text-on-surface ml-1">{wordCount} words</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg font-headline">Part 1: Introduction</h3>
                      <div className="bg-[#0b1b36] rounded-2xl p-5 border border-primary/20 shadow-lg text-white">
                        <div className="flex items-center justify-between mb-4">
                          <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform"><span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>pause</span></button>
                          <div className="text-xs font-mono text-primary-container font-medium">0:45 / 3:45s</div>
                          <button className="material-symbols-outlined text-outline">more_horiz</button>
                        </div>
                        <div className="h-12 flex items-center opacity-70 mb-2">
                           {/* Decorative waveform */}
                           {Array.from({length: 40}).map((_, i) => (
                             <div key={i} className="flex-1 mx-0.5 bg-primary-container rounded-full" style={{ height: `${Math.max(10, Math.random() * 100)}%` }}></div>
                           ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-outline-variant/20">
                      <h3 className="font-bold text-lg font-headline">Part 2: Cue Card</h3>
                      <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-sm mb-4">
                        <p className="text-sm font-medium">Describe a historic event you know well.</p>
                      </div>
                      <div className="bg-[#0b1b36] rounded-2xl p-5 border border-primary/20 shadow-lg text-white opacity-80">
                         <div className="flex items-center space-x-4 mb-2">
                           <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span></button>
                           <span className="font-bold text-sm">Cue Card Response</span>
                         </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
           </div>

           {/* Column 3: Grading & Sticky Panel */}
           <div className="w-full lg:w-[380px] shrink-0 bg-[#0f172a] text-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
              {/* Glass subtle layer */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>

              <div className="p-7 flex-1 overflow-y-auto space-y-8 relative z-10 custom-scrollbar-dark">
                
                <header>
                  <h2 className="font-headline font-bold text-2xl mb-1">Grading & Feedback</h2>
                  <p className="text-primary-container/70 text-xs">Evaluate criteria to calculate band.</p>
                </header>

                <div className="space-y-6">
                   <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary-container/50">IELTS Criteria</p>
                   {[
                     { id: 'c1', name: activeTab === 'writing' ? 'Task Response' : 'Fluency & Coherence', val: criteria.c1 },
                     { id: 'c2', name: activeTab === 'writing' ? 'Coherence & Cohesion' : 'Lexical Resource', val: criteria.c2 },
                     { id: 'c3', name: activeTab === 'writing' ? 'Lexical Resource' : 'Grammatical Range', val: criteria.c3 },
                     { id: 'c4', name: activeTab === 'writing' ? 'Grammar Range & Accv' : 'Pronunciation', val: criteria.c4 },
                   ].map((item) => (
                     <div key={item.id} className="space-y-2">
                       <div className="flex justify-between items-center text-sm">
                         <span className="font-medium text-white/90">{item.name}</span>
                         <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">{item.val > 0 ? item.val.toFixed(1) : '-'}</span>
                       </div>
                       <input 
                          type="range" min="0" max="9" step="0.5" 
                          value={item.val} onChange={(e) => setCriteria({...criteria, [item.id]: Number(e.target.value)})}
                          className="w-full appearance-none h-1.5 rounded-full bg-white/10 accent-primary" 
                          style={{
                           background: `linear-gradient(to right, #0058bc ${item.val/9*100}%, rgba(255,255,255,0.1) ${item.val/9*100}%)`
                          }}
                        />
                     </div>
                   ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-inner backdrop-blur-md">
                   <span className="font-bold text-sm text-white/80">Overall Band Score</span>
                   <div className="font-headline font-black text-4xl text-white drop-shadow-md">
                     {overall > 0 ? overall.toFixed(1) : '-'}
                   </div>
                </div>

                <div className="space-y-3">
                   <h3 className="text-sm font-bold text-white/80">Written Feedback</h3>
                   <textarea 
                     value={feedback}
                     onChange={(e)=>setFeedback(e.target.value)}
                     className="w-full h-32 bg-[#1e293b] border border-white/10 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-white/90 placeholder:text-white/30"
                     placeholder="Share detailed thoughts with the student..."
                   />
                </div>

                {/* Voice Feedback Button */}
                <button className="w-full flex items-center gap-4 bg-gradient-to-r from-primary to-[#7c3aed] p-4 rounded-2xl shadow-lg hover:shadow-primary/30 hover:scale-[1.02] transition-all group">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary group-hover:animate-pulse">
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>mic</span>
                   </div>
                   <div className="text-left">
                     <p className="font-bold text-sm text-white leading-tight">Hold to Record Voice</p>
                     <p className="text-xs text-white/70 font-medium mt-0.5">0:00 recorded</p>
                   </div>
                </button>
              </div>

              {/* Action Footer */}
              <div className="p-6 bg-[#0f172a] border-t border-white/5 relative z-20 space-y-3">
                 <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(0,88,188,0.5)] hover:bg-primary-dark transition-colors"
                 >
                   {isSaving ? "Saving..." : "Publish Results"}
                 </button>
                 <button className="w-full py-3 text-sm font-bold text-white/60 hover:text-white transition-colors">
                   Save Draft
                 </button>
              </div>
           </div>

        </div>
      </main>
      
      {/* Required subtle styles tailored for grading panel */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
        
        .custom-scrollbar-dark::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
