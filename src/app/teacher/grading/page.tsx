"use client";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

interface GradingItem {
  id: string;
  status: 'pending' | 'graded';
  submitted_at: string;
  overall_band?: number;
  answers?: any;
  profiles: { display_name?: string } | null;
  exams: { title?: string } | null;
}

export default function GradingCenterIndex() {
  const [items, setItems] = useState<GradingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [search, setSearch] = useState("");
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: results } = await supabase
        .from('results')
        .select('*, profiles(*), exams!inner(*)')
        .eq('exams.teacher_id', user.id)
        .order('submitted_at', { ascending: false });

      if (results && results.length > 0) {
        setItems(results);
      } else if (process.env.NODE_ENV === 'development') {
        setItems([
          { id: 'mock-test-id-1', status: 'pending', submitted_at: new Date().toISOString(), overall_band: undefined, profiles: { display_name: 'Sardor Rakhimov' }, exams: { title: 'IELTS Mock Test #1' }, answers: { writing: { text: "Modern technology has a profound..." } } },
          { id: 'mock-test-id-2', status: 'graded', submitted_at: new Date(Date.now() - 86400000).toISOString(), overall_band: 7.5, profiles: { display_name: 'Malika Karimova' }, exams: { title: 'CEFR B2 Level Test' } },
          { id: 'mock-test-id-3', status: 'pending', submitted_at: new Date(Date.now() - 3600000).toISOString(), overall_band: undefined, profiles: { display_name: 'Javohir Tursunov' }, exams: { title: 'IELTS Mock Test #2' }, answers: { writing: { text: "Education is the backbone of society..." } } },
          { id: 'mock-test-id-4', status: 'graded', submitted_at: new Date(Date.now() - 172800000).toISOString(), overall_band: 6.5, profiles: { display_name: 'Zuhra Aliyeva' }, exams: { title: 'CEFR C1 Level Test' } },
          { id: 'mock-test-id-5', status: 'pending', submitted_at: new Date(Date.now() - 7200000).toISOString(), overall_band: undefined, profiles: { display_name: 'Nodir Ergashev' }, exams: { title: 'IELTS Mock Test #1' }, answers: { speaking: { audio_url: "" } } },
          { id: 'mock-test-id-6', status: 'graded', submitted_at: new Date(Date.now() - 259200000).toISOString(), overall_band: 8.0, profiles: { display_name: 'Dilnoza Yusupova' }, exams: { title: 'IELTS Mock Test #3' } },
        ]);
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const filtered = items.filter(item => {
    if (filter === 'pending' && item.status !== 'pending') return false;
    if (filter === 'graded' && item.status !== 'graded') return false;
    if (search && !item.profiles?.display_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    graded: items.filter(i => i.status === 'graded').length,
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)} daqiqa avval`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} soat avval`;
    if (diff < 172800000) return 'Kecha';
    return date.toLocaleDateString('uz-UZ');
  };

  const getPreview = (item: GradingItem) => {
    if (item.answers?.writing?.text) return item.answers.writing.text.substring(0, 50) + '...';
    if (item.answers?.speaking?.audio_url !== undefined) return '🎙 Speaking javobi';
    return 'Javob mavjud';
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-primary mb-2 font-bold">Grading Center</p>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Baholash markazi</h2>
        <p className="text-on-surface-variant mt-1.5 text-sm">O&apos;quvchilarning barcha javoblarini shu yerdan baholang va boshqaring.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
            </div>
            <div>
              <p className="text-2xl font-black text-on-surface">{stats.total}</p>
              <p className="text-[11px] text-on-surface-variant font-medium">Jami javoblar</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-[20px]">pending</span>
            </div>
            <div>
              <p className="text-2xl font-black text-tertiary">{stats.pending}</p>
              <p className="text-[11px] text-on-surface-variant font-medium">Kutilmoqda</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            </div>
            <div>
              <p className="text-2xl font-black text-secondary">{stats.graded}</p>
              <p className="text-[11px] text-on-surface-variant font-medium">Baholangan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center bg-surface-container-lowest rounded-full px-4 py-2.5 shadow-sm border border-outline-variant/10">
          <span className="material-symbols-outlined text-outline text-[18px]">search</span>
          <input type="text" placeholder="O'quvchi ismini qidirish..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-outline-variant ml-2 outline-none" />
        </div>
        <div className="flex gap-2 shrink-0">
          {(['all', 'pending', 'graded'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${filter === f ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high'}`}>
              {f === 'all' ? `Barchasi (${stats.total})` : f === 'pending' ? `Kutilmoqda (${stats.pending})` : `Baholangan (${stats.graded})`}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center p-16">
          <span className="text-primary font-bold animate-pulse">Yuklanmoqda...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">inbox</span>
          <p className="font-medium">Hech qanday javob topilmadi</p>
          <p className="text-xs mt-1">Yangi imtihon yarating yoki filtrni o&apos;zgartiring</p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {filtered.map((item) => (
            <Link key={item.id} href={`/teacher/grading/${item.id}`}
              className="group bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200 block">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {item.profiles?.display_name?.charAt(0)?.toUpperCase() || 'O'}
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">{item.profiles?.display_name || "Noma'lum"}</h3>
                    <p className="text-[11px] text-on-surface-variant">{item.exams?.title || 'Test'}</p>
                  </div>
                </div>
                {item.status === 'graded' && item.overall_band ? (
                  <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-sm font-black">{item.overall_band}</div>
                ) : (
                  <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Kutilmoqda</span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant italic truncate mb-3">{getPreview(item)}</p>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-outline">{formatDate(item.submitted_at)}</span>
                <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {item.status === 'graded' ? "Ko'rish" : "Baholash"}
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
