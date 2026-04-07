"use client";
import ExamHeader from "@/components/ExamHeader";
import { useState } from "react";
import Link from "next/link";

export default function ReadingTest() {
  const [highlightMode, setHighlightMode] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex flex-col h-screen overflow-hidden">
      <ExamHeader title="Full IELTS Mock Test #45" section="O'qish (Reading) - 2/4" initialMinutes={60} />

      {/* Main Content - Double Pane */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Pane - Text Passage */}
        <div className="flex-1 overflow-y-auto bg-white p-6 md:p-10 border-r border-outline-variant/30 relative shadow-[inset_-10px_0_20px_rgba(0,0,0,0.02)]">
          <div className="max-w-2xl mx-auto space-y-6">
            
            <div className="sticky top-0 bg-white/90 backdrop-blur-md pb-4 mb-4 z-10 flex justify-between items-center border-b border-outline-variant/30">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-on-surface">Reading Passage 1</h2>
              <button 
                onClick={() => setHighlightMode(!highlightMode)}
                className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${highlightMode ? 'bg-[rgba(255,213,79,0.3)] text-warning border border-warning' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-transparent'}`}
              >
                 🖋️ Matnni bo&apos;yash
              </button>
            </div>

            <h3 className="text-xl font-bold text-center mb-6">The Evolution of the Modern Museum</h3>
            <p className="text-base text-on-surface leading-[1.8] text-justify text-balance">
              For much of their history, <span className="text-highlight">museums were elitist institutions</span>, designed to preserve the artifacts of the wealthy and powerful. The earliest known museum, Ennigaldi-Nanna&apos;s museum, dates back to c. 530 BCE and was located in the state of Ur, in modern-day Iraq. However, the modern public museum is a relatively recent invention, emerging during the Enlightenment in the 18th century.
            </p>
            <p className="text-base text-on-surface leading-[1.8] text-justify text-balance">
              The British Museum, established in 1753, was the first national public museum in the world. Initially, entry was strictly limited and visitors had to apply in writing for a ticket. It wasn&apos;t until the mid-19th century that museums began to embrace a more educational role, seeking to attract the working classes as part of a broader movement for self-improvement and moral uplift.
            </p>
            <p className="text-base text-on-surface leading-[1.8] text-justify text-balance">
              Today, museums are interactive spaces. The transition from <span className="text-highlight">&quot;Look, but don&apos;t touch&quot;</span> to immersive sensory experiences has fundamentally altered how humanity engages with its own history. Technological advancements have allowed curators to digitize collections, meaning someone in rural Africa can explore the Louvre through virtual reality.
            </p>
          </div>
        </div>

        {/* Right Pane - Questions */}
        <div className="w-full lg:w-[500px] xl:w-[600px] overflow-y-auto bg-surface p-6 pb-24">
          <div className="space-y-8">
            
            {/* Question Group 1 */}
            <div className="card shadow-sm border border-outline-variant/30">
               <div className="bg-surface-container p-3 rounded-lg mb-4 text-sm font-medium">
                 Do the following statements agree with the information given in Reading Passage 1?<br/>
                 Choose A, B, or C.
               </div>

               <div className="space-y-6">
                 {[
                   { num: 1, text: "The earliest known museum was open to the general public." },
                   { num: 2, text: "The British Museum initially required visitors to apply for tickets." },
                 ].map((q, i) => (
                   <div key={i} className="flex flex-col gap-3">
                     <p className="font-bold"><span className="text-primary mr-2">{q.num}.</span> {q.text}</p>
                     <div className="flex gap-2">
                       {['TRUE', 'FALSE', 'NOT GIVEN'].map(btn => (
                         <label key={btn} className="flex-1 text-center cursor-pointer">
                           <input type="radio" name={`q${q.num}`} className="peer sr-only" />
                           <div className="py-2 px-1 rounded-md border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary font-bold text-xs uppercase transition-all duration-200">
                             {btn}
                           </div>
                         </label>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Question Group 2 */}
            <div className="card shadow-sm border border-outline-variant/30">
               <div className="bg-surface-container p-3 rounded-lg mb-4 text-sm font-medium">
                 Complete the sentences below. Choose NO MORE THAN TWO WORDS from the text.
               </div>
               
               <div className="space-y-4 leading-loose">
                  <div>
                    <span className="text-primary font-bold mr-2">3.</span>
                    Museums were historically intended to preserve the possessions of the 
                    <input type="text" className="mx-2 w-32 bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none text-center font-bold" />
                    and powerful.
                  </div>
                  <div>
                    <span className="text-primary font-bold mr-2">4.</span>
                    In the 18th century, the public museum emerged during a period known as the
                    <input type="text" className="mx-2 w-48 bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none text-center font-bold" />.
                  </div>
               </div>
            </div>

            <div className="flex justify-end pt-4">
              <Link href="/dashboard/exams/writing" className="btn-primary py-3 px-8 shadow-ambient hover:scale-105">
                Keyingi bo&apos;lim (Writing)
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
