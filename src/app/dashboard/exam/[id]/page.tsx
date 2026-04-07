"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function ExamPreviewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({
    writing: { text: "" },
    speaking: { audio_url: "" }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchExam() {
      const { data, error } = await supabase
        .from("exams")
        .select("*, questions(*)")
        .eq("id", id)
        .single();
      if (data) setExam(data);
      setLoading(false);
    }
    fetchExam();
  }, [id, supabase]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Avval tizimga kiring!");
        return;
      }

      const { error } = await supabase.from("results").insert({
        exam_id: id,
        student_id: user.id,
        answers: answers,
        status: "pending"
      });

      if (error) throw error;
      alert("Imtihon muvaffaqiyatli topshirildi!");
      router.push("/dashboard");
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center font-bold text-primary">Yuklanmoqda...</div>;
  }

  if (!exam) {
     return <div className="min-h-screen flex items-center justify-center font-bold text-error">Imtihon topilmadi.</div>;
  }

  return (
    <div className="bg-[#f7f9fb] font-sans text-[#2a3439] min-h-screen flex flex-col pt-6 pb-20 px-4 sm:px-12 animate-in fade-in duration-700">
      
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-4 z-50 max-w-6xl mx-auto w-full flex items-center justify-between mb-10 bg-[#f7f9fb]/80 backdrop-blur-2xl rounded-2xl p-4 shadow-[0_8px_32px_rgba(42,52,57,0.04)] border border-[#a9b4b9]/15">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="w-12 h-12 rounded-full border border-[#a9b4b9]/30 flex items-center justify-center hover:bg-white transition-colors text-[#566166]">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#565e74] bg-[#dae2fd]/50 px-3 py-1 rounded-full mb-1 w-max">Mock Exam Preview</span>
            <h1 className="text-2xl font-bold tracking-tight text-[#2a3439]">{exam.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-5">
           <div className="bg-white/50 text-[#894d00] px-5 py-2.5 rounded-xl border border-[#a9b4b9]/20 flex items-center gap-2 font-bold text-sm shadow-sm backdrop-blur-md">
             <span className="material-symbols-outlined">timer</span>
             60:00
           </div>
           <button 
             onClick={handleSubmit} 
             disabled={isSubmitting}
             className="bg-gradient-to-br from-[#565e74] to-[#4a5268] text-white px-8 py-3 rounded-xl font-medium tracking-wide hover:shadow-[0_8px_24px_rgba(86,94,116,0.3)] active:scale-95 transition-all outline-none disabled:opacity-70"
           >
             {isSubmitting ? "Sumbitting..." : "Finish Exam"}
           </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-180px)]">
         
         {/* Left Panel: Content / Reading Passage */}
         <div className="flex-[5] bg-[#f0f4f7] rounded-[2rem] border border-[#a9b4b9]/15 overflow-hidden flex flex-col pt-2 shadow-inner">
           <div className="p-8 flex-1 overflow-y-auto">
             
             <div className="mb-10 text-center space-y-3">
                <p className="text-[#566166] text-sm tracking-wide uppercase font-semibold">Section Viewer</p>
                <div className="h-0.5 w-12 bg-[#dae2fd] mx-auto rounded-full"></div>
             </div>

             <div className="space-y-12">
               {exam.questions?.length === 0 ? (
                 <p className="text-[#566166] italic text-center py-20">No question data found.</p>
               ) : (
                 exam.questions?.map((q: any) => (
                   <div key={q.id} className="bg-white p-8 rounded-[1.5rem] shadow-[0_8px_32px_rgba(42,52,57,0.06)] border border-[#a9b4b9]/10">
                     <div className="flex items-center justify-between border-b border-[#f0f4f7] pb-6 mb-8">
                       <h2 className="font-bold text-2xl tracking-tight uppercase text-[#2a3439]">
                         {q.section}
                       </h2>
                       {q.content?.audioUrl && (
                         <div className="bg-[#f0f4f7] p-2 rounded-xl flex items-center shadow-sm">
                           <audio src={q.content.audioUrl} controls className="h-10 outline-none" />
                         </div>
                       )}
                     </div>

                     {/* Listening & Reading Renderer */}
                     {(q.section === 'listening' || q.section === 'reading') && (
                       <div className="space-y-12">
                         {q.content?.sections?.map((sec: any, sIdx: number) => (
                           <div key={sec.id} className="bg-[#f7f9fb] p-6 lg:p-8 rounded-[1.25rem] border border-[#e1e9ee]">
                             <div className="flex items-center gap-4 mb-4">
                               <div className="w-10 h-10 rounded-xl bg-[#dae2fd] text-[#565e74] flex items-center justify-center font-bold text-lg">{sIdx + 1}</div>
                               <h4 className="font-bold text-[1.15rem] leading-snug">{sec.title}</h4>
                             </div>
                             
                             {sec.instruction && (
                               <div className="bg-white text-[#566166] text-sm leading-relaxed p-4 rounded-xl border border-[#e1e9ee] shadow-sm mb-6 font-medium italic">
                                 {sec.instruction}
                               </div>
                             )}
                             
                             {sec.audioUrl && (
                               <div className="mb-6 bg-white p-2 inline-block rounded-xl shadow-sm border border-[#e1e9ee]">
                                 <audio src={sec.audioUrl} controls className="h-10" />
                               </div>
                             )}
                             
                             {sec.imageUrl && (
                               <div className="mb-6 p-2 bg-white rounded-xl border border-[#e1e9ee] shadow-sm inline-block">
                                 <img src={sec.imageUrl} alt="section" className="rounded-lg max-h-[18rem] object-contain" />
                               </div>
                             )}

                             {/* Questions Map */}
                             <div className="space-y-4 pl-0 sm:pl-14 mt-6">
                               {sec.questions?.map((question: any, qIdx: number) => (
                                 <div key={question.id} className="p-5 bg-white rounded-xl shadow-sm border border-[#e1e9ee] transition-all hover:shadow-md">
                                   <p className="font-semibold text-base mb-4 text-[#2a3439] leading-relaxed">
                                     <span className="text-[#565e74] mr-2 font-bold w-6 inline-block">{qIdx + 1}.</span>
                                     {question.text}
                                   </p>
                                   
                                   {question.type === 'MCQ' && (
                                     <div className="space-y-3 pl-8 mt-4">
                                       {question.options?.map((opt: any) => (
                                         <label key={opt.id} className="flex items-center gap-4 text-[0.95rem] cursor-not-allowed group">
                                           <div className="w-5 h-5 rounded-full border-[1.5px] border-[#a9b4b9] flex-shrink-0 group-hover:bg-[#f0f4f7] transition-colors"></div>
                                           <span className="text-[#566166]"><strong className="text-[#2a3439] mr-2">{opt.label})</strong> {opt.text}</span>
                                         </label>
                                       ))}
                                     </div>
                                   )}
                                   
                                   {question.type === 'GAP_FILL' && (
                                     <div className="pl-8 mt-4">
                                       <input placeholder="Type answer..." disabled className="bg-[#f7f9fb] px-4 py-3 rounded-lg border border-[#e1e9ee] text-sm w-full max-w-sm disabled:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#dae2fd] transition-all" />
                                     </div>
                                   )}
                                 </div>
                               ))}
                             </div>
                           </div>
                         ))}
                       </div>
                     )}

                     {/* Writing Renderer */}
                     {q.section === 'writing' && (
                       <div className="space-y-8">
                         {q.content?.tasks?.map((task: any, tIdx: number) => (
                           <div key={task.id} className="bg-[#f7f9fb] p-8 rounded-[1.25rem] border border-[#e1e9ee]">
                             <div className="flex items-center justify-between mb-6">
                               <h4 className="font-bold text-[1.15rem] flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-[#e8eff3] text-[#526075] flex items-center justify-center font-bold">W{tIdx + 1}</div>
                                  {task.type === 'TASK1' ? "Writing Task 1" : "Writing Task 2"}
                               </h4>
                               <span className="text-[11px] px-3 py-1 bg-white border border-[#e1e9ee] rounded-full font-bold text-[#566166] uppercase tracking-wider">Min: {task.minWords} words</span>
                             </div>
                             {task.imageUrl && (
                               <div className="mb-6 p-3 bg-white rounded-xl border border-[#e1e9ee] shadow-sm max-w-max">
                                 <img src={task.imageUrl} className="rounded-lg max-h-[18rem] object-contain" />
                               </div>
                             )}
                             <div className="bg-white p-5 rounded-xl border border-[#e1e9ee] shadow-sm">
                               <p className="text-[0.95rem] text-[#2a3439] font-medium whitespace-pre-wrap leading-relaxed border-l-[3px] border-[#dae2fd] pl-4">{task.text}</p>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}

                     {/* Speaking Renderer */}
                     {q.section === 'speaking' && (
                       <div className="space-y-8">
                         {q.content?.parts?.map((part: any, pIdx: number) => (
                           <div key={part.id} className="bg-[#f7f9fb] p-8 rounded-[1.25rem] border border-[#e1e9ee]">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[#dae2fd] text-[#565e74] flex items-center justify-center font-bold">S{pIdx + 1}</div>
                                <h4 className="font-bold text-[1.15rem]">{part.title}</h4>
                             </div>
                             {part.imageFileUrl && (
                               <div className="mb-6 bg-white p-2 rounded-xl shadow-sm border border-[#e1e9ee] inline-block">
                                 <img src={part.imageFileUrl} className="rounded-lg max-h-52" />
                               </div>
                             )}
                             {part.audioFileUrl && (
                               <div className="mb-6 bg-white p-2 rounded-xl shadow-sm border border-[#e1e9ee] inline-block">
                                 <audio src={part.audioFileUrl} controls className="h-10" />
                               </div>
                             )}
                             
                             <div className="space-y-4 mt-6">
                               {part.questions?.map((question: any, idx: number) => (
                                 <div key={question.id} className="bg-white p-5 rounded-xl shadow-sm border border-[#e1e9ee] flex gap-4 text-[0.95rem] font-medium leading-relaxed">
                                   <span className="text-[#565e74] font-bold">{idx + 1}.</span>
                                   <span className="whitespace-pre-wrap text-[#2a3439]">{question.text}</span>
                                 </div>
                               ))}
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 ))
               )}
             </div>
           </div>
         </div>

         {/* Right Panel: Student Answers workspace */}
         <div className="flex-[3] bg-white rounded-[2rem] border border-[#a9b4b9]/15 overflow-hidden flex flex-col shadow-[0_8px_40px_rgba(42,52,57,0.08)]">
           <div className="bg-[#f7f9fb] border-b border-[#e1e9ee] p-4 flex gap-3 overflow-x-auto min-h-[4rem] items-center">
             <button className="px-5 py-2 rounded-xl bg-[#565e74] text-white font-semibold text-xs shadow-md transition-all">Writing Sandbox</button>
             <button className="px-5 py-2 rounded-xl text-[#566166] hover:bg-[#e1e9ee] font-semibold text-xs transition-colors">Speaking Recording</button>
           </div>
           
           <div className="p-8 flex-1 flex flex-col bg-white">
             <div className="mb-6">
               <h3 className="font-bold text-lg text-[#2a3439]">Scratchpad / Answers</h3>
               <p className="text-sm text-[#566166] mt-1">Compose your responses securely here.</p>
             </div>
             
             <textarea 
               placeholder="Begin typing your essay..."
               value={answers.writing.text}
               onChange={(e) => setAnswers({ ...answers, writing: { text: e.target.value } })}
               className="w-full flex-1 bg-[#f7f9fb] p-6 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-[#dae2fd] border border-[#e1e9ee] focus:border-[#565e74] transition-all text-[0.95rem] leading-loose text-[#2a3439] font-serif shadow-inner"
             ></textarea>
             
             <div className="flex justify-between items-center mt-6 p-4 bg-[#f0f4f7] rounded-xl border border-[#e1e9ee]">
               <span className="text-xs text-[#566166] font-bold uppercase tracking-wider">Word count: <span className="text-[#2a3439] text-sm ml-1">{answers.writing.text.trim().split(/\s+/).filter(Boolean).length}</span></span>
               <span className="text-xs text-[#894d00] font-bold uppercase tracking-wider">Required: 250</span>
             </div>
           </div>
         </div>

      </div>
    </div>
  );
}
