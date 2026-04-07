"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");

  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (password !== confirmPassword) {
      setErrorText("Parollar bir-biriga mos kelmadi.");
      return;
    }

    if (password.length < 6) {
      setErrorText("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          role: role, // Role ni metadata ga qo'shib yuboramiz
        }
      }
    });

    if (error) {
           setErrorText(error.message);
      setIsLoading(false);
      return;
    }

    // Role-ga qarab routing
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

      {/* Right - Form Content */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto bg-surface">
        <div className="w-full max-w-md fade-in py-8">
          
          <div className="lg:hidden flex items-center gap-2 font-bold text-xl mb-8">
            Mock Exam Pro
          </div>

          <div className="flex gap-6 mb-8 border-b border-outline-variant/30">
            <Link href="/login" className="pb-3 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">Kirish</Link>
            <Link href="/register" className="pb-3 text-sm font-bold text-primary border-b-2 border-primary">Ro&apos;yxatdan o&apos;tish</Link>
          </div>

          <h1 className="text-3xl font-bold mb-2 tracking-tight">Profil yaratish</h1>
          <p className="text-on-surface-variant text-sm mb-6">Kerakli rol va shaxsiy ma&apos;lumotlarni to&apos;ldiring</p>

          {errorText && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 text-danger text-sm font-medium border border-danger/20 flex items-center gap-3 animate-shake">
               <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               {errorText}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* ROL TANLASH */}
            <div className="mb-6">
               <label className="block text-sm font-bold mb-3 text-on-surface">Saytga qanday maqsadda kiryapsiz?</label>
               <div className="flex gap-3">
                 <button
                   type="button"
                   onClick={() => setRole("student")}
                   className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${role === "student" ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:bg-surface-container'}`}
                 >
                   <span className="text-2xl">👨‍🎓</span>
                   <span className="text-sm font-bold">O&apos;quvchi</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setRole("teacher")}
                   className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${role === "teacher" ? 'border-success bg-success/5 text-success' : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:bg-surface-container'}`}
                 >
                   <span className="text-2xl">👩‍🏫</span>
                   <span className="text-sm font-bold">Ustoz</span>
                 </button>
               </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-on-surface-variant">To&apos;liq ism</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="F.I.O" 
                className="input-field bg-white" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-on-surface-variant">Elektron pochta</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="misol@gmail.com" 
                className="input-field bg-white" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-on-surface-variant">Parol</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="input-field bg-white" 
                  required 
                />
              </div>
              <div>
                 <label className="block text-sm font-semibold mb-1.5 text-on-surface-variant">Parolni tasdiqlang</label>
                 <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="input-field bg-white" 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`btn-primary w-full justify-center py-4 text-base font-bold shadow-ambient mt-4 relative ${role === 'teacher' ? 'bg-success hover:bg-success-dark shadow-success/30' : ''}`}
            >
              <span className={isLoading ? "opacity-0" : "opacity-100"}>
                 Yangi hisob yaratish
              </span>
              {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 </div>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
