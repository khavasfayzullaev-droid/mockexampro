"use client";

export default function BasicInfoTab({ examData, setExamData }: any) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setExamData({ ...examData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-1 max-w-4xl animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-outline-variant/10">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-2xl">settings_applications</span>
        </div>
        <div>
          <h2 className="font-headline font-bold text-2xl text-on-surface">Asosiy Sozlamalar</h2>
          <p className="text-on-surface-variant text-sm mt-1">Imtihonning umumiy parametrlarini belgilang</p>
        </div>
      </div>
      
      <div className="space-y-8">
        <div>
          <label className="block text-sm font-label font-bold text-on-surface mb-2 uppercase tracking-wide">Imtihon nomi</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">title</span>
            <input
              type="text"
              name="title"
              value={examData.title || ""}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-2 border-outline-variant/20 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface text-base font-semibold transition-all hover:border-outline-variant/50"
              placeholder="Masalan: Maxsus IELTS Mock Test 45"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-label font-bold text-on-surface mb-2 uppercase tracking-wide">Qisqacha ta&apos;rif</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-4 text-outline group-focus-within:text-primary transition-colors">description</span>
            <textarea
              name="description"
              value={examData.description || ""}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-2 border-outline-variant/20 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface text-base transition-all resize-none h-32 hover:border-outline-variant/50 leading-relaxed"
              placeholder="Imtihon qoidalari yoki qo'shimcha ma'lumotlarni qoldiring..."
            ></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-label font-bold text-on-surface mb-2 uppercase tracking-wide">Davomiyligi (daqiqa)</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">schedule</span>
              <input
                type="number"
                name="duration_minutes"
                value={examData.duration_minutes || 60}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-2 border-outline-variant/20 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface text-base font-semibold transition-all hover:border-outline-variant/50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-medium">daq</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-label font-bold text-on-surface mb-2 uppercase tracking-wide">Status</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">visibility</span>
              <select
                name="is_active"
                value={examData.is_active ? "true" : "false"}
                onChange={(e) => setExamData({ ...examData, is_active: e.target.value === "true" })}
                className="w-full pl-12 pr-10 py-4 appearance-none bg-surface-container-lowest border-2 border-outline-variant/20 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface text-base font-semibold transition-all cursor-pointer hover:border-outline-variant/50"
              >
                <option value="true">Faol (O'quvchilarga ko'rinadi)</option>
                <option value="false">Qoralama (Yashirin)</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
