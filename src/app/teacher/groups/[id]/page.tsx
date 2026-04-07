"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function GroupDetailsPage() {
  const params = useParams();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);

  // Mock group data for UI demonstration
  const groupData = {
    title: "Matematika B1",
    category: "MATEMATIKA",
    joinCode: "MTH-B1-X92",
    inviteLink: "https://mockexam.pro/join/MTH-B1-X92",
  };

  const [students, setStudents] = useState([
    { id: 1, name: "Aliyev Vali", status: "Faol", score: 85, phone: "+998 90 123 45 67" },
    { id: 2, name: "G'aniyev G'ani", status: "Faol", score: 72, phone: "+998 90 765 43 21" },
    { id: 3, name: "Umarov Bobur", status: "Muzlatilgan", score: 0, phone: "+998 93 111 22 33" },
  ]);

  const confirmDeleteStudent = () => {
    if (studentToDelete !== null) {
      setStudents(students.filter(s => s.id !== studentToDelete));
      setStudentToDelete(null);
    }
  };

  const handleToggleFreeze = (id: number) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === "Faol" ? "Muzlatilgan" : "Faol" };
      }
      return s;
    }));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(groupData.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(groupData.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
        
        {/* Left Col: Students List (Empty State for now) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_8px_24px_rgba(25,28,30,0.04)] border border-outline-variant/10">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-headline font-bold text-xl text-on-surface">O'quvchilar ro'yxati</h3>
               <span className="bg-surface-container-high px-4 py-1.5 rounded-full text-sm font-semibold text-on-surface-variant">
                 {students.length} kishi
               </span>
            </div>

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
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold font-headline">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-on-surface text-base">{student.name}</h4>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">{student.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:block text-right">
                        <p className="text-xs text-outline uppercase tracking-wider mb-0.5 font-bold">Holat</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${student.status === 'Faol' ? 'bg-success/10 text-success' : 'bg-outline-variant/20 text-outline'}`}>
                          {student.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleFreeze(student.id)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${student.status === 'Faol' ? 'hover:bg-outline-variant/20 text-outline' : 'hover:bg-success/20 text-success'}`}
                          title={student.status === 'Faol' ? "Muzlatish" : "Faollashtirish"}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {student.status === 'Faol' ? 'ac_unit' : 'play_arrow'}
                          </span>
                        </button>
                        <button 
                          onClick={() => setStudentToDelete(student.id)}
                          className="w-9 h-9 rounded-lg hover:bg-error-container/50 text-error flex items-center justify-center transition-colors"
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
      />
    </div>
  );
}
