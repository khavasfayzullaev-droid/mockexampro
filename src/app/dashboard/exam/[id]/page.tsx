"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

/* ─── Stitch "Scholarly Sanctuary" Exam Preview ─────────────────────────── */

type SectionTab = "listening" | "reading" | "writing" | "speaking";

export default function ExamPreviewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<SectionTab>("listening");
  const [writingText, setWritingText] = useState("");
  const [activeWritingTask, setActiveWritingTask] = useState(0);
  const [activeSpeakingPart, setActiveSpeakingPart] = useState(0);
  const [activeListeningPart, setActiveListeningPart] = useState(0);
  const [activeReadingPassage, setActiveReadingPassage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchExam() {
      const { data } = await supabase
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
      if (!user) { alert("Avval tizimga kiring!"); return; }
      const { error } = await supabase.from("results").insert({
        exam_id: id, student_id: user.id,
        answers: { writing: { text: writingText }, mcq: selectedAnswers },
        status: "pending"
      });
      if (error) throw error;
      alert("Imtihon muvaffaqiyatli topshirildi!");
      router.push("/dashboard");
    } catch (err: any) { alert("Xatolik: " + err.message); } 
    finally { setIsSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f7f9fb' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#565e74] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-bold text-[#565e74] tracking-wider uppercase">Loading Exam…</span>
      </div>
    </div>
  );

  if (!exam) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f7f9fb' }}>
      <span className="font-bold text-[#9f403d]">Imtihon topilmadi.</span>
    </div>
  );

  const getSection = (sectionName: string) => exam.questions?.find((q: any) => q.section === sectionName);
  const listeningData = getSection("listening");
  const readingData = getSection("reading");
  const writingData = getSection("writing");
  const speakingData = getSection("speaking");

  const tabs: { key: SectionTab; label: string; icon: string; available: boolean }[] = [
    { key: "listening", label: "Listening", icon: "headphones", available: !!listeningData },
    { key: "reading", label: "Reading", icon: "menu_book", available: !!readingData },
    { key: "writing", label: "Writing", icon: "edit_note", available: !!writingData },
    { key: "speaking", label: "Speaking", icon: "record_voice_over", available: !!speakingData },
  ];

  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ fontFamily: "'Inter', sans-serif", background: '#f7f9fb', color: '#2a3439' }}>
      
      {/* Reading Progress Bar */}
      <div style={{ height: 2, background: '#e8eff3', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 60 }}>
        <div style={{ height: '100%', background: '#28619e', width: `${activeTab === 'listening' ? 25 : activeTab === 'reading' ? 50 : activeTab === 'writing' ? 75 : 100}%`, transition: 'width 0.5s ease' }}></div>
      </div>

      {/* ─── Top Bar (Glassmorphism) ─────────────────────── */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-8 py-3 w-full"
        style={{ background: 'rgba(247,249,251,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(42,52,57,0.06)' }}>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-[#565e74] hover:opacity-70 transition-opacity">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <span className="text-xl font-bold text-[#565e74] tracking-tight">Mock Exam Pro</span>
          <div className="h-5 w-px bg-[#a9b4b9]/30 hidden md:block"></div>
          {/* Section Tabs */}
          <div className="hidden md:flex gap-1 items-center">
            {tabs.filter(t => t.available).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key 
                    ? 'bg-[#dae2fd]/50 text-[#565e74] font-bold' 
                    : 'text-[#566166] hover:bg-[#f0f4f7]'
                }`}>
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Glass Timer */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#a9b4b9]/15"
            style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)' }}>
            <span className="material-symbols-outlined text-[#28619e] text-lg">timer</span>
            <span className="font-mono text-sm font-bold tracking-widest text-[#2a3439]">60:00</span>
          </div>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="bg-[#565e74] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60">
            {isSubmitting ? "Submitting…" : "Submit Exam"}
          </button>
        </div>
      </header>

      {/* ─── Main Content ─────────────────────── */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* ════════════ LISTENING ════════════ */}
        {activeTab === "listening" && listeningData && (
          <>
            {/* Left: Questions */}
            <section className="w-[60%] h-full overflow-y-auto px-12 py-10" style={{ background: '#f7f9fb' }}>
              {/* Audio Player Bento */}
              <div className="bg-white rounded-xl p-8 mb-10 border border-[#a9b4b9]/10" style={{ boxShadow: '0 8px 32px rgba(42,52,57,0.06)' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button className="w-12 h-12 rounded-full bg-[#565e74] flex items-center justify-center text-white active:scale-90 transition-transform">
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </button>
                    <div>
                      <p className="text-xs font-bold text-[#566166] tracking-wider uppercase">Listening Audio</p>
                      <h3 className="text-lg font-bold text-[#2a3439]">{listeningData.content?.sections?.[activeListeningPart]?.title || "Part " + (activeListeningPart + 1)}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#f0f4f7] px-4 py-2 rounded-full">
                    <span className="material-symbols-outlined text-[#566166]">volume_up</span>
                    <div className="w-24 h-1 bg-[#a9b4b9]/30 rounded-full relative"><div className="absolute inset-y-0 left-0 w-3/4 bg-[#565e74] rounded-full"></div></div>
                  </div>
                </div>
                {/* Waveform */}
                <div className="flex items-end justify-between h-16 gap-1 mb-6 px-2">
                  {[40,60,55,80,95,70,85,60,45,30,75,90,65,40,50,35,70,85,50,40].map((h, i) => (
                    <div key={i} style={{ width: 4, borderRadius: 2, height: `${h}%`, background: i >= 3 && i <= 12 ? '#565e74' : '#dae2fd' }}></div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-[#566166]">02:45</span>
                  <div className="flex-1 h-1.5 bg-[#e8eff3] rounded-full overflow-hidden"><div className="h-full w-1/2 bg-[#565e74]"></div></div>
                  <span className="text-xs font-mono text-[#566166]">05:30</span>
                </div>
              </div>

              {/* Instruction */}
              {listeningData.content?.sections?.[activeListeningPart]?.instruction && (
                <div className="mb-10 max-w-2xl">
                  <p className="italic text-lg text-[#526075] leading-relaxed border-l-4 border-[#89bcff] pl-6" style={{ fontFamily: "'Merriweather', serif" }}>
                    &ldquo;{listeningData.content.sections[activeListeningPart].instruction}&rdquo;
                  </p>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-8">
                {listeningData.content?.sections?.[activeListeningPart]?.questions?.map((q: any, idx: number) => (
                  <div key={q.id} className="bg-white p-8 rounded-xl border border-[#a9b4b9]/10" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
                    <div className="flex gap-4 mb-6">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#28619e]/10 text-[#28619e] flex items-center justify-center font-bold">{idx + 1}</span>
                      <h4 className="text-xl font-medium text-[#2a3439] leading-tight">{q.text}</h4>
                    </div>
                    {q.type === 'MCQ' && (
                      <div className="grid gap-3 ml-12">
                        {q.options?.map((opt: any) => {
                          const isSelected = selectedAnswers[q.id] === opt.id;
                          return (
                            <label key={opt.id} onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                              className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-[#dae2fd]/20 border-2 border-[#565e74]' 
                                  : 'bg-[#f0f4f7] border border-transparent hover:border-[#a9b4b9]/30'
                              }`}>
                              <input type="radio" name={q.id} checked={isSelected} readOnly
                                className="w-5 h-5 border-[#a9b4b9]" style={{ accentColor: '#565e74' }} />
                              <span className={`ml-4 ${isSelected ? 'font-semibold text-[#565e74]' : 'text-[#2a3439]'}`}>
                                {opt.label}. {opt.text}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {q.type === 'GAP_FILL' && (
                      <div className="ml-12">
                        <input type="text" placeholder="..." 
                          className="bg-[#d9e4ea] border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#565e74] focus:bg-white transition-all w-48 text-[#565e74] font-bold text-center" 
                          style={{ outline: 'none' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Right: Navigator */}
            <aside className="w-[40%] h-full flex flex-col p-6 gap-6" style={{ background: '#f0f4f7' }}>
              <div className="bg-white rounded-xl p-8 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-sm uppercase tracking-widest text-[#565e74] font-bold">Question Navigator</h2>
                    <p className="text-xs text-[#566166] mt-1">{listeningData.content?.sections?.reduce((acc: number, s: any) => acc + (s.questions?.length || 0), 0)} Questions</p>
                  </div>
                  <span className="text-[#28619e] text-xs font-bold uppercase tracking-wider">{answeredCount} answered</span>
                </div>
                <div className="grid grid-cols-8 gap-3">
                  {listeningData.content?.sections?.flatMap((s: any) => s.questions || []).map((q: any, i: number) => (
                    <div key={q.id} className={`aspect-square flex items-center justify-center rounded-lg font-bold text-sm ${
                      selectedAnswers[q.id] ? 'bg-[#565e74] text-white' : 'bg-[#e1e9ee] text-[#566166]'
                    }`}>{i + 1}</div>
                  ))}
                </div>
              </div>

              {/* Section Navigation */}
              <nav className="flex flex-col gap-2 mt-4">
                <h2 className="text-sm uppercase tracking-widest text-[#565e74] font-bold px-4 mb-2">Sections</h2>
                {listeningData.content?.sections?.map((sec: any, idx: number) => (
                  <button key={sec.id} onClick={() => setActiveListeningPart(idx)}
                    className={`flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-300 text-left ${
                      idx === activeListeningPart 
                        ? 'bg-white text-[#565e74] font-bold shadow-sm border-l-4 border-[#28619e]'
                        : 'text-[#566166] hover:bg-white/40'
                    }`}>
                    <span className="material-symbols-outlined">filter_{idx + 1}</span>
                    <span className="flex-1">Part {idx + 1}</span>
                  </button>
                ))}
              </nav>

              {/* Exam Tip */}
              <div className="mt-auto p-6 bg-[#89bcff] rounded-xl flex items-center gap-4 text-[#003867]">
                <span className="material-symbols-outlined text-3xl">lightbulb</span>
                <div>
                  <p className="font-bold text-sm">Exam Tip</p>
                  <p className="text-xs opacity-80">Use the time during instructions to read through the questions and underline keywords.</p>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* ════════════ READING ════════════ */}
        {activeTab === "reading" && readingData && (
          <>
            <section className="w-[60%] h-full overflow-y-auto px-12 py-10" style={{ background: '#f7f9fb' }}>
              {/* Passage header */}
              <div className="mb-8 space-y-2">
                <span className="text-xs font-bold tracking-[0.05em] uppercase text-[#566166]">Reading Passage {activeReadingPassage + 1}</span>
                <h1 className="text-3xl font-extrabold text-[#2a3439] tracking-tight">
                  {readingData.content?.sections?.[activeReadingPassage]?.title || "Passage " + (activeReadingPassage + 1)}
                </h1>
              </div>

              {readingData.content?.sections?.[activeReadingPassage]?.instruction && (
                <div className="bg-white border-l-4 border-[#565e74] p-6 rounded-lg mb-8" style={{ boxShadow: '0 8px 32px rgba(42,52,57,0.04)' }}>
                  <p className="text-sm leading-relaxed text-[#2a3439]">{readingData.content.sections[activeReadingPassage].instruction}</p>
                </div>
              )}

              <div className="space-y-8">
                {readingData.content?.sections?.[activeReadingPassage]?.questions?.map((q: any, idx: number) => (
                  <div key={q.id} className="bg-white p-8 rounded-xl border border-[#a9b4b9]/10" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
                    <div className="flex gap-4 mb-6">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#28619e]/10 text-[#28619e] flex items-center justify-center font-bold">{idx + 1}</span>
                      <h4 className="text-xl font-medium text-[#2a3439] leading-tight">{q.text}</h4>
                    </div>
                    {q.type === 'MCQ' && (
                      <div className="grid gap-3 ml-12">
                        {q.options?.map((opt: any) => {
                          const isSelected = selectedAnswers[q.id] === opt.id;
                          return (
                            <label key={opt.id} onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                              className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                                isSelected ? 'bg-[#dae2fd]/20 border-2 border-[#565e74]' : 'bg-[#f0f4f7] border border-transparent hover:border-[#a9b4b9]/30'
                              }`}>
                              <input type="radio" name={q.id} checked={isSelected} readOnly className="w-5 h-5" style={{ accentColor: '#565e74' }} />
                              <span className={`ml-4 ${isSelected ? 'font-semibold text-[#565e74]' : 'text-[#2a3439]'}`}>{opt.label}. {opt.text}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {q.type === 'GAP_FILL' && (
                      <div className="ml-12">
                        <input type="text" placeholder="..." className="bg-[#d9e4ea] border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#565e74] focus:bg-white transition-all w-48 text-[#565e74] font-bold text-center" style={{ outline: 'none' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <aside className="w-[40%] h-full flex flex-col p-6 gap-6" style={{ background: '#f0f4f7' }}>
              <div className="bg-white rounded-xl p-8 flex flex-col gap-6">
                <h2 className="text-sm uppercase tracking-widest text-[#565e74] font-bold">Question Navigator</h2>
                <div className="grid grid-cols-8 gap-3">
                  {readingData.content?.sections?.flatMap((s: any) => s.questions || []).map((q: any, i: number) => (
                    <div key={q.id} className={`aspect-square flex items-center justify-center rounded-lg font-bold text-sm ${
                      selectedAnswers[q.id] ? 'bg-[#565e74] text-white' : 'bg-[#e1e9ee] text-[#566166]'
                    }`}>{i + 1}</div>
                  ))}
                </div>
              </div>
              <nav className="flex flex-col gap-2">
                <h2 className="text-sm uppercase tracking-widest text-[#565e74] font-bold px-4 mb-2">Passages</h2>
                {readingData.content?.sections?.map((sec: any, idx: number) => (
                  <button key={sec.id} onClick={() => setActiveReadingPassage(idx)}
                    className={`flex items-center gap-4 px-4 py-4 rounded-lg transition-all text-left ${
                      idx === activeReadingPassage ? 'bg-white text-[#565e74] font-bold shadow-sm border-l-4 border-[#28619e]' : 'text-[#566166] hover:bg-white/40'
                    }`}>
                    <span className="material-symbols-outlined">description</span>
                    <span className="flex-1 text-sm">Passage {idx + 1}</span>
                  </button>
                ))}
              </nav>
            </aside>
          </>
        )}

        {/* ════════════ WRITING ════════════ */}
        {activeTab === "writing" && writingData && (
          <>
            {/* Left: Task Prompt */}
            <section className="w-[45%] h-full overflow-y-auto px-8 py-10 flex flex-col gap-8" style={{ background: '#f0f4f7' }}>
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-[0.05em] uppercase text-[#566166]">Writing Section</span>
                <h1 className="text-3xl font-extrabold text-[#2a3439] tracking-tight">
                  Writing Task {activeWritingTask + 1}
                </h1>
              </div>
              {/* Instruction Card */}
              <div className="bg-white border-l-4 border-[#565e74] p-6 rounded-lg" style={{ boxShadow: '0 8px 32px rgba(42,52,57,0.04)' }}>
                <p className="leading-relaxed text-[#2a3439] whitespace-pre-wrap">{writingData.content?.tasks?.[activeWritingTask]?.text}</p>
                <div className="mt-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#566166] text-sm">info</span>
                  <span className="text-xs font-bold tracking-[0.05em] uppercase text-[#566166]">
                    Minimum: {writingData.content?.tasks?.[activeWritingTask]?.minWords} words
                  </span>
                </div>
              </div>
              {/* Chart placeholder */}
              <div className="w-full aspect-[4/3] bg-[#d9e4ea] rounded-xl overflow-hidden flex items-center justify-center">
                <div className="text-center text-[#566166]">
                  <span className="material-symbols-outlined text-5xl mb-2 block opacity-30">insert_chart</span>
                  <p className="text-sm font-medium opacity-50">Chart / Diagram Area</p>
                </div>
              </div>
            </section>

            {/* Right: Editor */}
            <section className="w-[55%] h-full bg-white relative flex flex-col">
              <div className="flex-grow p-12 overflow-y-auto">
                <textarea 
                  value={writingText}
                  onChange={(e) => setWritingText(e.target.value)}
                  className="w-full h-full resize-none border-none focus:ring-0 text-lg leading-[1.8] text-[#2a3439]"
                  style={{ outline: 'none', fontFamily: "'Inter', sans-serif" }}
                  placeholder="Start typing your response here…"
                  spellCheck={false}
                ></textarea>
              </div>
              {/* Footer */}
              <footer className="px-8 py-4 flex flex-col gap-4" style={{ background: 'rgba(240,244,247,0.5)', backdropFilter: 'blur(8px)' }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 bg-[#e1e9ee] rounded-full overflow-hidden">
                      <div className="h-full bg-[#28619e] rounded-full" style={{ 
                        width: `${Math.min(100, (writingText.trim().split(/\s+/).filter(Boolean).length / (writingData.content?.tasks?.[activeWritingTask]?.minWords || 150)) * 100)}%`,
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <span className="text-xs font-bold tracking-[0.05em] uppercase text-[#566166]">
                      Word Count: {writingText.trim().split(/\s+/).filter(Boolean).length} / {writingData.content?.tasks?.[activeWritingTask]?.minWords} min
                    </span>
                  </div>
                </div>
                {/* Task Tabs */}
                <div className="flex gap-2 p-1 bg-[#e1e9ee] w-fit rounded-xl">
                  {writingData.content?.tasks?.map((task: any, idx: number) => (
                    <button key={task.id} onClick={() => setActiveWritingTask(idx)}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm transition-all ${
                        idx === activeWritingTask 
                          ? 'bg-white text-[#2a3439] font-bold shadow-sm' 
                          : 'text-[#566166] hover:bg-[#d9e4ea]/50'
                      }`}>
                      <span className="material-symbols-outlined text-lg">{idx === 0 ? 'edit_note' : 'history_edu'}</span>
                      Task {idx + 1}
                    </button>
                  ))}
                </div>
              </footer>
            </section>
          </>
        )}

        {/* ════════════ SPEAKING ════════════ */}
        {activeTab === "speaking" && speakingData && (
          <div className="w-full h-full flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto" style={{ background: '#f7f9fb' }}>
            {/* Background blobs */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full" style={{ background: 'rgba(86,94,116,0.05)', filter: 'blur(120px)' }}></div>
              <div className="absolute bottom-[5%] right-[5%] w-[30%] h-[30%] rounded-full" style={{ background: 'rgba(40,97,158,0.05)', filter: 'blur(100px)' }}></div>
            </div>

            <div className="max-w-4xl mx-auto w-full space-y-8">
              <div className="text-center space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#566166] font-bold">Candidate Task Card</span>
                <h1 className="text-4xl font-bold tracking-tight text-[#2a3439]">
                  {speakingData.content?.parts?.[activeSpeakingPart]?.title || `Part ${activeSpeakingPart + 1}`}
                </h1>
              </div>

              {/* Cue Card */}
              <div className="bg-white p-16 rounded-xl relative overflow-hidden border border-[#a9b4b9]/15" style={{ boxShadow: '0 8px 32px rgba(42,52,57,0.06)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  <svg className="w-full h-full fill-[#565e74]" viewBox="0 0 100 100"><circle cx="90" cy="10" r="40"></circle></svg>
                </div>
                <div className="relative z-10 space-y-6">
                  {speakingData.content?.parts?.[activeSpeakingPart]?.questions?.map((q: any, idx: number) => (
                    <div key={q.id} className="flex items-start gap-4">
                      <div className="mt-2 h-1.5 w-1.5 rounded-full bg-[#28619e] flex-shrink-0"></div>
                      <span className="text-lg text-[#2a3439] leading-relaxed">{q.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recording Interface */}
              <div className="bg-[#f0f4f7] rounded-2xl p-8 space-y-6 flex flex-col items-center">
                {/* Waveform */}
                <div className="w-full flex items-center justify-center gap-1 h-12">
                  {[20,40,60,30,50,20,40,70,50,80,60,30,50,40,20].map((h, i) => (
                    <div key={i} className="w-1.5 rounded-full" style={{ height: `${h}%`, background: i >= 6 ? '#28619e' : `rgba(40,97,158,${0.2 + i * 0.05})`, animation: i >= 6 && i <= 9 ? 'pulse 2s infinite' : 'none' }}></div>
                  ))}
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-[#9f403d]/20 animate-ping"></div>
                    <button className="relative bg-[#9f403d] h-16 w-16 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                      <div className="h-6 w-6 bg-white rounded-sm"></div>
                    </button>
                  </div>
                  <div className="text-center">
                    <span className="block text-2xl font-mono font-bold text-[#2a3439]">01:23</span>
                    <span className="text-xs uppercase tracking-widest text-[#566166] font-semibold">Recording Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Part Navigation */}
            <nav className="fixed bottom-0 left-0 w-full border-t border-[#a9b4b9]/10" style={{ background: 'rgba(247,249,251,0.9)', backdropFilter: 'blur(20px)' }}>
              <div className="max-w-md mx-auto flex items-center justify-around py-3 px-4">
                {speakingData.content?.parts?.map((part: any, idx: number) => (
                  <button key={part.id} onClick={() => setActiveSpeakingPart(idx)}
                    className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${
                      idx === activeSpeakingPart ? 'text-[#28619e]' : 'text-[#566166]'
                    }`}>
                    <span className="material-symbols-outlined text-2xl"
                      style={idx === activeSpeakingPart ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {idx === 0 ? 'chat_bubble' : idx === 1 ? 'record_voice_over' : 'forum'}
                    </span>
                    <span className={`uppercase tracking-widest text-[10px] font-bold ${idx === activeSpeakingPart ? 'border-b-2 border-[#28619e]' : ''}`}>
                      Part {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}
