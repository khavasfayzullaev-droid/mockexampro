"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// ============ TypeScript Interfaces ============
interface StudentItem {
  id: string;
  name: string;
  status: 'pending' | 'graded';
  time: string;
  preview: string;
  task: string;
}

interface Submission {
  id: string;
  exam_id: string;
  student_id: string;
  answers: {
    listening?: { responses?: Record<string, string> };
    reading?: { responses?: Record<string, string> };
    writing?: { text?: string };
    speaking?: { audio_url?: string };
  };
  score_listening: number | null;
  score_reading: number | null;
  score_writing: number | null;
  score_speaking: number | null;
  overall_band: number | null;
  criteria_writing: Record<string, number> | null;
  criteria_speaking: Record<string, number> | null;
  teacher_feedback: string | null;
  voice_feedback_url: string | null;
  draft_feedback: string | null;
  status: 'pending' | 'graded';
  profiles?: { display_name?: string };
  exams?: { title?: string };
}

interface Question {
  id: string;
  section: string;
  content: any;
  order_index: number;
}

// ============ IELTS Band Conversion Tables ============
const LISTENING_BAND_TABLE: Record<number, number> = {
  40:9, 39:8.5, 38:8.5, 37:8, 36:8, 35:7.5, 34:7.5, 33:7, 32:7, 31:6.5, 30:6.5,
  29:6, 28:6, 27:5.5, 26:5.5, 25:5.5, 24:5, 23:5, 22:5, 21:4.5, 20:4.5,
  19:4, 18:4, 17:4, 16:3.5, 15:3.5, 14:3, 13:3, 12:3, 11:2.5, 10:2.5,
  9:2, 8:2, 7:1.5, 6:1.5, 5:1, 4:1, 3:1, 2:1, 1:1, 0:0
};

const READING_BAND_TABLE: Record<number, number> = {
  40:9, 39:8.5, 38:8, 37:7.5, 36:7.5, 35:7, 34:7, 33:6.5, 32:6.5, 31:6,
  30:6, 29:5.5, 28:5.5, 27:5, 26:5, 25:5, 24:4.5, 23:4.5, 22:4, 21:4,
  20:4, 19:3.5, 18:3.5, 17:3, 16:3, 15:3, 14:2.5, 13:2.5, 12:2, 11:2,
  10:2, 9:1.5, 8:1.5, 7:1, 6:1, 5:1, 4:1, 3:1, 2:1, 1:1, 0:0
};

function getBand(correct: number, table: Record<number, number>): number {
  return table[Math.min(correct, 40)] ?? 0;
}

import toast, { Toaster } from 'react-hot-toast';

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  if (type === 'success') toast.success(msg, { style: { borderRadius: '12px', fontWeight: 600 } });
  else toast.error(msg, { style: { borderRadius: '12px', fontWeight: 600 } });
}

