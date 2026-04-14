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
  const [stats, setStats] = useState({ groupsAssigned: 0, studentsSubmitted: 0, avgScore: 0 });
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;

      // Load exam metadata
      const { data: examData } = await supabase.from('exams').select('*').eq('id', id).single();
      if (examData) setExam(examData);

      // Load groups assigned
      const { count: grCount } = await supabase.from('group_exams')
        .select('*', { count: 'exact', head: true })
        .eq('exam_id', id);

      // Load specific results
      const { data: resultsReq } = await supabase.from('results')
        .select('*, profiles(display_name)')
        .eq('exam_id', id)
        .order('submitted_at', { ascending: false });

      if (resultsReq) {
        setResultsList(resultsReq);
        const graded = resultsReq.filter(r => r.status === 'graded' && r.overall_band);
        const totalScore = graded.reduce((acc, r) => acc + (Number(r.overall_band) || 0), 0);
        const avg = graded.length > 0 ? (totalScore / graded.length).toFixed(1) : '0.0';

        setStats({
          groupsAssigned: grCount || 0,
          studentsSubmitted: resultsReq.length,
          avgScore: Number(avg)
        });
      }

      setLoading(false);
    }
    
    loadData();
  }, [id, supabase]);

  if (loading) {
    return <div className="p-10 font-bold text-center text-primary">Yuklanmoqda...</div>;
  }

  if (!exam) {
    return <div className="flex flex-col items-center justify-center p-10"><h2 className="text-xl font-bold text-error mb-4">Imtihon topilmadi.</h2><Link href="/teacher/my-exams" className="text-primary underline">Kutubxonaga qaytish</Link></div>;
  }

  return (
    <div className="max-w-6xl mx-auto pt-6 animate-in fade-in duration-500 pb-20">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <p className="font-headline text-4xl font-extrabold text-on-surface">{stats.groupsAssigned}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-tertiary mb-4">Topshirgan Talabalar</p>
            <p className="font-headline text-4xl font-extrabold text-tertiary">{stats.studentsSubmitted}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">O'rtacha Ball (Band)</p>
            <p className="font-headline text-4xl font-extrabold text-secondary">{stats.avgScore}</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 overflow-hidden shadow-sm">
         <div className="border-b border-outline-variant/15 p-6 bg-surface-container-low/30">
            <h3 className="font-headline text-lg font-bold">Batafsil natijalar</h3>
         </div>
         {resultsList.length === 0 ? (
           <div className="p-16 text-center flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl text-outline-variant/50 mb-3">monitoring</span>
              <h4 className="font-bold mb-1 text-on-surface">Statistika shakllanmoqda</h4>
              <p className="text-sm max-w-sm mx-auto">Hali hech qaysi o'quvchi ushbu imtihonni topshirmagan yoki imtihon hech qaysi guruhga biriktirilmagan.</p>
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-surface-container-lowest border-b border-outline-variant/10">
                      <th className="px-6 py-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">O'quvchi</th>
                      <th className="px-6 py-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">Topshirilgan sana</th>
                      <th className="px-6 py-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">Holat</th>
                      <th className="px-6 py-4 font-label text-xs uppercase tracking-widest text-on-surface-variant text-right">Yakuniy Ball</th>
                      <th className="px-6 py-4 font-label text-xs uppercase tracking-widest text-on-surface-variant text-center">Harakat</th>
                   </tr>
                </thead>
                <tbody>
                   {resultsList.map((res) => (
                      <tr key={res.id} className="border-b border-outline-variant/5 hover:bg-surface-container-lowest/50 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase">
                                  {res.profiles?.display_name?.charAt(0) || "U"}
                               </div>
                               <span className="font-bold text-sm text-on-surface">{res.profiles?.display_name || "Noma'lum O'quvchi"}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-sm text-on-surface-variant">
                            {new Date(res.submitted_at).toLocaleString()}
                         </td>
                         <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${res.status === 'pending' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-success/10 text-success'}`}>
                               {res.status === 'pending' ? 'Kutuvda' : 'Tekshirilgan'}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <span className={`font-headline font-bold text-lg ${res.status === 'pending' ? 'text-outline-variant' : 'text-secondary'}`}>
                               {res.overall_band || "—"}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <Link href={`/teacher/grading/${res.id}`} className="inline-block bg-surface-container-high hover:bg-surface-container-highest px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                               {res.status === 'pending' ? 'Baholash' : "Ko'rish"}
                            </Link>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
         )}
      </div>
    </div>
  );
}
