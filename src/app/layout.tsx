import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mock Exam Pro - IELTS & CEFR Imtihon Platformasi",
  description: "IELTS va CEFR standartlari asosida 4 ta skill bo'yicha onlayn mock imtihon topshiring. Listening, Reading, Writing, Speaking — barchasi bir joyda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style>{`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          .signature-gradient {
            background: linear-gradient(135deg, #0058bc 0%, #0070eb 100%);
          }
        `}</style>
      </head>
      <body className="antialiased font-body bg-surface text-on-surface">
        {children}
      </body>
    </html>
  );
}
