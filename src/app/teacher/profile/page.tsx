"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");
  
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
          setDisplayName(data.display_name || "");
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    }
    loadUser();
  }, [supabase, router]);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;
    setSavingProfile(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id);
      setProfile({ ...profile, display_name: displayName });
    }
    setSavingProfile(false);
  };

  const handleUpdatePassword = async () => {
    setPasswordMessage({ type: "", text: "" });
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Parol 6 ta belgidan kam bo'lmasligi kerak." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Parollar bir-biriga mos kelmadi." });
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      setPasswordMessage({ type: "error", text: error.message });
    } else {
      setPasswordMessage({ type: "success", text: "Parol muvaffaqiyatli o'zgartirildi!" });
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant font-medium">Yuklanmoqda...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-on-surface mb-2">Mening profilim</h1>
        <p className="text-on-surface-variant font-medium">Shaxsiy ma'lumotlaringiz va xavfsizlik sozlamalari</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details Card */}
        <div className="bg-surface-container rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold uppercase ring-4 ring-white dark:ring-surface-container-highest">
              {displayName.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Shaxsiy Ma'lumot</h2>
              <p className="text-sm text-on-surface-variant">Asosiy akkaunt bilgisi</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">To'liq ismingiz</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Pochta manzilingiz (Login)</label>
              <input
                type="email"
                value={userEmail}
                disabled
                className="w-full bg-surface/50 border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface-variant cursor-not-allowed opacity-70"
              />
              <p className="text-xs text-on-surface-variant mt-2 font-medium">Email manzilni o'zgartirib bo'lmaydi.</p>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile || displayName === profile?.display_name}
              className="mt-4 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingProfile && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
              O'zgarishlarni saqlash
            </button>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-surface-container rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center text-2xl">
              <span className="material-symbols-outlined text-[32px]">lock</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Xavfsizlik</h2>
              <p className="text-sm text-on-surface-variant">Parolni yangilash</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Yangi parol</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Parolni tasdiqlang</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Parolni qayta kiriting"
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {passwordMessage.text && (
              <div className={`p-3 rounded-lg text-sm font-bold ${passwordMessage.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                {passwordMessage.text}
              </div>
            )}

            <button
              onClick={handleUpdatePassword}
              disabled={savingPassword || !newPassword || !confirmPassword}
              className="mt-4 px-6 py-3 bg-on-surface text-surface font-bold rounded-xl hover:bg-on-surface/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingPassword && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
              Parolni yangilash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
