"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function GroupsPage() {
  // Ready for Supabase connection later
  const [groups, setGroups] = useState<any[]>([]);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  // Load mock groups from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mock_groups');
    if (saved) {
      setGroups(JSON.parse(saved));
    }
  }, []);

  const confirmDeleteGroup = () => {
    if (groupToDelete) {
      const updatedGroups = groups.filter(g => g.id !== groupToDelete);
      setGroups(updatedGroups);
      localStorage.setItem('mock_groups', JSON.stringify(updatedGroups));
      setGroupToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pt-2 animate-in fade-in duration-500">
      
      {/* Dashboard Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15">
          <span className="text-[10px] font-bold tracking-widest text-outline uppercase block mb-1">JAMI GURUHLAR</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-on-surface">{groups.length}</span>
            <span className="text-secondary text-sm font-medium">ta faol guruh</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15">
          <span className="text-[10px] font-bold tracking-widest text-outline uppercase block mb-1">O'RTACHA NATIJA</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-on-surface">0%</span>
            <span className="text-tertiary text-sm font-medium font-bold">+0%</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15">
          <span className="text-[10px] font-bold tracking-widest text-outline uppercase block mb-1">YANGI TOPSHIRIQLAR</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-headline text-on-surface">0</span>
            <span className="text-secondary text-sm font-medium">tekshirilmagan</span>
          </div>
        </div>
      </div>

      {/* Group Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {groups.map(group => (
          <div key={group.id} className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group transition-all duration-300 hover:shadow-[0_32px_64px_-12px_rgba(0,88,188,0.06)] flex flex-col justify-between">
            <div className={`absolute top-0 left-0 w-1 h-full ${group.indicatorColor ?? 'bg-primary'}`}></div>
            <div>
              <div className="flex justify-between items-start mb-6 w-full gap-2">
                <div className="flex-1">
                  <span className="text-[10px] font-bold tracking-widest text-outline uppercase block mb-1">{group.category}</span>
                  <h3 className="text-xl font-extrabold font-headline text-on-surface leading-tight line-clamp-2">{group.title}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`${group.statusColor ?? 'bg-tertiary-container text-on-tertiary-container'} px-3 py-1 rounded-full text-xs font-semibold`}>
                    {group.status}
                  </div>
                  <button onClick={(e) => { e.preventDefault(); setGroupToDelete(group.id); }} className="w-8 h-8 rounded-full hover:bg-error-container/50 text-error flex items-center justify-center transition-colors" title="Guruhni o'chirish">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline text-lg">group</span>
                  <span className="text-on-surface-variant font-medium">{group.studentsCount} o'quvchi</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-lg">analytics</span>
                  <span className="text-on-surface-variant font-medium">O'rtacha natija: <span className="text-on-surface font-bold">{group.avgScore}</span></span>
                </div>
              </div>
            </div>
            <Link href={`/teacher/groups/${group.id}`} className="w-full bg-surface-container-highest py-3 rounded-xl font-bold font-body text-on-surface hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 text-center flex items-center justify-center">
              Guruhni ko'rish
            </Link>
          </div>
        ))}

        {/* Add New Group Empty State Card (Links to Demo for now) */}
        <Link href="/teacher/groups/new" className="group border-2 border-dashed border-outline-variant/30 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-4 hover:border-primary transition-all duration-300 bg-surface-container-low/50 outline-none focus:border-primary">
          <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-3xl text-outline group-hover:text-primary transition-colors">add_circle</span>
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface text-lg">Yangi guruh qo'shish</p>
            <p className="text-xs text-outline font-label mt-1">Guruh vizual ko'rinishini sinab ko'ring</p>
          </div>
        </Link>

      </div>

      <ConfirmModal 
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={confirmDeleteGroup}
        title="Guruhni o'chirish"
        message="Haqiqatan ham bu guruhni butunlay o'chirib yubormoqchimisiz? Guruhga kiritilgan barcha o'quvchilar va natijalar xam o'chib ketishi mumkin."
        confirmText="Ha, o'chirilsin"
        cancelText="Bekor qilish"
      />
    </div>
  );
}
