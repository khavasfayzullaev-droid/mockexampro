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
             <p><strong>Exam Type:</strong> {exam.type.toUpperCase()}</p>
             <hr />
             <div className="space-y-4">
               {exam.questions?.map((q: any, idx: number) => (
                 <div key={idx} className="bg-white p-4 rounded-xl border border-outline-variant/30">
                   <p className="font-bold text-primary mb-2">Q{idx + 1}</p>
                   <pre className="text-sm font-sans whitespace-pre-wrap">{JSON.stringify(q.content, null, 2)}</pre>
                 </div>
               ))}
               {exam.questions?.length === 0 && (
                 <p className="text-on-surface-variant italic">No questions found for this exam draft.</p>
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
