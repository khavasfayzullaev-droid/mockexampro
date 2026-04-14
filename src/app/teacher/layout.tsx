"use client";
import TeacherSidebar from "@/components/TeacherSidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const teacherName = profile?.display_name || "O'qituvchi";
  const teacherInitial = teacherName.charAt(0).toUpperCase();

  return (
    <div className="bg-surface font-body text-on-surface min-h-[max(884px,100dvh)] relative">
      <TeacherSidebar />
      
      {/* TopAppBar Shell */}
      <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] flex justify-between items-center px-6 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm dark:shadow-none z-40 border-b border-surface-container-high transition-all">
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-primary">
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <h1 className="font-headline text-sm font-medium text-on-surface hidden sm:block">Ustoz <span className="font-bold text-primary">{teacherName}</span>, Mock Exam Proga xush kelibsiz!</h1>
        </div>
        
        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          <div 
             className="flex items-center gap-3 cursor-pointer hover:bg-surface-container-highest/50 py-1.5 px-3 rounded-xl transition-colors"
             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none text-on-surface">{teacherName}</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">O'qituvchi</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container overflow-hidden flex items-center justify-center font-bold text-lg select-none ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
               {teacherInitial}
            </div>
          </div>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
             <div className="absolute top-14 right-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden py-2 animate-in slide-in-from-top-2 fade-in duration-200 z-50">
                <div className="px-4 py-3 border-b border-outline-variant/10 mb-2 sm:hidden">
                   <p className="font-bold text-sm text-on-surface">{teacherName}</p>
                   <p className="text-xs text-on-surface-variant">O'qituvchi</p>
                </div>
                <Link href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-highest transition-colors">
                   <span className="material-symbols-outlined text-[18px]">person</span>
                   Mening profilim
                </Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-highest transition-colors">
                   <span className="material-symbols-outlined text-[18px]">settings</span>
                   Sozlamalar
                </Link>
                <div className="h-px bg-outline-variant/20 my-2 mx-4"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-error hover:bg-error/10 transition-colors text-left"
                >
                   <span className="material-symbols-outlined text-[18px]">logout</span>
                   Tizimdan chiqish
                </button>
             </div>
          )}
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
          <span className="material-symbols-outlined text-[24px]">dashboard</span>
          <span className="font-inter text-[10px] font-bold uppercase mt-1">Asosiy</span>
        </Link>
        <Link 
            href="/teacher/groups" 
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 tap-highlight-transparent ${pathname.includes('groups') ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-[24px]">groups</span>
          <span className="font-inter text-[10px] font-bold uppercase mt-1">Guruhlar</span>
        </Link>
        <Link 
            href="/teacher/my-exams" 
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 tap-highlight-transparent ${pathname.includes('my-exams') ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-[24px]">folder_open</span>
          <span className="font-inter text-[10px] font-bold uppercase mt-1">Kutubxona</span>
        </Link>
        <Link 
            href="/teacher/exam-builder" 
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 tap-highlight-transparent ${pathname.includes('exam-builder') ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-[24px]">add_box</span>
          <span className="font-inter text-[10px] font-bold uppercase mt-1">Tuzish</span>
        </Link>
        <Link 
            href="/teacher/grading" 
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 tap-highlight-transparent ${pathname.includes('grading') ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-[24px]">rule</span>
          <span className="font-inter text-[10px] font-bold uppercase mt-1">Baholash</span>
        </Link>
      </nav>
    </div>
  );
}
