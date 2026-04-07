import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TeacherSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/teacher", icon: "dashboard" },
    { name: "My Groups", href: "/teacher/groups", icon: "group" },
    { name: "My Exams", href: "/teacher/my-exams", icon: "folder_open" },
    { name: "Exam Constructor", href: "/teacher/exam-builder", icon: "edit_note" },
    { name: "Grading Center", href: "/teacher/grading", icon: "fact_check" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full hidden lg:flex flex-col bg-slate-50 dark:bg-slate-900 font-manrope font-semibold tracking-tight h-screen w-64 border-r-0 z-50">
      <div className="px-6 py-8">
        <Link href="/" className="text-xl font-bold text-blue-700 dark:text-blue-400">Mock Exam Pro</Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/teacher" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isActive 
                  ? "text-blue-700 dark:text-blue-400 bg-transparent relative after:content-[''] after:absolute after:left-0 after:w-1 after:h-8 after:bg-blue-600 after:rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="bg-surface-container-low rounded-xl p-4">
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Storage Usage</p>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4"></div>
          </div>
          <p className="text-[10px] mt-2 text-on-surface-variant">750MB / 1GB Exam Assets</p>
        </div>
      </div>
    </aside>
  );
}
