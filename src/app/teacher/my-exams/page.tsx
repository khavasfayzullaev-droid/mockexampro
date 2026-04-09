"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function MyExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchExams() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setExams(data);
      }
      setLoading(false);
    }
    fetchExams();
  }, [supabase]);

  const filteredExams = exams.filter(ex => 
    ex.title?.toLowerCase().includes(search.toLowerCase()) || 
    ex.id.toLowerCase().includes(search.toLowerCase())
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<{id: string, title: string} | null>(null);

  const handleDeleteClick = (id: string, title: string) => {
    setExamToDelete({ id, title });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!examToDelete) return;
    
    try {
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", examToDelete.id);

      if (error) throw error;
      
      setExams(prev => prev.filter(ex => ex.id !== examToDelete.id));
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 relative">
      
      {/* Premium Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-[#191c1e]/60 backdrop-blur-[12px] transition-all"
            onClick={() => setIsDeleteModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.2)] border border-[#c1c6d7]/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            {/* Close Button */}
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-[#717786] hover:bg-slate-100 transition-colors z-10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="p-10 pt-12 text-center">
              <div className="w-24 h-24 bg-[#FF3B30]/10 text-[#FF3B30] rounded-full flex items-center justify-center mx-auto mb-8 transform hover:rotate-12 transition-transform duration-700">
                <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              
              <h4 className="font-headline text-2xl font-black text-[#191c1e] mb-4 tracking-tight">O'chirib tashlansinmi?</h4>
              
              <div className="bg-slate-50 px-6 py-4 rounded-2xl mb-6 border border-slate-100">
                <p className="text-[#414755] text-sm leading-relaxed">
                  <span className="font-extrabold text-[#191c1e]">"{examToDelete?.title}"</span> imtihonini butunlay o'chirib tashlamoqchimisiz?
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="h-px bg-slate-100 flex-1"></div>
                <p className="text-[#FF3B30] font-black text-[10px] uppercase tracking-[2px]">ORTGA QAYTARIB BO'LMAYDI</p>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-8 py-4 rounded-2xl bg-slate-100 text-[#191c1e] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  Bekor qilish
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-[1.4] px-8 py-4 rounded-2xl bg-[#FF3B30] text-white font-black text-xs uppercase tracking-widest shadow-[0_12px_24px_rgba(255,59,48,0.3)] hover:shadow-[0_16px_32px_rgba(255,59,48,0.4)] hover:brightness-110 active:scale-95 transition-all"
                >
                  Ha, o'chirilsin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-1">KUTUBXONA</p>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Mening Imtihonlarim</h2>
        </div>
        <Link 
          href="/teacher/exam-builder" 
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl shadow-[0_8px_16px_rgba(37,96,252,0.15)] hover:shadow-[0_12px_24px_rgba(37,96,252,0.25)] hover:scale-[1.02] active:scale-95 transition-all font-bold"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Yangi Imtihon Yaratish
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="font-headline text-xl font-bold">Barcha imtihonlar ({exams.length})</h3>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg transition-colors group-focus-within:text-primary">search</span>
          <input
            type="text"
            placeholder="Nomi bo'yicha izlash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant/30 px-4 py-2.5 pl-10 rounded-xl text-sm w-full sm:w-80 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-inter placeholder:text-on-surface-variant text-on-surface shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-4 text-primary">
            <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
            <p className="font-bold">Yuklanmoqda...</p>
          </div>
        </div>
      ) : filteredExams.length === 0 ? (
         <div className="bg-surface-container-lowest rounded-2xl p-16 shadow-[0_8px_24px_rgba(25,28,30,0.04)] text-center text-on-surface-variant flex flex-col items-center justify-center">
             <span className="material-symbols-outlined text-6xl text-outline-variant/50 mb-4">folder_open</span>
             <h4 className="font-headline text-xl font-bold text-on-surface mb-2">Imtihonlar topilmadi</h4>
             <p className="max-w-md mx-auto text-sm">Hali hech qanday imtihon yaratmagansiz. Yangi mock imtihon yaratish uchun yuqoridagi tugmani bosing.</p>
         </div>
      ) : (
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_24px_rgba(25,28,30,0.04)] border border-transparent hover:border-outline-variant/30 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80"></div>
              
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary border border-outline-variant/20 shadow-inner group-hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-2xl">{exam.type === 'speaking' ? 'record_voice_over' : exam.type === 'writing' ? 'edit_note' : 'assignment'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">Mock Imtihon</span>
                    <span className="text-[10px] text-outline font-label uppercase tracking-wider">{new Date(exam.created_at).toLocaleDateString()}</span>
                  </div>
                  <Link href={`/teacher/exam-builder?edit=${exam.id}`} className="font-headline font-bold text-xl text-on-surface hover:text-primary transition-colors cursor-pointer text-left block">
                    {exam.title || "Nomsiz Imtihon"}
                  </Link>
                  <p className="text-xs text-on-surface-variant mt-1.5 font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">tag</span> {exam.id.substring(0,8).toUpperCase()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-surface-container-high text-on-surface hover:bg-surface-dim hover:text-primary px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-transparent hover:border-outline-variant/20 active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">group_add</span>
                  <span className="hidden lg:inline whitespace-nowrap">Guruhga biriktirish</span>
                </button>
                <Link href={`/dashboard/exam/${exam.id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  <span className="hidden lg:inline whitespace-nowrap">Ko'rib chiqish</span>
                </Link>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                  <span className="hidden lg:inline whitespace-nowrap">Natijalar</span>
                </button>

                <div className="flex items-center gap-2 border-l border-outline-variant/30 pl-2">
                  <Link 
                    href={`/teacher/exam-builder?edit=${exam.id}`}
                    className="p-2.5 rounded-xl bg-surface-container-high text-on-surface hover:text-primary hover:bg-surface-dim transition-all shadow-sm border border-transparent hover:border-outline-variant/20 active:scale-95 flex items-center justify-center"
                    title="Tahrirlash"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </Link>
                  <button 
                    onClick={() => handleDeleteClick(exam.id, exam.title)}
                    className="p-2.5 rounded-xl bg-error/10 text-error hover:bg-error hover:text-white transition-all shadow-sm border border-transparent hover:border-error/20 active:scale-95 flex items-center justify-center"
                    title="O'chirish"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
