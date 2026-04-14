"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { createClient } from '@/utils/supabase/client';

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalGroups: 0, totalStudents: 0 });
  const supabase = createClient();

  useEffect(() => {
    async function fetchGroups() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Haqiqiy guruhlarni va oquvchilar sonini yuklaymiz
      const { data: groupsData, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_students (count)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (groupsData) {
        setGroups(groupsData);
        const totalStuds = groupsData.reduce((acc, curr) => acc + (curr.group_students[0]?.count || 0), 0);
        setStats({
          totalGroups: groupsData.length,
          totalStudents: totalStuds
        });
      }
      setLoading(false);
    }
    fetchGroups();
  }, [supabase]);

  const confirmDeleteGroup = async () => {
    if (groupToDelete) {
      try {
        const { error } = await supabase.from('groups').delete().eq('id', groupToDelete);
        if (error) throw error;
        
        setGroups(groups.filter(g => g.id !== groupToDelete));
        setGroupToDelete(null);
      } catch (err: any) {
        alert("Xatolik yuz berdi: " + err.message);
      }
    }
  };

  if (loading) {
     return <div className="p-10 text-center font-bold text-primary">Yuklanmoqda...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto pt-2 animate-in fade-in duration-500">
      
      {/* Dashboard Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15">
          <span className="text-[10px] font-bold tracking-widest text-outline uppercase block mb-1">JAMI GURUHLAR</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-on-surface">{stats.totalGroups}</span>
            <span className="text-secondary text-sm font-medium">ta guruh faol</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15">
          <span className="text-[10px] font-bold tracking-widest text-outline uppercase block mb-1">UMUMIY O'QUVCHILAR</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-on-surface">{stats.totalStudents}</span>
            <span className="text-tertiary text-sm font-medium">ta a'zo</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15">
          <span className="text-[10px] font-bold tracking-widest text-outline uppercase block mb-1">YANGI TOPSHIRIQLAR</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-on-surface">-</span>
            <span className="text-secondary text-sm font-medium">topshiriqlar funksiyasi</span>
          </div>
        </div>
      </div>

      {/* Group Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {groups.map(group => (
          <div key={group.id} className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group transition-all duration-300 hover:shadow-[0_32px_64px_-12px_rgba(0,88,188,0.06)] flex flex-col justify-between">
            <div className={`absolute top-0 left-0 w-1 h-full ${group.indicator_color}`}></div>
            <div>
              <div className="flex justify-between items-start mb-6 w-full gap-2">
                <div className="flex-1">
                  <span className="text-[10px] font-bold tracking-widest text-outline uppercase block mb-1">{group.category}</span>
                  <h3 className="text-xl font-extrabold font-headline text-on-surface leading-tight line-clamp-2">{group.title}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 border-l border-outline-variant/30 pl-2 ml-1">
                    <Link href={`/teacher/groups/${group.id}`} className="w-8 h-8 rounded-full hover:bg-primary/10 text-primary flex items-center justify-center transition-colors" title="A'zolarni boshqarish">
                      <span className="material-symbols-outlined text-[18px]">group_add</span>
                    </Link>
                    <button onClick={(e) => { e.preventDefault(); setGroupToDelete(group.id); }} className="w-8 h-8 rounded-full hover:bg-error-container/50 text-error flex items-center justify-center transition-colors" title="Guruhni o'chirish">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline text-lg">group</span>
                  <span className="text-on-surface-variant font-medium">{group.group_students?.[0]?.count || 0} o'quvchi</span>
                </div>
                
                {/* Invite Code / Havola */}
                <div className="bg-surface-container-high/50 p-3 rounded-lg border border-outline-variant/10 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-outline">Guruh KODI</span>
                      <span className="font-mono text-sm font-bold text-primary tracking-widest">{group.invite_code}</span>
                   </div>
                   <button 
                     onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(group.invite_code); alert("Kod nusxalandi!") }} 
                     className="w-8 h-8 bg-white dark:bg-slate-700 rounded-md shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-on-surface"
                     title="Kodni nusxalash"
                   >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                   </button>
                </div>
              </div>
            </div>
            <Link href={`/teacher/groups/${group.id}`} className="w-full bg-surface-container-highest py-3 rounded-xl font-bold font-body text-on-surface hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 text-center flex items-center justify-center">
              Ichiga kirish
            </Link>
          </div>
        ))}

        {/* Add New Group Action Box */}
        <Link href="/teacher/groups/new" className="group border-2 border-dashed border-outline-variant/30 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-4 hover:border-primary transition-all duration-300 bg-surface-container-low/50 outline-none focus:border-primary">
          <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-3xl text-outline group-hover:text-primary transition-colors">add_circle</span>
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface text-lg">Yangi guruh yaratish</p>
            <p className="text-xs text-outline font-label mt-1">O'quvchilar a'zo bo'lishi uchun maxsus kod oling!</p>
          </div>
        </Link>

      </div>

      <ConfirmModal 
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={confirmDeleteGroup}
        title="Guruhni o'chirish"
        message="Haqiqatan ham bu guruhni butunlay o'chirib yubormoqchimisiz? Guruh kodi orqali a'zo bo'lgan talabalar ham o'chib ketadi."
        confirmText="Ha, o'chirilsin"
        cancelText="Bekor qilish"
        isDestructive={true}
      />
    </div>
  );
}
