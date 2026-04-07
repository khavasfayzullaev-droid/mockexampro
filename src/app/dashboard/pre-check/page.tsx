"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function PreCheckPage() {
  const [micCheck, setMicCheck] = useState(false);
  const [speakerCheck, setSpeakerCheck] = useState(false);
  const [netCheck, setNetCheck] = useState(false);

  // Simulate network check
  useEffect(() => {
    const timer = setTimeout(() => setNetCheck(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const allChecksPassed = micCheck && speakerCheck && netCheck;

  return (
    <div className="max-w-3xl mx-auto py-8 fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Tizimni tekshirish</h1>
        <p className="text-on-surface-variant">Imtihon jarayonida texnik muammolar bo&apos;lmasligi uchun quyidagilarni tekshiring.</p>
      </div>

      {/* Rules Card */}
      <div className="bg-surface rounded-2xl border border-outline-variant/30 p-8 shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-warning">⚠️</span> Imtihon qoidalari
        </h2>
        <ul className="space-y-4 text-sm text-on-surface-variant">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-primary">1.</span>
            Imtihon faqat to&apos;liq ekranda (Fullscreen) rejimida topshiriladi. Boshqa oynaga o&apos;tish qoidabuzarlik hisoblanadi.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-primary">2.</span>
            Matnni ko&apos;chirish (Copy) va qo&apos;yish (Paste) funksiyalari o&apos;chirib qo&apos;yilgan.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-primary">3.</span>
            Speaking (Gapirish) bo&apos;limi uchun mikrofon ishlashi va atrofingizda shovqin bo&apos;lmasligi shart.
          </li>
        </ul>
      </div>

      {/* Checks Grid */}
      <div className="space-y-4 mb-10">
        
        {/* Network */}
        <div className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${netCheck ? 'bg-success/5 border-success/30' : 'bg-surface border-outline-variant/30'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${netCheck ? 'bg-success text-white' : 'bg-surface-container text-outline'}`}>
            🌐
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Internet tezligi</h3>
            <p className="text-sm text-on-surface-variant">{netCheck ? 'Aloqa barqaror (Pinging... 45ms)' : 'Tekshirilmoqda...'}</p>
          </div>
          <div>
            {netCheck ? (
              <span className="px-3 py-1 bg-success/20 text-success-dark text-xs font-bold rounded-full">Passed</span>
            ) : (
              <div className="w-5 h-5 border-2 border-outline/30 border-t-primary rounded-full animate-spin"></div>
            )}
          </div>
        </div>

        {/* Speaker */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${speakerCheck ? 'bg-success/5 border-success/30' : 'bg-surface border-outline-variant/30'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${speakerCheck ? 'bg-success text-white' : 'bg-surface-container text-outline'}`}>
            🔊
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Ovoz chiqishi (Speaker)</h3>
            <p className="text-sm text-on-surface-variant">Listening bo&apos;limi uchun ovoz eshitilishini sinab ko&apos;ring.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTimeout(() => setSpeakerCheck(true), 500)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${speakerCheck ? 'bg-success text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
            >
              {speakerCheck ? 'Qayta eshitish' : 'Audioni chalish'}
            </button>
            {speakerCheck && <span className="px-3 py-1 bg-success/20 text-success-dark text-xs font-bold rounded-full">Passed</span>}
          </div>
        </div>

        {/* Mic */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${micCheck ? 'bg-success/5 border-success/30' : 'bg-surface border-outline-variant/30'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${micCheck ? 'bg-success text-white' : 'bg-surface-container text-outline'}`}>
            🎤
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Mikrofon holati</h3>
            <p className="text-sm text-on-surface-variant">Speaking testida qatnashish uchun mikrofon ruxsati kerak.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                // Fake auth logic for ui
                alert("Brauzerda ruxsat so'raldi (Demonstratsiya)"); 
                setMicCheck(true);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${micCheck ? 'text-on-surface-variant bg-surface-container cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}
              disabled={micCheck}
            >
              Ruxsat berish
            </button>
            {micCheck && <span className="px-3 py-1 bg-success/20 text-success-dark text-xs font-bold rounded-full">Passed</span>}
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-6 border-t border-outline-variant/30">
        <Link 
          href={allChecksPassed ? "/dashboard/exams/listening" : "#"}
          className={`py-3.5 px-8 flex items-center gap-2 rounded-full font-bold transition-all ${
            allChecksPassed 
              ? 'bg-primary text-white shadow-lg hover:shadow-primary/30 hover:scale-[1.02]' 
              : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'
          }`}
          onClick={(e) => {
            if(!allChecksPassed) e.preventDefault();
          }}
        >
          Imtihonni boshlash
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </div>
    </div>
  );
}
