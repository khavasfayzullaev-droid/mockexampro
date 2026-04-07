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
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col pt-8 pb-20 px-4 sm:px-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-1 inline-block">Preview Mode</span>
            <h1 className="text-2xl font-headline font-extrabold">{exam.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-error/10 text-error px-4 py-2 rounded-xl border border-error/20 flex items-center gap-2 font-bold text-sm">
             <span className="material-symbols-outlined">timer</span>
             60:00
           </div>
           <button 
             onClick={handleSubmit} 
             disabled={isSubmitting}
             className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all outline-none"
           >
             {isSubmitting ? "Yuborilmoqda..." : "Yuborish"}
           </button>
        </div>
      </div>

      {/* Split Window Layout (Simulated Reading/Writing setup) */}
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]">
         
         {/* Left Panel (Content/Passage) */}
         <div className="flex-1 bg-surface-container-low rounded-2xl border border-outline-variant/30 overflow-hidden flex flex-col shadow-inner">
           <div className="bg-surface border-b border-outline-variant/20 p-4">
             <h3 className="font-bold text-sm text-on-surface-variant flex items-center gap-2">
               <span className="material-symbols-outlined text-base">menu_book</span> Reading Passage or Question Prompts
             </h3>
           </div>
           <div className="p-8 flex-1 overflow-y-auto prose prose-slate">
             <h3>Instructions</h3>
             <p>This is a simulated exam preview. The actual questions fetched from the database would be displayed here.</p>
             <p><strong>Exam Type:</strong> {exam.type?.toUpperCase() || "MOCK EXAM"}</p>
             <hr />
             <div className="space-y-10">
               {exam.questions?.length === 0 ? (
                 <p className="text-on-surface-variant italic text-center py-10">No questions found for this exam draft.</p>
               ) : (
                 exam.questions?.map((q: any) => (
                   <div key={q.id} className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
                     <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-4">
                       <h2 className="font-extrabold text-xl font-headline uppercase tracking-wide text-primary">
                         {q.section} Section
                       </h2>
                       {q.content?.audioUrl && (
                         <audio src={q.content.audioUrl} controls className="h-8 shadow-sm rounded-lg" />
                       )}
                     </div>

                     {(q.section === 'listening' || q.section === 'reading') && (
                       <div className="space-y-8">
                         {q.content?.sections?.map((sec: any, sIdx: number) => (
                           <div key={sec.id} className="bg-surface-container-lowest p-5 rounded-2xl border border-slate-100">
                             <div className="flex items-center gap-3 mb-3">
                               <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">{sIdx + 1}</span>
                               <h4 className="font-bold text-lg">{sec.title}</h4>
                             </div>
                             {sec.instruction && <p className="text-sm text-on-surface-variant italic mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">"{sec.instruction}"</p>}
                             {sec.audioUrl && <audio src={sec.audioUrl} controls className="h-8 max-w-[250px] mb-4" />}
                             {sec.imageUrl && <img src={sec.imageUrl} alt="section" className="rounded-xl mb-4 max-h-64 object-contain shadow-sm border border-slate-100" />}

                             <div className="space-y-4 pl-0 sm:pl-11 mt-4">
                               {sec.questions?.map((question: any, qIdx: number) => (
                                 <div key={question.id} className="p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/20">
                                   <p className="font-semibold text-sm mb-3">
                                     <span className="text-primary mr-2 font-bold">{qIdx + 1}.</span>
                                     {question.text}
                                   </p>
                                   
                                   {question.type === 'MCQ' && (
                                     <div className="space-y-2 pl-5 mt-2">
                                       {question.options?.map((opt: any) => (
                                         <label key={opt.id} className="flex items-center gap-3 text-sm cursor-not-allowed group">
                                           <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0 group-hover:bg-slate-200"></div>
                                           <span><strong className="text-slate-500 mr-1">{opt.label})</strong> {opt.text}</span>
                                         </label>
                                       ))}
                                     </div>
                                   )}
                                   
                                   {question.type === 'GAP_FILL' && (
                                     <div className="pl-5 mt-2 text-sm">
                                       <input placeholder="Your Answer..." disabled className="bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs w-full max-w-sm disabled:opacity-70 disabled:bg-slate-50" />
                                     </div>
                                   )}
                                 </div>
                               ))}
                             </div>
                           </div>
                         ))}
                       </div>
                     )}

                     {q.section === 'writing' && (
                       <div className="space-y-6">
                         {q.content?.tasks?.map((task: any, tIdx: number) => (
                           <div key={task.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                             <div className="flex items-center justify-between mb-4">
                               <h4 className="font-bold text-lg flex items-center gap-2">
                                  <span className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold">W{tIdx + 1}</span>
                                  {task.type === 'TASK1' ? "Writing Task 1" : "Writing Task 2"}
                               </h4>
                               <span className="text-xs font-bold text-outline uppercase">Min: {task.minWords} words</span>
                             </div>
                             {task.imageUrl && <img src={task.imageUrl} className="rounded-xl mb-4 max-h-64 shadow-sm object-contain bg-white border border-slate-200 p-2" />}
                             <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed px-2 border-l-4 border-secondary/50">{task.text}</p>
                           </div>
                         ))}
                       </div>
                     )}

                     {q.section === 'speaking' && (
                       <div className="space-y-6">
                         {q.content?.parts?.map((part: any, pIdx: number) => (
                           <div key={part.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                             <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">S{pIdx + 1}</span>
                                {part.title}
                             </h4>
                             {part.imageFileUrl && <img src={part.imageFileUrl} className="rounded-xl mb-4 max-h-48 border border-slate-200 p-1 bg-white" />}
                             {part.audioFileUrl && <audio src={part.audioFileUrl} controls className="h-8 max-w-[250px] mb-4" />}
                             
                             <div className="space-y-3 mt-4">
                               {part.questions?.map((question: any, idx: number) => (
                                 <div key={question.id} className="bg-white p-3 rounded-lg border border-outline-variant/30 flex gap-3 text-sm font-medium">
                                   <span className="text-primary font-bold">{idx + 1}.</span>
                                   <span className="whitespace-pre-wrap">{question.text}</span>
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

         {/* Right Panel (Answers) */}
         <div className="flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden flex flex-col shadow-[0_12px_32px_rgba(25,28,30,0.05)]">
           <div className="bg-surface-container-lowest border-b border-outline-variant/20 p-4 flex gap-2 overflow-x-auto">
             <button className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-xs">Writing (Task 2)</button>
             <button className="px-4 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container font-semibold text-xs transition-colors">Speaking</button>
           </div>
           <div className="p-6 flex-1 flex flex-col">
             <p className="font-bold text-sm mb-4">You have 40 minutes for this task. Write your answer below.</p>
             <textarea 
               placeholder="Write your answer here..."
               value={answers.writing.text}
               onChange={(e) => setAnswers({ ...answers, writing: { text: e.target.value } })}
               className="w-full flex-1 bg-surface-container p-4 rounded-xl resize-none outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary transition-all text-sm leading-relaxed"
             ></textarea>
             <div className="flex justify-between items-center mt-3 text-xs text-on-surface-variant">
               <span>Word count: {answers.writing.text.trim().split(/\s+/).filter(Boolean).length}</span>
               <span className="font-bold text-primary">Min: 250 words</span>
             </div>
           </div>
         </div>

      </div>
    </div>
  );
}
