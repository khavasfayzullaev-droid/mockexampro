"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewGroupPage() {
  const [groupName, setGroupName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const [createdGroup, setCreatedGroup] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || isSaving) return;

    setIsSaving(true);
    
    // Simulating database save using localStorage for frontend demonstration
    const newGroup = {
      id: Date.now().toString(),
      title: groupName,
      category: "GURUH",
      status: "Yangi",
      statusColor: "bg-tertiary-container text-on-tertiary-container",
      indicatorColor: "bg-primary",
      studentsCount: 0,
      avgScore: "0%",
      joinCode: "MTH-" + Math.floor(Math.random() * 10000),
      inviteLink: "https://mockexam.pro/join/" + Math.floor(Math.random() * 10000)
    };

    const existingGroups = JSON.parse(localStorage.getItem('mock_groups') || '[]');
    localStorage.setItem('mock_groups', JSON.stringify([...existingGroups, newGroup]));

    setCreatedGroup(newGroup);
    setIsSaving(false);
  };

  const copyLink = () => {
    if (createdGroup) {
      navigator.clipboard.writeText(createdGroup.inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const copyCode = () => {
    if (createdGroup) {
      navigator.clipboard.writeText(createdGroup.joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCloseModal = () => {
    router.push('/teacher/groups');
  };

  return (
    <div className="max-w-4xl mx-auto pt-2 animate-in fade-in duration-500 pb-12">
      {/* Breadcrumbs / Context Header */}
      <div className="mb-8 flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-[0.05em] font-medium font-label">
        <Link href="/teacher/groups" className="hover:text-primary transition-colors">Guruhlar</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-bold">Yangi qo'shish</span>
      </div>

      {/* Main Form Card (Glassmorphism) */}
      <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_32px_64px_-12px_rgba(25,28,30,0.06)] p-8 md:p-12 mb-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <header className="mb-10 relative z-10">
          <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight mb-3">Guruh ma'lumotlari</h1>
          <div className="h-1.5 w-16 bg-gradient-to-r from-primary to-primary-container rounded-full"></div>
        </header>

        <form className="space-y-8 relative z-10" onSubmit={handleSave}>
          {/* Group Name Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-on-surface-variant tracking-wider pl-1 font-label" htmlFor="group_name">
              Guruh nomini kiriting
            </label>
            <div className="relative group">
              <input 
                className="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface font-headline font-bold text-lg focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[0_8px_24px_rgba(0,88,188,0.1)] transition-all duration-300 shadow-sm outline-none" 
                id="group_name" 
                name="group_name" 
                placeholder="" 
                type="text" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-focus-within:w-full rounded-full"></div>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-4 p-5 bg-secondary-container/30 rounded-xl border border-secondary-container/50">
            <span className="material-symbols-outlined text-primary mt-0.5">info</span>
            <p className="text-sm leading-relaxed text-on-secondary-container font-medium font-body">
              Guruh saqlangandan so'ng sizga o'quvchilarni taklif qilish uchun maxsus havola (Link) va ID Kod taqdim etiladi.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-outline-variant/10">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button type="submit" disabled={isSaving} className="flex-1 sm:flex-none text-center px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(0,88,188,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(0,88,188,0.5)] transition-all active:scale-95 font-body disabled:opacity-60 disabled:cursor-not-allowed">
                {isSaving ? "Saqlanmoqda…" : "Saqlash"}
              </button>
              <Link href="/teacher/groups" className="flex-1 sm:flex-none text-center px-8 py-4 bg-surface-container-highest text-on-surface font-semibold rounded-xl hover:bg-surface-container-high transition-colors active:scale-95 font-body">
                Bekor qilish
              </Link>
            </div>
          </div>
        </form>
      </section>

      {/* Success Modal with Invite Options */}
      {createdGroup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-white w-full max-w-[480px] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header portion */}
            <div className="bg-gradient-to-br from-primary via-primary to-[#003b82] text-white p-8 pb-10 text-center relative">
              <button onClick={handleCloseModal} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
              
              <div className="w-20 h-20 bg-success/20 border-4 border-success/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="material-symbols-outlined text-4xl text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h2 className="font-headline font-bold text-2xl tracking-tight mb-2">Guruh muvaffaqiyatli yaratildi!</h2>
              <p className="text-white/80 text-sm">O'quvchilarni guruhga qo'shish uchun quyidagi ma'lumotlarni ulashing</p>
            </div>

            {/* Content portion */}
            <div className="p-8 pb-10 bg-white">
              <div className="space-y-6">
                
                {/* Invite Link */}
                <div className="relative">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline mb-2 block">Tezkor havola (Link)</label>
                  <div className="flex gap-2">
                    <div className="bg-surface-container-low px-4 py-3 rounded-xl text-sm border border-outline-variant/30 flex-1 truncate font-mono text-on-surface">
                      {createdGroup.inviteLink}
                    </div>
                    <button 
                      onClick={copyLink}
                      className={`px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${copiedLink ? 'bg-success text-white' : 'bg-primary text-white hover:bg-primary-dark active:scale-95'}`}
                    >
                      {copiedLink ? 'Nusxalandi!' : 'Nusxalash'}
                    </button>
                  </div>
                </div>

                {/* divider */}
                <div className="flex items-center gap-4">
                  <div className="h-px bg-outline-variant/20 flex-1"></div>
                  <span className="text-xs font-bold text-outline uppercase">Yoki kiritish u-n</span>
                  <div className="h-px bg-outline-variant/20 flex-1"></div>
                </div>

                {/* Code format */}
                <div className="relative group">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline mb-2 block text-center">Guruh ID kodi</label>
                  <div className="flex justify-center items-center gap-4">
                    <span className="font-headline font-black text-3xl tracking-widest text-[#191c1e] bg-surface-container-lowest px-6 py-3 rounded-2xl border-2 border-primary/20 shadow-sm">
                      {createdGroup.joinCode}
                    </span>
                    <button 
                      onClick={copyCode}
                      className="w-12 h-12 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center border border-outline-variant/30 active:scale-95 text-on-surface"
                      title="Kodni nusxalash"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {copiedCode ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>
                
              </div>
              
              <button 
                onClick={handleCloseModal}
                className="w-full mt-8 bg-surface-container-highest text-on-surface py-3.5 rounded-xl font-bold hover:bg-surface-container-high transition-colors active:scale-95"
              >
                Guruhlarni ko'rish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
