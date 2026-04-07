import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Asosiy panel", href: "/dashboard", icon: "📊" },
    { name: "Mening imtihonlarim", href: "/dashboard/exams", icon: "📝" },
    { name: "Natijalar", href: "/dashboard/results", icon: "🏆" },
    { name: "Analitika", href: "/dashboard/analytics", icon: "📈" },
    { name: "Sozlamalar", href: "/dashboard/settings", icon: "⚙️" },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-outline-variant/30 hidden md:flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold inset-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-dark to-primary-container flex items-center justify-center text-white text-sm">M</div>
          <span className="text-on-surface">Mock Exam Pro</span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-outline tracking-wider mb-4 px-3 uppercase">Menyu</div>
        {links.map((link) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/dashboard");
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-outline-variant/30">
        <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-xl transition-colors">
          <span>🚪</span> Tizimdan chiqish
        </button>
      </div>
    </aside>
  );
}
