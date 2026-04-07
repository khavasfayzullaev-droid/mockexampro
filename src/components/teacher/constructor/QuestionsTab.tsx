"use client";
import React, { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Item Component
function SortableQuestion({ id, question, updateQuestion, deleteQuestion }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-outline-variant/30 rounded-xl p-4 mb-3 flex gap-3 group relative shadow-sm">
      <div {...attributes} {...listeners} className="text-on-surface-variant cursor-grab mt-1 hover:text-primary">
        ☰
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">{question.type}</span>
          <button onClick={() => deleteQuestion(id)} className="text-error hover:underline text-xs font-semibold">O&apos;chirish</button>
        </div>
        <input 
          type="text" 
          value={question.text || ""} 
          onChange={(e) => updateQuestion(id, { ...question, text: e.target.value })}
          placeholder="Savol matnini kiriting..." 
          className="w-full border-b border-outline-variant/30 pb-1 text-sm outline-none focus:border-primary"
        />
        {question.type === "Multiple Choice" && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <input type="radio" name={`correct-${id}`} />
                <input 
                  type="text" 
                  placeholder={`Varian ${i}`} 
                  className="flex-1 border-b border-outline-variant/30 text-xs outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuestionsTab({ section, questions, setQuestions, contentKey, contentLabel }: any) {
  const [content, setContent] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = questions.findIndex((q: any) => q.id === active.id);
      const newIndex = questions.findIndex((q: any) => q.id === over.id);
      setQuestions(arrayMove(questions, oldIndex, newIndex));
    }
  };

  const addQuestion = (type: string) => {
    const newQ = { id: `q-${Date.now()}`, type, text: "", options: [] };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (id: string, updatedData: any) => {
    setQuestions(questions.map((q: any) => (q.id === id ? updatedData : q)));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q: any) => q.id !== id));
  };

  return (
    <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
      {/* Workspace Content (Reading Passage / Listening Audio) */}
      <div className="flex-1 bg-surface border border-outline-variant/30 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
          <h2 className="font-bold">{contentLabel}</h2>
          <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
             + Fayl yuklash
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
           <textarea 
             className="w-full h-full min-h-[400px] bg-transparent outline-none resize-none text-base leading-relaxed p-4 border-2 border-dashed border-outline-variant rounded-xl focus:border-primary focus:bg-primary/5 transition-colors"
             placeholder={`Bu yerga ${contentLabel} matnini yoki fayl manzilini kiriting...`}
             value={content}
             onChange={e => setContent(e.target.value)}
           ></textarea>
        </div>
      </div>

      {/* Right Settings / Questions Panel */}
      <div className="w-[400px] flex flex-col gap-4 overflow-hidden">
         {/* Toolset */}
         <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
           <h3 className="font-bold mb-4">Savol turlari</h3>
           <div className="grid grid-cols-2 gap-3">
             {[
               { t: "True/False", i: "🔘" },
               { t: "Multiple Choice", i: "A" },
               { t: "Matching", i: "🔗" },
               { t: "Fill Blanks", i: "📝" },
             ].map((q, i) => (
               <button 
                 key={i} 
                 onClick={() => addQuestion(q.t)}
                 className="p-3 border border-outline-variant/30 rounded-xl flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors bg-white focus:outline-none"
               >
                 <span className="text-2xl">{q.i}</span>
                 <span className="text-xs font-semibold text-center">{q.t}</span>
               </button>
             ))}
           </div>
         </div>

         {/* Active Questions List */}
         <div className="flex-1 bg-surface border border-outline-variant/30 rounded-2xl flex flex-col overflow-hidden shadow-sm">
           <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex justify-between">
             <h3 className="font-bold text-sm">Biriktirilgan savollar ({questions.length})</h3>
           </div>
           <div className="flex-1 p-4 overflow-y-auto bg-surface-container-lowest">
             {questions.length === 0 ? (
               <div className="h-full flex items-center justify-center text-center text-sm text-on-surface-variant">
                 Yuqoridan savol turini bosib qo&apos;shing
               </div>
             ) : (
               <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                 <SortableContext items={questions.map((q: any) => q.id)} strategy={verticalListSortingStrategy}>
                   {questions.map((q: any) => (
                     <SortableQuestion key={q.id} id={q.id} question={q} updateQuestion={updateQuestion} deleteQuestion={deleteQuestion} />
                   ))}
                 </SortableContext>
               </DndContext>
             )}
           </div>
         </div>
      </div>
    </div>
  );
}
