"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface TeacherStats {
  pendingTasks: number;
  gradedTasks: number;
  totalStudents: number;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats>({
    pendingTasks: 0,
    gradedTasks: 0,
    totalStudents: 0
  });
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filter, setFilter] = useState("Kutilayotgan");
  const [search, setSearch] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: results, error } = await supabase
        .from('results')
        .select(`
          *,
          profiles(*),
          exams!inner(*)
        `)
        .eq('exams.teacher_id', user.id);

      if (results) {
        const pending = results.filter(r => r.status === 'pending');
        const graded = results.filter(r => r.status === 'graded');
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentSubmissions = results.filter(r => new Date(r.submitted_at) >= oneWeekAgo);
        const uniqueRecentStudents = new Set(recentSubmissions.map(r => r.student_id)).size;

        setStats({
          pendingTasks: pending.length,
          gradedTasks: graded.length,
          totalStudents: uniqueRecentStudents
        });

        setPendingList(results);
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const filteredTasks = pendingList.filter(task => {
    if (filter !== "Barchasi") {
      if (filter === "Kutilayotgan" && task.status !== "pending") return false;
      if (filter === "Tekshirilgan" && task.status !== "graded") return false;
    }
    const studentName = task.profiles?.display_name || "";
    if (search && !studentName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="mb-10">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-1">ASOSIY PANEL SHARHI</p>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Akademik natijalar</h2>
      </div>
      
      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_32px_32px_rgba(25,28,30,0.06)] flex flex-col justify-between group hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-tertiary-container/10 rounded-xl">
              <span className="material-symbols-outlined text-tertiary">pending_actions</span>
            </div>
            <span className="text-xs font-label text-tertiary bg-tertiary-fixed px-2 py-1 rounded-full">{stats.pendingTasks} ta yangi</span>
          </div>
          <div className="mt-8">
            <h3 className="text-on-surface-variant text-sm font-medium">Kutilayotganlar</h3>
            <p className="text-4xl font-headline font-extrabold mt-1">{stats.pendingTasks}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_32px_32px_rgba(25,28,30,0.06)] flex flex-col justify-between group hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-primary/10 rounded-xl">
              <span className="material-symbols-outlined text-primary">groups</span>
            </div>
            <span className="text-xs font-label text-primary bg-primary-fixed px-2 py-1 rounded-full">Oxirgi 7 kun</span>
          </div>
          <div className="mt-8">
            <h3 className="text-on-surface-variant text-sm font-medium">Faol o'quvchilar</h3>
            <p className="text-4xl font-headline font-extrabold mt-1">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_32px_32px_rgba(25,28,30,0.06)] flex flex-col justify-between group hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-secondary/10 rounded-xl">
              <span className="material-symbols-outlined text-secondary">avg_pace</span>
            </div>
            <span className="text-xs font-label text-secondary-fixed-dim bg-secondary-container px-2 py-1 rounded-full">Faol</span>
          </div>
          <div className="mt-8">
            <h3 className="text-on-surface-variant text-sm font-medium">Tekshirilganlar</h3>
            <p className="text-4xl font-headline font-extrabold mt-1">{stats.gradedTasks}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-primary font-bold">Ma'lumotlar yuklanmoqda...</div>
      ) : (
        <div>
          {/* Submissions List */}
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h3 className="font-headline text-xl font-bold">Yaqinda topshirgan o'quvchilar</h3>
              <div className="flex items-center gap-3">
                 <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg transition-colors group-focus-within:text-primary">search</span>
                    <input
                       type="text"
                       placeholder="Izlash..."
                       value={search}
                       onChange={(e) => setSearch(e.target.value)}
                       className="bg-surface-container-lowest border border-outline-variant/30 px-4 py-2.5 pl-10 rounded-xl text-sm w-40 sm:w-64 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-inter placeholder:text-on-surface-variant text-on-surface shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    />
                 </div>
                 
                 <div className="relative group">
                    <select 
                       onChange={(e) => setFilter(e.target.value)} 
                       value={filter} 
                       className="appearance-none bg-surface-container-lowest border border-outline-variant/30 px-4 py-2.5 pr-10 rounded-xl text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-inter text-on-surface cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    >
                       <option value="Barchasi">Barchasi</option>
                       <option value="Kutilayotgan">Kutilayotgan</option>
                       <option value="Tekshirilgan">Tekshirilgan</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none group-focus-within:text-primary">expand_more</span>
                 </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_8px_24px_rgba(25,28,30,0.04)] text-center text-on-surface-variant">
                   Hech qanday ma'lumot topilmadi.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_24px_rgba(25,28,30,0.04)] flex flex-col sm:flex-row sm:items-center justify-between relative overflow-hidden group gap-4">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.status === 'pending' ? 'bg-tertiary' : 'bg-secondary'}`}></div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold overflow-hidden uppercase">
                        {task.profiles?.display_name ? task.profiles.display_name.charAt(0) : "O'"}
                      </div>
                      <div>
                        <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">{task.exams?.title || "Test"} • {new Date(task.submitted_at).toLocaleDateString()}</p>
                        <h4 className="font-headline font-bold text-lg">{task.profiles?.display_name || "Noma'lum O'quvchi"}</h4>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 self-start sm:self-auto">
                      {task.status === 'pending' ? (
                        <>
                          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-tertiary-container text-on-tertiary-container uppercase tracking-tight">Kutilmoqda</span>
                          <Link href={`/teacher/grading/${task.id}`} className="signature-gradient text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all">
                            Hozir baholash
                          </Link>
                        </>
                      ) : (
                        <>
                          <div className="text-right mr-2 hidden sm:block">
                            <p className="text-xs font-label text-on-surface-variant uppercase tracking-tighter">BALL</p>
                            <p className="text-lg font-headline font-bold text-secondary">{task.overall_band || 0}</p>
                          </div>
                          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container uppercase tracking-tight">Tekshirilgan</span>
                          <Link href={`/teacher/grading/${task.id}`} className="bg-surface-container-high text-on-surface px-5 py-2 rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-colors">
                            Ko'rib chiqish
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
