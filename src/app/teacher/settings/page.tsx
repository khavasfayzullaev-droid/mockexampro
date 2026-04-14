"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("system");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [language, setLanguage] = useState("uz");

  // In a real app, these would sync with a backend or localStorage
  // For now, we mock the saving interaction.
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface mb-2">Sozlamalar</h1>
          <p className="text-on-surface-variant font-medium">Tizim ko'rinishi va xabarnomalar</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
        >
          {isSaving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">save</span>}
          {savedMsg ? "Saqlandi!" : "Saqlash"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Appearance Group */}
        <div className="bg-surface-container rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6 border-b border-outline-variant/30 pb-4">
            <span className="material-symbols-outlined text-[28px] text-primary">palette</span>
            <h2 className="text-xl font-bold text-on-surface">Tashqi ko'rinish</h2>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-on-surface text-lg">Mavzu (Theme)</h3>
                <p className="text-sm text-on-surface-variant mt-1">Interfeys yorug'ligini o'rnating</p>
              </div>
              <div className="flex bg-surface border border-outline-variant rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${theme === "light" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  Yorug'
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${theme === "system" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  Avto
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${theme === "dark" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  Qorong'u
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-outline-variant/30">
              <div>
                <h3 className="font-bold text-on-surface text-lg">Tizim Tili</h3>
                <p className="text-sm text-on-surface-variant mt-1">O'zingizga qulay tilni tanlang</p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-surface border border-outline-variant rounded-xl px-4 py-2.5 outline-none font-bold text-on-surface min-w-[150px] focus:ring-2 focus:ring-primary/20"
              >
                <option value="uz">O'zbekcha</option>
                <option value="en">English (beta)</option>
                <option value="ru">Русский (beta)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Group */}
        <div className="bg-surface-container rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6 border-b border-outline-variant/30 pb-4">
            <span className="material-symbols-outlined text-[28px] text-tertiary">notifications_active</span>
            <h2 className="text-xl font-bold text-on-surface">Bildirishnomalar</h2>
          </div>

          <div className="space-y-6">
            <label className="flex items-start justify-between cursor-pointer group">
              <div>
                <h3 className="font-bold text-on-surface text-lg mb-1 group-hover:text-primary transition-colors">Email Xabarnomalari</h3>
                <p className="text-sm text-on-surface-variant max-w-[80%]">O'quvchi testni yechib yakunlaganda pochta manzilingizga xabar kelsin.</p>
              </div>
              <div className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emailNotifs ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                <input type="checkbox" className="sr-only" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </label>

            <label className="flex items-start justify-between cursor-pointer group pt-4 border-t border-outline-variant/30">
              <div>
                <h3 className="font-bold text-on-surface text-lg mb-1 group-hover:text-primary transition-colors">Brauzer (Push) xabarlari</h3>
                <p className="text-sm text-on-surface-variant max-w-[80%]">Sayt ochiq turganda o'ng burchakdan qisqa xabarlar chiqib ogohlantirsin.</p>
              </div>
              <div className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pushNotifs ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                <input type="checkbox" className="sr-only" checked={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} />
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pushNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
