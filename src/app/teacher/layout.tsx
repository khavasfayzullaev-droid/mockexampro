"use client";
import TeacherSidebar from "@/components/TeacherSidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    }
    loadProfile();
  }, [supabase]);

  const teacherName = profile?.display_name || "O'qituvchi";
  const teacherInitial = teacherName.charAt(0).toUpperCase();

  return (
    <div className="bg-surface font-body text-on-surface min-h-[max(884px,100dvh)] relative">
      <TeacherSidebar />
      
      {/* TopAppBar Shell */}
      <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] flex justify-between items-center px-6 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm dark:shadow-none z-40 border-b border-surface-container-high transition-all">
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-primary">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-headline text-sm font-medium text-on-surface">Ustoz <span className="font-bold text-primary">{teacherName}</span>, Mock Exam Proga xush kelibsiz!</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none text-on-surface">{teacherName}</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">O'qituvchi</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container overflow-hidden flex items-center justify-center font-bold text-lg">
               {teacherInitial}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-24 pb-20 lg:pb-8 pl-6 pr-6 lg:pl-72 lg:pr-12 min-h-screen">
        {children}
      </main>

      {/* BottomNavBar Shell (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-4 bg-white border-t border-surface-container-highest shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:hidden">
        <Link 
            href="/teacher" 
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 tap-highlight-transparent ${pathname === '/teacher' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
          <span className="font-inter text-[10px] font-bold uppercase mt-1">Asosiy</span>
        </Link>
        <Link 
            href="/teacher/groups" 
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 tap-highlight-transparent ${pathname.includes('groups') ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          <span className="font-inter text-[10px] font-bold uppercase mt-1">Guruhlar</span>
        </Link>
        <Link 
            href="/teacher/exam-builder" 
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 tap-highlight-transparent ${pathname.includes('exam-builder') ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          <span className="font-inter text-[10px] font-bold uppercase mt-1">Tuzish</span>
        </Link>
        <Link 
            href="/teacher/grading" 
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 tap-highlight-transparent ${pathname.includes('grading') ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-inter text-[10px] font-bold uppercase mt-1">Baholash</span>
        </Link>
      </nav>
    </div>
  );
}
