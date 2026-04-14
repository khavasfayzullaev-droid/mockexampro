"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function NewGroupPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('bg-primary');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = [
    { name: 'Ko\'k (Asosiy)', class: 'bg-primary' },
    { name: 'Qizil', class: 'bg-error' },
    { name: 'Yashil', class: 'bg-secondary' },
    { name: 'Sariq', class: 'bg-tertiary' },
    { name: 'Siyohrang', class: 'bg-purple-500' },
  ];

  // Generates 6-char random alphanumeric string
  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Guruh nomini kiriting!");
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Avtorizatsiyadan o'tilmagan!");

      const inviteCode = generateInviteCode();

      const { data, error } = await supabase.from('groups').insert({
        teacher_id: user.id,
        title,
        category: category || 'Umumiy',
        invite_code: inviteCode,
        indicator_color: color
      }).select().single();

      if (error) throw error;

      alert(`Guruh muvaffaqiyatli yaratildi! Kod: ${inviteCode}`);
      router.push('/teacher/groups');
      
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-8 animate-in fade-in duration-500">
      
      <div className="mb-8 flex items-center gap-4">
        <Link href="/teacher/groups" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors active:scale-95">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Yangi guruh yaratish</h1>
          <p className="text-on-surface-variant text-sm mt-1">O'quvchilarni bitta joyga jamlash uchun yangi a'zolik muhitini tayyorlang.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Guruh nomi *</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: IELTS Morning 08:00" 
              className="w-full bg-surface-container-highest outline-none px-4 py-3 rounded-xl border border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Guruh yo'nalishi</label>
            <input 
              type="text" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Masalan: IELTS / CEFR / General English" 
              className="w-full bg-surface-container-highest outline-none px-4 py-3 rounded-xl border border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Guruh rangi markeri</label>
            <div className="flex gap-4">
              {colors.map((c) => (
                <button 
                  key={c.class}
                  type="button"
                  onClick={() => setColor(c.class)}
                  className={`w-10 h-10 rounded-full ${c.class} ring-offset-2 ring-offset-surface-container-lowest transition-all ${color === c.class ? 'ring-2 ring-on-surface shadow-md scale-110' : 'opacity-70 hover:opacity-100'}`}
                  title={c.name}
                >
                  {color === c.class && <span className="material-symbols-outlined text-white text-[20px] flex items-center justify-center">check</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/20 flex gap-4">
             <Link 
                href="/teacher/groups" 
                className="flex-1 py-3.5 text-center rounded-xl bg-surface-container-high text-on-surface font-bold hover:bg-surface-container-highest active:scale-95 transition-all"
             >
                Bekor qilish
             </Link>
             <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-[2] py-3.5 rounded-xl bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all flex justify-center items-center gap-2"
             >
                {isSubmitting ? (
                  <><span className="material-symbols-outlined animate-spin">refresh</span> Jarayonda...</>
                ) : (
                  <><span className="material-symbols-outlined">add_task</span> Yaratish va Kodni olish</>
                )}
             </button>
          </div>
        </form>
      </div>

    </div>
  );
}
