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

  // General scores instead of just Writing Task 2 criteria
  const [scoreWriting, setScoreWriting] = useState("0.0");
  const [scoreSpeaking, setScoreSpeaking] = useState("0.0");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSubmission() {
      if (!id) return;
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
        setScoreWriting(data.score_writing?.toString() || "0.0");
        setScoreSpeaking(data.score_speaking?.toString() || "0.0");
        setFeedback(data.teacher_feedback || "");
      }
      setLoading(false);
    }
    fetchSubmission();
  }, [id]);

  const calcBand = () => {
    // A simplified overall calculation based on writing and speaking (or assuming reading/listening are also populated)
    const w = Number(scoreWriting);
    const s = Number(scoreSpeaking);
    const r = Number(submission?.score_reading || 0);
    const l = Number(submission?.score_listening || 0);
    
    // In real system, if it's 4 skills, avg of 4. For now, let's just average all 4 assuming they exist.
    const sum = w + s + r + l;
    let count = 0;
    if (w > 0) count++;
    if (s > 0) count++;
    if (r > 0) count++;
    if (l > 0) count++;
    
    if (count === 0) return "0.0";
    return (sum / count).toFixed(1);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('results')
        .update({
          score_writing: Number(scoreWriting),
          score_speaking: Number(scoreSpeaking),
          overall_band: Number(calcBand()),
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
    return <div className="max-w-[1400px] mx-auto p-12 text-primary font-bold">Yuklanmoqda...</div>;
  }

  if (!submission) {
    return <div className="max-w-[1400px] mx-auto p-12 text-error font-bold">Ma&apos;lumot topilmadi...</div>;
  }

  const studentName = submission.profiles?.display_name || "Noma'lum O'quvchi";
  const examTitle = submission.exams?.title || "Noma'lum Test";
  const writingAnswer = submission.answers?.writing?.text || "O'quvchi yozma javob kiritmagan.";
  const speakingAudio = submission.answers?.speaking?.audio_url || null;

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-6rem)] flex flex-col fade-in">
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/teacher" className="p-2 border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Tekshirish: O&apos;quvchi yechimi
            </h1>
            <p className="text-sm text-on-surface-variant flex items-center gap-2 mt-1">
              Test: {examTitle} • O&apos;quvchi: {studentName}
            </p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary shadow-sm bg-success hover:shadow-success/30 px-8 py-3 disabled:opacity-50"
        >
          {isSaving ? "Saqlanmoqda..." : "Yakuniy bahoni yuborish"}
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Left - User Submission */}
        <div className="flex-[3] bg-surface rounded-2xl border border-outline-variant/30 flex flex-col overflow-hidden shadow-sm">
          <div className="bg-surface-container p-4 border-b border-outline-variant/30 flex gap-4">
             <div className="font-bold text-sm text-on-surface-variant flex-1 border-r border-outline-variant/30">
               📝 Yozma matn (Writing)
             </div>
             {speakingAudio && (
                <div className="font-bold text-sm text-on-surface-variant flex-1">
                  🎙️ Audio yozuv (Speaking)
                </div>
             )}
          </div>
          <div className="flex-1 overflow-y-auto flex">
             <div className={`p-8 font-serif text-lg leading-loose text-on-surface bg-white selection:bg-warning/30 ${speakingAudio ? 'flex-1 border-r border-outline-variant/30' : 'w-full'}`}>
               <pre className="whitespace-pre-wrap font-serif">{writingAnswer}</pre>
             </div>
             
             {speakingAudio && (
               <div className="flex-1 p-8 bg-surface-container-lowest flex flex-col items-center justify-center">
                  <p className="mb-4 text-on-surface-variant font-medium">O&apos;quvchi yuborgan audio:</p>
                  <audio controls src={speakingAudio} className="w-full max-w-[300px]"></audio>
               </div>
             )}
          </div>
        </div>

        {/* Right - Rubric & Feedback */}
        <div className="flex-[2] bg-surface rounded-2xl border border-outline-variant/30 flex flex-col overflow-hidden shadow-sm">
           <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
             <h2 className="font-bold text-lg">Baholash</h2>
             <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-outline-variant/30 flex items-center gap-3">
               <span className="text-sm font-semibold text-on-surface-variant">Umumiy Band:</span>
               <span className="text-2xl font-bold text-primary">{calcBand()}</span>
             </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-6">
                
                {/* Writing Score */}
                <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold text-primary">Writing Band</label>
                    <span className="text-lg font-bold w-8 text-center text-primary">{scoreWriting || "-"}</span>
                  </div>
                  <input 
                    type="range" min="0" max="9" step="0.5" 
                    value={scoreWriting} onChange={(e) => setScoreWriting(e.target.value)}
                    className="w-full accent-primary h-2 bg-surface-container rounded-full appearance-none"
                  />
                </div>

                {/* Speaking Score */}
                <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold text-success">Speaking Band</label>
                    <span className="text-lg font-bold w-8 text-center text-success">{scoreSpeaking || "-"}</span>
                  </div>
                  <input 
                    type="range" min="0" max="9" step="0.5" 
                    value={scoreSpeaking} onChange={(e) => setScoreSpeaking(e.target.value)}
                    className="w-full accent-success h-2 bg-surface-container rounded-full appearance-none"
                  />
                </div>

              </div>

              <div>
                <label className="block font-bold mb-2">Umumiy Izoh (Feedback)</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-4 border border-outline-variant/30 rounded-xl bg-white resize-none h-40 outline-none focus:border-primary transition-colors text-sm"
                  placeholder="O'quvchi uchun tahliliy izohlaringizni yozing..."
                ></textarea>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
