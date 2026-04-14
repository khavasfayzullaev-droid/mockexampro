"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { createClient } from '@/utils/supabase/client';

export default function GroupDetailsPage() {
  const { id } = useParams() as { id: string };
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const [groupData, setGroupData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'students' | 'exams'>('students');
  const [assignedExams, setAssignedExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchGroupDetails() {
      if (!id) return;
      
      const { data: groupReq } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();
        
      if (groupReq) {
        setGroupData({
           title: groupReq.title,
           category: groupReq.category,
           joinCode: groupReq.invite_code,
           inviteLink: `${window.location.origin}/join/${groupReq.invite_code}`
        });
      }

      const { data: groupStudentsReq } = await supabase
        .from('group_students')
        .select(`
          id,
          student_id,
          joined_at,
          profiles ( display_name )
        `)
        .eq('group_id', id);

      if (groupStudentsReq) {
        setStudents(groupStudentsReq.map(st => ({
          id: st.id,
          student_id: st.student_id,
          name: st.profiles?.display_name || "Noma'lum O'quvchi",
          joined_at: st.joined_at
        })));
      }

      const { data: groupExamsReq } = await supabase
        .from('group_exams')
        .select(`
          id,
          exam_id,
          assigned_at,
          deadline,
          exams ( title )
        `)
        .eq('group_id', id);

      if (groupExamsReq) {
         setAssignedExams(groupExamsReq);
      }

      setLoading(false);
    }
    fetchGroupDetails();
  }, [id, supabase]);

  const confirmDeleteStudent = async () => {
    if (studentToDelete) {
      try {
        const { error } = await supabase.from('group_students').delete().eq('id', studentToDelete);
        if (error) throw error;
        
        setStudents(students.filter(s => s.id !== studentToDelete));
        setStudentToDelete(null);
      } catch (err: any) {
        alert("Xatolik: " + err.message);
      }
    }
  };

  const copyLink = () => {
    if (!groupData) return;
    navigator.clipboard.writeText(groupData.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    if (!groupData) return;
    navigator.clipboard.writeText(groupData.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return <div className="p-10 text-center font-bold text-primary">Yuklanmoqda...</div>;
  }

  if (!groupData) {
    return <div className="p-10 text-center font-bold text-error">Guruh topilmadi!</div>;
  }

  return (
    <div className="max-w-7xl mx-auto pt-2 animate-in fade-in duration-500 pb-12">
      {/* Breadcrumb & Header */}
      <div className="mb-8 flex flex-col gap-4">
        <Link href="/teacher/groups" className="text-primary font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity w-fit text-sm">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Guruhlarga qaytish
        </Link>
        <div>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-1">{groupData.category}</p>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">{groupData.title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Dynamic Content based on Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_8px_24px_rgba(25,28,30,0.04)] border border-outline-variant/10">
            {/* Tabs */}
            <div className="flex border-b border-outline-variant/20 mb-8 gap-6">
                <button 
                  onClick={() => setActiveTab('students')}
                  className={`pb-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'students' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    O'quvchilar ({students.length})
                </button>
                <button 
                  onClick={() => setActiveTab('exams')}
                  className={`pb-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'exams' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Biriktirilgan Imtihonlar ({assignedExams.length})
                </button>
            </div>

            {/* Content: Students */}
            {activeTab === 'students' && (
                <>
                  {students.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-surface-container-lowest border-2 border-dashed border-outline-variant/30 rounded-2xl">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-primary">person_add</span>
                        </div>
                        <h4 className="font-headline font-bold text-xl mb-3 text-on-surface">Hali o'quvchilar yo'q</h4>
                        <p className="text-on-surface-variant max-w-md mx-auto text-sm leading-relaxed mb-8">
                        O'quvchilar ro'yxati bo'sh. O'ng tomondagi taklif kodini ulashish orqali guruhni shakllantiring.
                        </p>
                    </div>
                    ) : (
                    <div className="space-y-4">
                        {students.map(student => (
                        <div key={student.id} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/20 hover:border-outline-variant/40 hover:bg-surface-container-lowest transition-all group">
                            <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold font-headline uppercase">
                                {student.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-headline font-bold text-on-surface text-base">{student.name}</h4>
                                <p className="text-xs text-on-surface-variant font-medium mt-0.5">Qo'shildi: {new Date(student.joined_at).toLocaleDateString()}</p>
                            </div>
                            </div>
                            <div className="flex items-center gap-6">
                            <div className="hidden sm:block text-right">
                                <p className="text-xs text-outline uppercase tracking-wider mb-0.5 font-bold">Holat</p>
                                <span className="text-xs font-bold px-2 py-1 rounded-md bg-success/10 text-success">
                                Faol
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                onClick={() => setStudentToDelete(student.id)}
                                className="w-10 h-10 rounded-xl hover:bg-error/10 text-error flex items-center justify-center transition-colors"
                                title="O'chirish"
                                >
                                <span className="material-symbols-outlined text-[20px]">person_remove</span>
                                </button>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </>
            )}

            {/* Content: Exams */}
            {activeTab === 'exams' && (
                <>
                  {assignedExams.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-surface-container-lowest border-2 border-dashed border-outline-variant/30 rounded-2xl">
                        <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-secondary">feed</span>
                        </div>
                        <h4 className="font-headline font-bold text-xl mb-3 text-on-surface">Imtihonlar biriktirilmagan</h4>
                        <p className="text-on-surface-variant max-w-md mx-auto text-sm leading-relaxed mb-8">
                           Guruhga imtihon berish uchun <b>Kutubxona</b> (My Exams) bo'limiga o'tib, u yerdan "Biriktirish" (Assign) tugmasidan foydalaning.
                        </p>
                        <Link href="/teacher/my-exams" className="bg-surface-container-high px-6 py-3 shadow-sm rounded-xl font-bold text-sm text-on-surface hover:bg-surface-container-highest transition-colors inline-block text-center mt-2">
                           Kutubxonaga o'tish
                        </Link>
                    </div>
                    ) : (
                    <div className="space-y-4">
                        {assignedExams.map(ae => (
                        <div key={ae.id} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/20 hover:border-outline-variant/40 hover:bg-surface-container-lowest transition-all group">
                            <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                                <span className="material-symbols-outlined">quiz</span>
                            </div>
                            <div>
                                <h4 className="font-headline font-bold text-on-surface text-base">{ae.exams?.title || "Noma'lum Imtihon"}</h4>
                                <p className="text-xs text-on-surface-variant font-medium mt-0.5">Berildi: {new Date(ae.assigned_at).toLocaleDateString()}</p>
                            </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Deadline</p>
                                <p className="text-sm font-bold text-error">
                                    {ae.deadline ? new Date(ae.deadline).toLocaleString() : 'Cheklanmagan'}
                                </p>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </>
            )}
          </div>
        </div>

        {/* Right Col: Invite Code & Link Widget */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary via-primary to-[#003b82] text-white rounded-3xl p-8 shadow-[0_24px_48px_-12px_rgba(0,88,188,0.4)] relative overflow-hidden group/widget border border-primary-container/30">
            {/* Ambient Glow Effects */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/20 rounded-full blur-[80px] pointer-events-none transition-transform duration-700 group-hover/widget:translate-x-10 group-hover/widget:translate-y-10"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary-fixed/30 rounded-full blur-[60px] pointer-events-none"></div>
            
            <header className="relative z-10 mb-8">
              <h3 className="font-headline font-extrabold text-2xl mb-1 flex items-center gap-3 tracking-tight">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/10">
                  <span className="material-symbols-outlined text-white text-[20px]">share</span>
                </div>
                Taklif qilish
              </h3>
              <p className="text-primary-fixed-dim mt-3 leading-relaxed font-body font-medium text-[13px]">
                O'quvchilarni guruhga qo'shish uchun quyidagi maxsus kod yoki tezkor havoladan (link) foydalaning. Havolani Telegram orqali yuborsangiz, o'quvchilar to'g'ridan-to'g'ri ro'yxatdan o'tib guruhga avtomatik qo'shiladilar.
              </p>
            </header>

            <div className="space-y-4 relative z-10">
              {/* Group Code */}
              <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:bg-white/[0.15] transition-colors relative group">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary-fixed-dim mb-3 font-label">Guruh Kodi</p>
                <div className="flex items-center justify-between">
                  <span className="font-headline font-black text-4xl tracking-widest text-white drop-shadow-sm">
                    {groupData.joinCode}
                  </span>
                  <button 
                    onClick={copyCode}
                    className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white text-white hover:text-primary transition-all duration-300 flex items-center justify-center shadow-sm active:scale-90"
                    title="Kodni nusxalash"
                  >
                    <span className="material-symbols-outlined max-w-full">
                      {copiedCode ? 'check_circle' : 'content_copy'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Invite Link */}
              <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:bg-white/[0.15] transition-colors">
                 <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary-fixed-dim mb-3 font-label">Tezkor Havola</p>
                 <div className="flex items-center gap-3">
                   <div className="bg-black/20 px-4 py-3 rounded-xl text-sm truncate flex-1 font-mono text-primary-fixed select-all border border-black/10 shadow-inner">
                     {groupData.inviteLink}
                   </div>
                   <button 
                    onClick={copyLink}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap shadow-md active:scale-95 ${copied ? 'bg-success text-white' : 'bg-white text-primary hover:bg-primary-fixed'}`}
                   >
                     {copied ? 'Nusxalandi!' : 'Nusxalash'}
                   </button>
                 </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 relative z-10 flex gap-4 opacity-90 items-start">
              <span className="material-symbols-outlined text-primary-fixed-dim text-lg">info</span>
              <p className="text-[13px] text-primary-fixed-dim leading-relaxed font-medium font-body">
                Platformadan avval ro'yxatdan o'tgan o'quvchilar o'z kabinetidagi "Guruhga qo'shilish" tugmasini bosib shu kodni terishlari ham mumkin. Yangi o'quvchilar uchun esa Havolani yuborganingiz qulayroq.
              </p>
            </div>
          </div>
        </div>

      </div>

      <ConfirmModal 
        isOpen={studentToDelete !== null}
        onClose={() => setStudentToDelete(null)}
        onConfirm={confirmDeleteStudent}
        title="O'quvchini o'chirish"
        message="Haqiqatan ham ushbu o'quvchini guruhdan butunlay o'chirishni xohlaysizmi? Uning barcha joriy natijalari o'chib ketadi."
        confirmText="Ha, o'chirilsin"
        cancelText="Bekor qilish"
        isDestructive={true}
      />
    </div>
  );
}
