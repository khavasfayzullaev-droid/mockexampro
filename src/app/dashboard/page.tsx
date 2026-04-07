"use client";
import Link from "next/link";

export default function StudentDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in">
      {/* Header Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white text-xl font-bold border-4 border-surface shadow-sm">
            AS
          </div>
          <div>
            <h1 className="text-2xl font-bold">Salom, Alisher!</h1>
            <p className="text-on-surface-variant text-sm mt-1">Sizning o&apos;rtacha natijangiz: <span className="font-semibold text-success">Band 7.5</span></p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant relative">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Topshirilgan testlar", value: "12 ta", trend: "+2 bu oy" },
          { label: "O'rtacha Reading", value: "8.0", trend: "+0.5" },
          { label: "O'rtacha Listening", value: "7.5", trend: "+0.5" },
          { label: "Eng past ko'rsatkich", value: "Writing (6.5)", trend: "Diqqat qiling", isWarning: true },
        ].map((stat, i) => (
          <div key={i} className="bg-surface p-5 rounded-2xl border border-outline-variant/30 flex flex-col gap-1 shadow-sm">
            <span className="text-sm text-on-surface-variant">{stat.label}</span>
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className={`text-xs font-medium mt-1 ${stat.isWarning ? 'text-warning' : 'text-success'}`}>{stat.trend}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Exams */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Kelgusi Imtihonlar</h2>
            <Link href="/dashboard/exams" className="text-sm text-primary font-medium hover:underline">Barchasini ko&apos;rish</Link>
          </div>
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-1 shadow-sm flex flex-col gap-1">
            
            {/* Exam Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-surface hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-transparent">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-lg">M</div>
                <div>
                  <h3 className="font-bold text-lg">Full IELTS Mock Test #45</h3>
                  <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-2">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    2 soat 45 daqiqa • 4 ta bo&apos;lim
                  </p>
                </div>
              </div>
              <Link href="/dashboard/pre-check" className="btn-primary py-2.5 px-6 whitespace-nowrap justify-center">
                Imtihonni boshlash
              </Link>
            </div>
            
            <div className="h-px bg-outline-variant/30 mx-4" />

            {/* Exam Card 2 */}
            <div className="p-4 sm:p-5 rounded-xl bg-surface hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-transparent opacity-75">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center font-bold text-lg">R</div>
                <div>
                  <h3 className="font-bold text-lg">Reading Section Practice</h3>
                  <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-2">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    60 daqiqa • O&apos;qish mashqi
                  </p>
                </div>
              </div>
              <Link href="/dashboard/pre-check" className="btn-secondary py-2 px-5 whitespace-nowrap justify-center outline-none">
                Tayyorgarlik
              </Link>
            </div>

          </div>
        </div>

        {/* Progress Chart (Static Representation) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Natijalar o&apos;sishi</h2>
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-sm h-64 flex items-end justify-between gap-2">
            {[4.5, 5.5, 6.0, 6.5, 7.0, 7.5].map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group w-full relative">
                {/* Tooltip */}
                <div className="absolute -top-8 bg-on-surface text-surface text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {val}
                </div>
                {/* Bar */}
                <div 
                  className={`w-full rounded-t-lg transition-all duration-500 ease-out ${i === 5 ? 'bg-primary' : 'bg-surface-container-high group-hover:bg-primary-light'}`}
                  style={{ height: `${(val / 9) * 180}px` }}
                ></div>
                <div className="text-xs text-on-surface-variant font-medium">Test {i+1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
