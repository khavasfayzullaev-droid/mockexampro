"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const features = [
    { icon: "🎧", title: "Listening", desc: "Audio tinglash va savollar bilan real IELTS tajribasi" },
    { icon: "📖", title: "Reading", desc: "Ikki panelli interfeys: matn + savollar bir ekranda" },
    { icon: "✍️", title: "Writing", desc: "So'z hisoblagich va avtomatik saqlash bilan yozish" },
    { icon: "🎤", title: "Speaking", desc: "Brauzerda ovoz yozib olish va baholash tizimi" },
  ];

  const stats = [
    { value: "10,000+", label: "Faol foydalanuvchilar" },
    { value: "50,000+", label: "Topshirilgan testlar" },
    { value: "98%", label: "Mijozlar qoniqishi" },
    { value: "24/7", label: "Qo'llab-quvvatlash" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-ambient" : "bg-transparent"}`}>
        <div className="page-container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-dark to-primary-container flex items-center justify-center text-white text-sm">M</div>
            <span className="text-on-surface">Mock Exam Pro</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface-variant">
            <a href="#features" className="hover:text-primary transition-colors">Imkoniyatlar</a>
            <a href="#stats" className="hover:text-primary transition-colors">Statistika</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Narxlar</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-5 hidden sm:inline-flex">Kirish</Link>
            <Link href="/register" className="btn-primary text-sm py-2.5 px-6">Boshlash</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-success/8 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="page-container relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 fade-in">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Yangi versiya chiqdi — 2.0
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 fade-in" style={{ animationDelay: "0.1s" }}>
            Kelajagingizni
            <span className="bg-gradient-to-r from-primary-dark to-primary-container bg-clip-text text-transparent"> aniqlik bilan </span>
            o&apos;lchamlashtiring
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-8 fade-in" style={{ animationDelay: "0.2s" }}>
            IELTS va CEFR standartlarida yuqori sifatli mock imtihonlar topshiring. 
            Real vaqtda natijalarni kuzating va maqsadli ball oling.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in" style={{ animationDelay: "0.3s" }}>
            <Link href="/register" className="btn-primary text-base py-3.5 px-8">
              Bepul boshlash
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="#features" className="btn-secondary py-3 px-8">Batafsil ma&apos;lumot</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">4 ta asosiy ko&apos;nikma</h2>
            <p className="text-on-surface-variant max-w-lg mx-auto">Har bir ko&apos;nikma bo&apos;yicha maxsus ishlab chiqilgan interfeys va baholash tizimi</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card card-hover p-6 fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 px-6 bg-gradient-to-r from-primary-dark to-primary-container">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center text-white">
                <div className="text-3xl sm:text-4xl font-bold mb-1">{s.value}</div>
                <div className="text-white/70 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Narxlar</h2>
            <p className="text-on-surface-variant">O&apos;zingizga mos rejani tanlang</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Bepul", price: "0", period: "so'm/oy", features: ["3 ta test", "Listening & Reading", "Avtomatik tekshirish"], cta: "Boshlash", highlight: false },
              { name: "Pro", price: "99,000", period: "so'm/oy", features: ["Cheksiz testlar", "Barcha 4 skill", "Ustoz tekshiruvi", "Sertifikat"], cta: "Pro'ga o'tish", highlight: true },
              { name: "O'quv Markaz", price: "499,000", period: "so'm/oy", features: ["50 ta o'quvchi", "Guruh boshqaruvi", "Analitika", "Maxsus qo'llab-quvvatlash"], cta: "Bog'lanish", highlight: false },
            ].map((p, i) => (
              <div key={i} className={`card p-8 text-center relative ${p.highlight ? "border-2 border-primary shadow-ambient-lg" : ""}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full">Mashhur</div>
                )}
                <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-6">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-on-surface-variant text-sm">{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={p.highlight ? "btn-primary w-full justify-center" : "btn-secondary w-full justify-center inline-flex"}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-outline-variant/30">
        <div className="page-container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-dark to-primary-container flex items-center justify-center text-white text-xs">M</div>
            Mock Exam Pro
          </div>
          <p className="text-sm text-on-surface-variant">© 2026 Mock Exam Pro — Barcha huquqlar himoyalangan</p>
        </div>
      </footer>
    </div>
  );
}