export default function GradingCenter() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [studentFilter, setStudentFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [studentSearch, setStudentSearch] = useState("");

  const [criteria, setCriteria] = useState({ c1: 0, c2: 0, c3: 0, c4: 0 });
  const [overall, setOverall] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'listening' | 'reading' | 'writing' | 'speaking'>('writing');

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ============ DATA FETCHING ============
  useEffect(() => {
    async function fetchSubmission() {
      if (!id) return;

      // Mock data for development preview
      if (process.env.NODE_ENV === 'development' && id.startsWith('mock-')) {
        setSubmission({
          id, exam_id: 'mock-exam-id', student_id: 'mock-student',
          score_writing: null, score_speaking: null, score_listening: null, score_reading: null,
          overall_band: null, criteria_writing: null, criteria_speaking: null,
          teacher_feedback: "", voice_feedback_url: null, draft_feedback: null,
          status: id.includes('2') || id.includes('4') ? 'graded' : 'pending',
          answers: {
            listening: { responses: { "1":"A","2":"B","3":"C","4":"D","5":"A","6":"B","7":"B","8":"C","9":"A","10":"D","11":"A","12":"B","13":"C","14":"D","15":"A","16":"B","17":"C","18":"A","19":"D","20":"B","21":"C","22":"A","23":"B","24":"D","25":"A","26":"B","27":"C","28":"D","29":"A","30":"B","31":"C","32":"D","33":"A","34":"B","35":"C","36":"D","37":"A","38":"B","39":"C","40":"D" } },
            reading: { responses: { "1":"True","2":"False","3":"NG","4":"True","5":"A","6":"C","7":"B","8":"D","9":"A","10":"C","11":"True","12":"False","13":"NG","14":"True","15":"A","16":"B","17":"C","18":"D","19":"A","20":"B","21":"True","22":"False","23":"A","24":"B","25":"C","26":"D","27":"A","28":"B","29":"C","30":"D","31":"True","32":"False","33":"A","34":"B","35":"C","36":"D","37":"A","38":"B","39":"C","40":"D" } },
            writing: { text: "In the contemporary world, the influence of social media on interpersonal connections is a topic of significant debate. While some individuals argue that these platforms deteriorate the quality of human relationships, others contend that they serve as a vital tool for maintaining global connectivity.\n\nOn one hand, critics of social media highlight the erosion of face-to-face interactions. They argue that people are becoming increasingly isolated as they prioritize virtual engagements over physical presence. For instance, it is common to see friends sitting together at a restaurant, yet all are preoccupied with their smartphones.\n\nOn the other hand, proponents of digital platforms emphasize their role in bridging geographical distances. Social media allows families and friends separated by thousands of miles to share moments in real-time.\n\nIn conclusion, although social media can lead to a decrease in physical interaction, its ability to unite people across the globe is invaluable." },
            speaking: { audio_url: "" }
          }
        } as any);

        setQuestions([
          { id: 'q1', section: 'listening', order_index: 0, content: { answer_key: {"1":"A","2":"B","3":"C","4":"A","5":"A","6":"B","7":"C","8":"C","9":"A","10":"D","11":"A","12":"B","13":"C","14":"D","15":"B","16":"B","17":"C","18":"A","19":"D","20":"B","21":"C","22":"A","23":"B","24":"D","25":"A","26":"B","27":"C","28":"D","29":"A","30":"B","31":"C","32":"D","33":"A","34":"B","35":"C","36":"D","37":"A","38":"B","39":"C","40":"D"} } },
          { id: 'q2', section: 'reading', order_index: 0, content: { answer_key: {"1":"True","2":"False","3":"NG","4":"True","5":"A","6":"C","7":"B","8":"D","9":"A","10":"C","11":"True","12":"False","13":"NG","14":"True","15":"A","16":"B","17":"C","18":"D","19":"A","20":"B","21":"True","22":"False","23":"A","24":"B","25":"C","26":"D","27":"A","28":"B","29":"C","30":"D","31":"True","32":"False","33":"A","34":"B","35":"C","36":"D","37":"A","38":"B","39":"C","40":"D"} } },
          { id: 'q3', section: 'writing', order_index: 0, content: { prompt: "Many people believe that social media has a negative impact on human relationships. Discuss both views and give your own opinion." } },
          { id: 'q4', section: 'speaking', order_index: 0, content: { prompt: "Describe a historic event you know well." } },
        ]);

        setStudents([
          { id: 'mock-test-id-1', name: 'Abduvohid Qodirov', status: 'pending', time: '12:45', preview: '"Modern technology has a profound..."', task: 'Writing Task 2' },
          { id: 'mock-test-id-2', name: 'Malika Saidova', status: 'graded', time: 'Kecha', preview: '"The bar chart illustrates..."', task: 'Writing Task 1' },
          { id: 'mock-test-id-3', name: 'Jasur Xolmatov', status: 'pending', time: 'Kecha', preview: '"Education is the backbone..."', task: 'Writing Task 2' },
          { id: 'mock-test-id-4', name: 'Zuhra Aliyeva', status: 'graded', time: '2 kun', preview: '"The graph shows..."', task: 'Reading' },
        ]);
        setLoading(false);
        return;
      }

      // Real data fetch
      const { data } = await supabase.from('results')
        .select('*, profiles:student_id (display_name), exams:exam_id (title)')
        .eq('id', id).single();

      if (data) {
        setSubmission(data as any);
        setFeedback(data.teacher_feedback || data.draft_feedback || "");
        setVoiceUrl(data.voice_feedback_url || null);
        if (data.criteria_writing) setCriteria({ c1: data.criteria_writing.ta || 0, c2: data.criteria_writing.cc || 0, c3: data.criteria_writing.lr || 0, c4: data.criteria_writing.gra || 0 });
        setOverall(data.overall_band || 0);

        const { data: allResults } = await supabase.from('results')
          .select('id, status, submitted_at, answers, profiles:student_id (display_name)')
          .eq('exam_id', data.exam_id).order('submitted_at', { ascending: false });
        if (allResults) {
          setStudents(allResults.map((r: any) => ({
            id: r.id,
            name: r.profiles?.display_name || "O'quvchi",
            status: r.status || 'pending',
            time: new Date(r.submitted_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            preview: r.answers?.writing?.text ? `"${r.answers.writing.text.substring(0, 35)}..."` : "",
            task: r.answers?.writing?.text ? 'Writing' : r.answers?.speaking?.audio_url ? 'Speaking' : 'Test'
          })));
        }

        const { data: qs } = await supabase.from('questions').select('*').eq('exam_id', data.exam_id);
        if (qs) setQuestions(qs);
      }
      setLoading(false);
    }
    fetchSubmission();
  }, [id, supabase]);

  // Auto calculate overall band for writing/speaking
  useEffect(() => {
    if (activeTab === 'writing' || activeTab === 'speaking') {
      const vals = Object.values(criteria);
      const avg = vals.reduce((a, b) => a + b, 0) / 4;
      setOverall(Math.round(avg * 2) / 2);
    }
  }, [criteria, activeTab]);

  // ============ COMPUTED VALUES ============
  const writingAnswer = submission?.answers?.writing?.text || "O'quvchi yozma javob kiritmagan.";
  const speakingAudio = submission?.answers?.speaking?.audio_url || null;
  const wordCount = writingAnswer.trim().split(/\s+/).filter((w: string) => w.length > 0).length;

  const writingQuestion = questions.find(q => q.section === 'writing');
  const speakingQuestion = questions.find(q => q.section === 'speaking');
  const listeningQuestion = questions.find(q => q.section === 'listening');
  const readingQuestion = questions.find(q => q.section === 'reading');

  // Compute Listening/Reading scores
  const computeAutoScore = useCallback((section: 'listening' | 'reading') => {
    const q = section === 'listening' ? listeningQuestion : readingQuestion;
    const responses = submission?.answers?.[section]?.responses || {};
    const answerKey = q?.content?.answer_key || {};
    let correct = 0;
    const wrong: { num: string; student: string; answer: string }[] = [];
    const total = Object.keys(answerKey).length;

    for (const [num, correctAns] of Object.entries(answerKey)) {
      const studentAns = responses[num] || '-';
      if (String(studentAns).toLowerCase().trim() === String(correctAns).toLowerCase().trim()) {
        correct++;
      } else {
        wrong.push({ num, student: String(studentAns), answer: String(correctAns) });
      }
    }
    const band = getBand(correct, section === 'listening' ? LISTENING_BAND_TABLE : READING_BAND_TABLE);
    return { correct, total, band, wrong };
  }, [submission, listeningQuestion, readingQuestion]);

  const listeningScore = computeAutoScore('listening');
  const readingScore = computeAutoScore('reading');

  // Filter students
  const filteredStudents = students.filter(s => {
    if (studentFilter === 'pending' && s.status !== 'pending') return false;
    if (studentFilter === 'graded' && s.status !== 'graded') return false;
    if (studentSearch && !s.name.toLowerCase().includes(studentSearch.toLowerCase())) return false;
    return true;
  });

  const criteriaLabels = activeTab === 'writing'
    ? ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammar & Accuracy']
    : ['Fluency & Coherence', 'Lexical Resource', 'Grammar Range', 'Pronunciation'];
  const criteriaKeys: ('c1' | 'c2' | 'c3' | 'c4')[] = ['c1', 'c2', 'c3', 'c4'];

  // ============ VOICE RECORDING ============
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsSaving(true);
        try {
          const name = `feedback_${id}_${Date.now()}.webm`;
          const { error } = await supabase.storage.from('exam-assets').upload(name, blob, { contentType: 'audio/webm' });
          if (error) throw error;
          setVoiceUrl(supabase.storage.from('exam-assets').getPublicUrl(name).data.publicUrl);
          showToast("Ovoz muvaffaqiyatli yuklandi!");
        } catch { showToast("Ovoz yuklashda xatolik!", 'error'); }
        finally { setIsSaving(false); }
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch { showToast("Mikrofonga ruxsat berilmadi!", 'error'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;

  // ============ SAVE / DRAFT ============
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const criteriaW = activeTab === 'writing' ? { ta: criteria.c1, cc: criteria.c2, lr: criteria.c3, gra: criteria.c4 } : submission?.criteria_writing;
      const criteriaS = activeTab === 'speaking' ? { fc: criteria.c1, lr: criteria.c2, gra: criteria.c3, pr: criteria.c4 } : submission?.criteria_speaking;
      
      const newScoreW = activeTab === 'writing' ? overall : Number(submission?.score_writing || 0);
      const newScoreS = activeTab === 'speaking' ? overall : Number(submission?.score_speaking || 0);
      const newScoreL = Number(listeningScore.band || submission?.score_listening || 0);
      const newScoreR = Number(readingScore.band || submission?.score_reading || 0);
      
      const avgScore = (newScoreW + newScoreS + newScoreL + newScoreR) / 4;
      
      const whole = Math.floor(avgScore);
      const fraction = avgScore - whole;
      let finalOverall = whole;
      if (fraction >= 0.75) finalOverall = whole + 1;
      else if (fraction >= 0.25) finalOverall = whole + 0.5;

      const { error } = await supabase.from('results').update({
        score_writing: newScoreW,
        score_speaking: newScoreS,
        score_listening: newScoreL,
        score_reading: newScoreR,
        criteria_writing: criteriaW,
        criteria_speaking: criteriaS,
        overall_band: finalOverall,
        teacher_feedback: feedback,
        voice_feedback_url: voiceUrl,
        status: 'graded',
        graded_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      showToast("Baho muvaffaqiyatli saqlandi!");
      router.push('/teacher');
    } catch (err: any) { showToast("Xatolik: " + err.message, 'error'); }
    finally { setIsSaving(false); }
  };

  const handleDraft = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('results').update({
        draft_feedback: feedback,
        criteria_writing: activeTab === 'writing' ? { ta: criteria.c1, cc: criteria.c2, lr: criteria.c3, gra: criteria.c4 } : submission?.criteria_writing,
        criteria_speaking: activeTab === 'speaking' ? { fc: criteria.c1, lr: criteria.c2, gra: criteria.c3, pr: criteria.c4 } : submission?.criteria_speaking,
        voice_feedback_url: voiceUrl,
      }).eq('id', id);
      if (error) throw error;
      showToast("Qoralama saqlandi!");
    } catch (err: any) { showToast("Xatolik: " + err.message, 'error'); }
    finally { setIsSaving(false); }
  };

  // ============ LOADING / ERROR STATES ============
  if (loading) return <div className="flex items-center justify-center h-[60vh]"><span className="text-primary font-bold animate-pulse text-lg">Yuklanmoqda...</span></div>;
  if (!submission) return <div className="flex items-center justify-center h-[60vh] text-error font-bold">Ma&apos;lumot topilmadi</div>;

  // ============ WAVEFORM HELPER ============
  const renderWaveform = (active: boolean) => {
    const h = [40,60,30,80,50,70,40,90,55,35,65,45,75,25,50,85,30,60,40,70,50,80,30,60,40,70];
    return (
      <div className={`flex-1 h-12 flex items-end gap-[2px] ${!active ? 'opacity-40' : ''}`}>
        {h.map((v, i) => <div key={i} className={`flex-1 rounded-sm ${active && i < 5 ? 'bg-primary' : 'bg-outline-variant'}`} style={{ height: `${v}%` }} />)}
      </div>
    );
  };

  // ============ RENDER: AUTO SCORE TAB (Listening/Reading) ============
  const renderAutoScoreTab = (section: 'listening' | 'reading') => {
    const score = section === 'listening' ? listeningScore : readingScore;
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="flex flex-col gap-6">
        {/* Score Summary */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-primary font-semibold mb-4">
            <span className="material-symbols-outlined text-sm">{section === 'listening' ? 'headphones' : 'menu_book'}</span>
            <span>{section === 'listening' ? 'Listening' : 'Reading'} Natijalari</span>
          </div>
          <div className="flex items-center gap-8 mb-4">
            <div>
              <p className="text-4xl font-black text-on-surface">{score.correct}<span className="text-lg font-medium text-outline"> / {score.total}</span></p>
              <p className="text-xs text-outline font-medium mt-1">To&apos;g&apos;ri javoblar</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-primary">{score.band.toFixed(1)}</p>
              <p className="text-xs text-outline font-medium mt-1">Band Score</p>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1">
                <span>Aniqlik</span>
                <span>{pct}%</span>
              </div>
              <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Wrong Answers */}
        {score.wrong.length > 0 && (
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
            <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              Xato javoblar ({score.wrong.length} ta)
            </h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {score.wrong.map((w) => (
                <div key={w.num} className="flex items-center gap-4 py-2 px-3 bg-error/5 rounded-lg text-sm">
                  <span className="font-bold text-on-surface-variant w-8">#{w.num}</span>
                  <span className="text-error font-medium line-through">{w.student}</span>
                  <span className="material-symbols-outlined text-outline text-[16px]">arrow_forward</span>
                  <span className="text-secondary font-bold">{w.answer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============ RENDER: AUDIO PLAYER ============
  const renderAudioPart = (partNum: number, title: string, duration: string, isFirst: boolean) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center text-xs">{partNum}</span>
          {title}
        </h3>
        <span className="text-sm font-medium text-on-surface-variant">{duration}</span>
      </div>
      <div className="bg-surface-container-lowest p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-outline-variant/10">
        {speakingAudio && isFirst ? (
          <audio controls src={speakingAudio} className="w-full" />
        ) : (
          <>
            <button className={`w-10 h-10 rounded-full ${isFirst ? 'bg-primary text-white' : 'bg-surface-container-high text-primary hover:bg-primary hover:text-white'} flex items-center justify-center transition-all shrink-0`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            </button>
            {renderWaveform(isFirst)}
            <select className="bg-surface-container-high border-none rounded-lg text-xs font-bold py-1 px-2 shrink-0"><option>1.0x</option><option>1.25x</option><option>1.5x</option></select>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer shrink-0 text-[20px]">download</span>
          </>
        )}
      </div>
    </div>
  );

  // ============ MAIN RENDER ============
  return (
    <div className="animate-in fade-in duration-300">
      <Toaster position="top-right" />
      <div className="flex flex-col lg:flex-row gap-5 min-h-[calc(100vh-8rem)]">

        {/* ========== COLUMN 1: STUDENTS LIST ========== */}
        <aside className="w-full lg:w-[270px] xl:w-[290px] shrink-0 flex flex-col gap-3">
          <div className="bg-surface-container-low p-4 rounded-xl">
            <div className="flex items-center bg-surface-container-lowest rounded-full px-4 py-2 shadow-sm mb-3">
              <span className="material-symbols-outlined text-outline text-[18px]">search</span>
              <input type="text" placeholder="Qidirish..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-outline-variant ml-2 outline-none" />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'graded'] as const).map(f => (
                <button key={f} onClick={() => setStudentFilter(f)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${studentFilter === f ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high'}`}>
                  {f === 'all' ? 'Barchasi' : f === 'pending' ? 'Kutilmoqda' : 'Baholangan'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-300px)] pr-1">
            {filteredStudents.map((s) => (
              <div key={s.id}
                onClick={() => { if (s.id !== submission?.id) { setLoading(true); router.push(`/teacher/grading/${s.id}`); } }}
                className={`bg-surface-container-lowest p-3.5 rounded-xl border-l-4 cursor-pointer transition-all hover:bg-surface-container-low ${s.id === submission?.id ? 'border-primary shadow-sm' : 'border-transparent hover:border-outline-variant'}`}>
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className={`text-sm ${s.id === submission?.id ? 'font-bold' : 'font-medium'}`}>{s.name}</h4>
                  <span className={`text-[9px] uppercase tracking-wider font-bold ${s.id === submission?.id ? 'text-primary' : 'text-outline'}`}>{s.task}</span>
                </div>
                {s.preview && <p className="text-[11px] text-on-surface-variant mb-2 italic truncate">{s.preview}</p>}
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${s.status === 'graded' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                    {s.status === 'graded' ? 'Baholangan' : 'Kutilmoqda'}
                  </span>
                  <span className="text-[10px] text-outline">{s.time}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ========== COLUMN 2: WORKSPACE ========== */}
        <section className="flex-1 min-w-0 overflow-y-auto">
          {/* 4 Tabs */}
          <nav className="flex gap-6 mb-5 border-b border-outline-variant/20">
            {(['listening', 'reading', 'writing', 'speaking'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-2.5 text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}>
                {tab}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          {activeTab === 'listening' && renderAutoScoreTab('listening')}
          {activeTab === 'reading' && renderAutoScoreTab('reading')}
          {activeTab === 'writing' && (
            <div className="flex flex-col gap-5">
              <div className="bg-surface-container-low p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-primary to-primary-container opacity-10 rounded-full -mr-14 -mt-14" />
                <h3 className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Savol (Writing Task)</h3>
                <p className="text-on-surface leading-relaxed font-medium italic whitespace-pre-wrap text-sm">
                  &ldquo;{writingQuestion?.content?.prompt || "Savol topilmadi"}&rdquo;
                </p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm min-h-[500px]">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-xs font-bold text-outline uppercase tracking-tight">O&apos;quvchi javobi</span>
                  <div className="bg-surface-container px-3 py-0.5 rounded-full text-[11px] font-bold text-on-surface-variant">{wordCount} so&apos;z</div>
                </div>
                <article className="text-[15px] text-on-surface leading-[1.85]">
                  {writingAnswer.split('\n\n').map((p: string, i: number) => <p key={i} className="mb-4">{p}</p>)}
                </article>
              </div>
            </div>
          )}
          {activeTab === 'speaking' && (
            <div className="flex flex-col gap-5">
              <header className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <span className="material-symbols-outlined text-[18px]">record_voice_over</span>
                  <span>Speaking Imtihoni</span>
                </div>
                <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-[10px] font-bold uppercase tracking-widest">Mock IELTS</span>
              </header>
              <div className="bg-surface-container-low p-6 rounded-2xl space-y-6">
                {renderAudioPart(1, "Part 1: Introduction & Interview", "04:12", true)}
                {renderAudioPart(2, "Part 2: Long Turn (Cue Card)", "03:45", false)}
                {renderAudioPart(3, "Part 3: Discussion", "05:20", false)}
              </div>
            </div>
          )}
        </section>

        {/* ========== COLUMN 3: GRADING PANEL ========== */}
        <aside className="w-full lg:w-[310px] xl:w-[330px] shrink-0">
          <div className="lg:sticky lg:top-20 flex flex-col gap-4">

            {/* Band Score Card */}
            <div className="bg-gradient-to-br from-primary to-primary-container p-5 rounded-2xl text-white shadow-xl flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                 {activeTab === 'listening' ? 'Listening Band' : activeTab === 'reading' ? 'Reading Band' : activeTab === 'writing' ? 'Writing Band' : 'Speaking Band'}
              </span>
              <div className="text-5xl font-black tracking-tighter">
                {activeTab === 'listening' ? listeningScore.band.toFixed(1)
                  : activeTab === 'reading' ? readingScore.band.toFixed(1)
                  : overall > 0 ? overall.toFixed(1) : '-'}
              </div>
              {(activeTab === 'listening' || activeTab === 'reading') && (
                <div className="bg-white/20 px-3 py-0.5 rounded-full text-[9px] font-bold mt-1">Avtomatik hisoblangan</div>
              )}
            </div>

            {/* Criteria (only Writing/Speaking) */}
            {(activeTab === 'writing' || activeTab === 'speaking') && (
              <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/10">
                <h4 className="text-sm font-bold text-on-surface mb-4">IELTS Mezonlari</h4>
                <div className="space-y-5">
                  {criteriaKeys.map((key, i) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">{criteriaLabels[i]}</label>
                        <span className="text-xs font-bold text-primary">{criteria[key] > 0 ? criteria[key].toFixed(1) : '-'}</span>
                      </div>
                      <input type="range" min="0" max="9" step="0.5" value={criteria[key]}
                        onChange={(e) => setCriteria({ ...criteria, [key]: Number(e.target.value) })}
                        className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {(activeTab === 'writing' || activeTab === 'speaking') && (
              <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/10">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-on-surface">O&apos;qituvchi Feedbacki</h4>
                  {!voiceUrl ? (
                    <button onClick={isRecording ? stopRecording : startRecording}
                      className={`p-1.5 rounded-full transition-colors flex items-center gap-1 ${isRecording ? 'bg-error/10 text-error animate-pulse' : 'text-primary hover:bg-primary/10'}`}>
                      <span className="material-symbols-outlined text-[18px]">{isRecording ? 'stop' : 'mic'}</span>
                      {isRecording && <span className="text-[10px] font-bold">{fmtTime(recordingTime)}</span>}
                    </button>
                  ) : (
                    <button onClick={() => setVoiceUrl(null)} className="text-error text-[11px] font-medium hover:underline">O&apos;chirish</button>
                  )}
                </div>
                {voiceUrl && (
                  <div className="mb-2 bg-surface-container p-2 rounded-lg">
                    <audio controls src={voiceUrl} className="w-full h-8" />
                  </div>
                )}
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                  className="w-full h-28 bg-surface-container rounded-xl border-none p-3 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant resize-none outline-none"
                  placeholder="Feedback qoldiring..." />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1">
              <button onClick={handleSave} disabled={isSaving}
                className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm">
                {isSaving ? "Saqlanmoqda..." : "Tasdiqlash va Yuborish"}
              </button>
              <button onClick={handleDraft} disabled={isSaving}
                className="w-full bg-surface-container-high text-on-surface-variant py-3.5 rounded-full font-bold hover:bg-surface-container-highest transition-colors text-sm">
                Qoralama (Draft)
              </button>
            </div>
          </div>
        </aside>

      </div>

      {/* Custom styles */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%;
          background: #0058bc; cursor: pointer; box-shadow: 0 2px 6px rgba(0,88,188,0.3);
        }
      `}</style>
    </div>
  );
}
