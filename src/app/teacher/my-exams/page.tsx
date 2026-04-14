"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function MyExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  // For assignment modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [examToAssign, setExamToAssign] = useState<{id: string, title: string} | null>(null);
  const [teacherGroups, setTeacherGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    async function fetchExamsAndGroups() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [examsRes, groupsRes] = await Promise.all([
        supabase.from("exams").select("*").eq("teacher_id", user.id).order("created_at", { ascending: false }),
        supabase.from("groups").select("id, title").eq("teacher_id", user.id).order("created_at", { ascending: false })
      ]);

      if (examsRes.data) setExams(examsRes.data);
      if (groupsRes.data) setTeacherGroups(groupsRes.data);
      setLoading(false);
    }
    fetchExamsAndGroups();
  }, [supabase]);

  const filteredExams = exams.filter(ex => 
    ex.title?.toLowerCase().includes(search.toLowerCase()) || 
    ex.id.toLowerCase().includes(search.toLowerCase())
  );

  // Delete Exam Logic
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<{id: string, title: string} | null>(null);

  const handleDeleteClick = (id: string, title: string) => {
    setExamToDelete({ id, title });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!examToDelete) return;
    try {
      const { error } = await supabase.from("exams").delete().eq("id", examToDelete.id);
      if (error) throw error;
      setExams(prev => prev.filter(ex => ex.id !== examToDelete.id));
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    } catch (err: any) { alert("Xatolik: " + err.message); }
  };

  // Assign Exam Logic
  const openAssignModal = (id: string, title: string) => {
    setExamToAssign({ id, title });
    setSelectedGroup('');
    setDeadlineDate('');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return alert("Iltimos guruhni tanlang");
    
    setIsAssigning(true);
    try {
      let deadlineTimestamp = null;
      if (deadlineDate) {
        deadlineTimestamp = new Date(`${deadlineDate}T${deadlineTime}:00`).toISOString();
      }

      const { error } = await supabase.from('group_exams').insert({
        group_id: selectedGroup,
        exam_id: examToAssign!.id,
        deadline: deadlineTimestamp,
        status: 'active'
      });

      if (error) {
        if (error.code === '23505') throw new Error("Bu imtihon avval ushbu guruhga biriktirilgan!");
        throw error;
      }

      alert("Imtihon guruhga muvaffaqiyatli biriktirildi!");
      setIsAssignModalOpen(false);
      setExamToAssign(null);
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 relative">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setExamToDelete(null); }}
        onConfirm={confirmDelete}
        title="Imtihonni o'chirish"
        message={`Haqiqatan ham bu imtihonni butunlay o'chirib yubormoqchimisiz? Imtihonga kiritilgan barcha savollar va natijalar xam o'chib ketadi.`}
        confirmText="Ha, o'chirilsin"
        cancelText="Bekor qilish"
        isDestructive={true}
      />

      {/* Assign to Group Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2">Guruhga biriktirish</h3>
            <p className="text-sm font-medium text-on-surface-variant mb-6 line-clamp-2">Imtihon: <span className="font-bold text-primary">{examToAssign?.title}</span></p>

            <form onSubmit={handleAssignSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-2">Guruhni tanlang *</label>
                {teacherGroups.length === 0 ? (
                  <p className="text-sm text-error bg-error/10 p-3 rounded-lg font-medium">Sizda guruhlar mavjud emas. Oldin guruh yarating.</p>
                ) : (
                  <div className="relative">
                    <select 
                      value={selectedGroup} 
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full bg-surface-container-highest border border-transparent focus:border-primary px-4 py-3.5 rounded-xl outline-none appearance-none font-medium cursor-pointer"
                      required
                    >
                      <option value="" disabled>--- Guruh ro'yxatdan tanlang ---</option>
                      {teacherGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-2">Tugash vaqti (Deadline) / Ixtiyoriy</label>
                <div className="flex gap-3">
                  <input 
                    type="date" 
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="flex-1 bg-surface-container-highest px-4 py-3 rounded-xl border border-transparent focus:border-primary outline-none text-sm font-medium"
                  />
                  <input 
                    type="time" 
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    disabled={!deadlineDate}
                    className="w-32 bg-surface-container-highest px-4 py-3 rounded-xl border border-transparent focus:border-primary outline-none text-sm font-medium disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/20 flex gap-3">
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-3 rounded-xl bg-surface-container-high font-bold text-on-surface">Bekor qilish</button>
                <button type="submit" disabled={isAssigning || teacherGroups.length === 0} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95">
                  {isAssigning ? <><span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> Sabr...</> : 'Biriktirish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-1 font-bold">KUTUBXONA</p>
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
        <div className="flex items-center justify-center p-12"><div className="flex flex-col items-center gap-4 text-primary"><span className="material-symbols-outlined text-4xl animate-spin">refresh</span><p className="font-bold">Yuklanmoqda...</p></div></div>
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
                {/* ASSIGN TO GROUP */}
                <button 
                  onClick={() => openAssignModal(exam.id, exam.title || "Imtihon")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-surface-container-high text-on-surface hover:bg-surface-dim hover:text-primary px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-transparent hover:border-outline-variant/20 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">group_add</span>
                  <span className="hidden lg:inline whitespace-nowrap">Biriktirish</span>
                </button>

                {/* RESULTS ANALYTICS */}
                <Link 
                  href={`/teacher/my-exams/${exam.id}/analytics`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                  <span className="hidden lg:inline whitespace-nowrap">Natijalar</span>
                </Link>

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
