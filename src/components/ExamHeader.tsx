import Link from "next/link";
import { useEffect, useState } from "react";

export default function ExamHeader({ title, section, initialMinutes = 60 }: { title: string, section: string, initialMinutes?: number }) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  const isWarning = timeLeft < 300; // less than 5 mins

  return (
    <header className="sticky top-0 z-50 glass-dark border-b border-white/10 text-white p-4 flex items-center justify-between shadow-ambient">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-sm">M</div>
        <div>
          <h1 className="font-bold hidden sm:block">{title}</h1>
          <div className="text-xs text-white/60 font-medium px-2 py-0.5 rounded bg-white/10 w-fit mt-0.5">
            {section}
          </div>
        </div>
      </div>

      <div className={`flex items-center gap-2 font-mono text-xl font-bold ${isWarning ? 'text-warning timer-warning' : 'text-white'}`}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {m}:{s}
      </div>

      <div>
        <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10">
          Chiqish
        </button>
      </div>
    </header>
  );
}
