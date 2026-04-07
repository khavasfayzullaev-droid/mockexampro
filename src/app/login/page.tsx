"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setIsLoading(true);
    
    // Supabase orqali parolni tekshiramiz
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorText(error.message);
      setIsLoading(false);
      return;
    }

    // Checking actual role from DB to prevent role-switching
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    
    if (profile && profile.role !== role) {
      await supabase.auth.signOut();
      setErrorText(`Xatolik: Bu elektron pochta ${profile.role === 'teacher' ? 'Ustoz' : 'O\'quvchi'} sifatida ro'yxatdan o'tgan!`);
      setIsLoading(false);
      return;
    }

    if (role === "teacher") {
      router.push("/teacher");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-dark to-primary-container relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col h-full justify-start">
          <Link href="/" className="flex items-center gap-3 text-white font-bold text-2xl hover:scale-105 transition-transform w-fit">
            Mock Exam Pro
          </Link>

          <div className="mt-28 2xl:mt-36">
            <h2 className="text-white text-4xl lg:text-5xl font-bold leading-tight mb-6 tracking-tight">
              O&lsquo;quvchilar uchun shaffof, o&lsquo;zingiz uchun oson!
            </h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-lg font-medium mb-10">
              Mock imtihonlarini tez va ishonchli o&lsquo;tkazing. IELTS va CEFR standartlari asosida mukammal onlayn mock platforma.
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="rounded-xl p-4 flex items-center gap-3 bg-white/10 border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-md">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl shadow-inner">🎧</div>
                <span className="text-white font-semibold text-sm tracking-wide">Listening</span>
              </div>
              <div className="rounded-xl p-4 flex items-center gap-3 bg-white/10 border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-md">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl shadow-inner">📖</div>
                <span className="text-white font-semibold text-sm tracking-wide">Reading</span>
              </div>
              <div className="rounded-xl p-4 flex items-center gap-3 bg-white/10 border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-md">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl shadow-inner">✍️</div>
                <span className="text-white font-semibold text-sm tracking-wide">Writing</span>
              </div>
              <div className="rounded-xl p-4 flex items-center gap-3 bg-white/10 border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-md">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl shadow-inner">🗣️</div>
                <span className="text-white font-semibold text-sm tracking-wide">Speaking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface">
        <div className="w-full max-w-md fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 font-bold text-xl mb-8">
            Mock Exam Pro
          </div>

          <div className="flex gap-6 mb-8 border-b border-outline-variant/30">
            <Link href="/login" className="pb-3 text-sm font-semibold text-primary border-b-2 border-primary">Kirish</Link>
            <Link href="/register" className="pb-3 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">Ro&apos;yxatdan o&apos;tish</Link>
          </div>

          <h1 className="text-2xl font-bold mb-2">Xush kelibsiz!</h1>
          <p className="text-on-surface-variant text-sm mb-6">Davom etish uchun ma&apos;lumotlaringizni kiriting</p>

          {errorText && (
            <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-sm font-medium border border-danger/20">
               ⚠️ Xatolik: {errorText}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* ROL TANLASH */}
            <div className="flex p-1 bg-surface-container rounded-xl w-full">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${role === "student" ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                👨‍🎓 O&apos;quvchi
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${role === "teacher" ? 'bg-white shadow-sm text-success' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                👩‍🏫 Ustoz
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Elektron pochta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sizning@email.com"
                className="input-field"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Parol</label>
                <Link href="#" className="text-xs text-primary font-medium hover:underline">Parolni unutdingizmi?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                >
                  {showPass ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className={`btn-primary w-full justify-center py-3.5 relative ${role === 'teacher' ? 'bg-success hover:bg-success-dark' : ''}`}>
              <span className={isLoading ? "opacity-0" : "opacity-100 flex items-center justify-center gap-2"}>
                {role === 'teacher' ? "Ustoz paneliga kirish" : "Tizimga kirish"}
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 </div>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
