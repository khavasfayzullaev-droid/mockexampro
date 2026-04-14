"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function AnalyticsPage() {
  const { id } = useParams() as { id: string };
  const supabase = createClient();
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Load exam metadata
      const { data: examData, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', id)
        .single();
        
      if (examData) setExam(examData);
      setLoading(false);
    }
    
    if (id) loadData();
  }, [id, supabase]);

  if (loading) {
    return <div className="p-10 font-bold text-center text-primary">Yuklanmoqda...</div>;
  }

  if (!exam) {
    return <div className="p-10 font-bold text-center text-error">Imtihon topilmadi.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pt-6 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/teacher/my-exams" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors active:scale-95">
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </Link>
          <div>
            <span className="font-label text-[10px] uppercase tracking-widest text-primary flex items-center gap-1 bg-primary/10 w-fit px-2 py-0.5 rounded-full mb-1">
              <span className="material-symbols-outlined text-[14px]">analytics</span>
              Analitika Moduli
            </span>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface">{exam.title}</h1>
          </div>
        </div>
        
        <button className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-dim transition-colors">
           <span className="material-symbols-outlined text-[18px]">download</span>
           Hisobotni yuklash (.csv)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-outline mb-4">Guruhlarga biriktirilgan</p>
            <p className="font-headline text-4xl font-extrabold text-on-surface">--</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-tertiary mb-4">Topshirgan Talabalar</p>
            <p className="font-headline text-4xl font-extrabold text-tertiary">--</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">O'rtacha Ball (Band)</p>
            <p className="font-headline text-4xl font-extrabold text-secondary">--</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 overflow-hidden">
         <div className="border-b border-outline-variant/15 p-6 bg-surface-container-low/30">
            <h3 className="font-headline text-lg font-bold">Batafsil natijalar</h3>
         </div>
         <div className="p-16 text-center flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl text-outline-variant/50 mb-3">monitoring</span>
            <h4 className="font-bold mb-1 text-on-surface">Statistika shakllanmoqda</h4>
            <p className="text-sm max-w-sm mx-auto">Hali hech qaysi o'quvchi ushbu imtihonni topshirmagan yoki imtihon hech qaysi guruhga biriktirilmagan.</p>
         </div>
      </div>
    </div>
  );
}
