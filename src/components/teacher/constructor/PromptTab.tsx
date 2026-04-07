"use client";

export default function PromptTab({ section, data, setData, title }: any) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData({ ...data, prompt: e.target.value });
  };

  return (
    <div className="flex-1 bg-surface border border-outline-variant/30 rounded-2xl flex flex-col overflow-hidden">
      <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
        <h2 className="font-bold">{title}</h2>
        <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
             + Fayl yuklash
        </button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Imtihon sharti (Prompt)</label>
          <textarea
            value={data.prompt || ""}
            onChange={handleChange}
            className="w-full h-[400px] px-4 py-3 border border-outline-variant/30 rounded-xl outline-none focus:border-primary text-sm transition-colors text-on-surface resize-none bg-white font-mono"
            placeholder={`Bu yerga o'quvchiga beriladigan topshiriq shartini yozing...\nMasalan:\n\nDescribe a time when you visited a new place.\nYou should say:\n- Where it was\n- When you went there\n- Who you went with\n- And explain why you liked it.`}
          ></textarea>
        </div>
      </div>
    </div>
  );
}
