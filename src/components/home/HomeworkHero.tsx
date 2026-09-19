import React from 'react';
import { BookOpen, Camera, ChevronRight, Clock, CheckCheck, Send } from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';

interface HomeworkHeroProps {
  /** Teacher / admin: open the "post homework & classwork" form straight away. */
  onSend: () => void;
  /** Open the full diary feed. */
  onOpenDiary: () => void;
}

/**
 * The most important card on the home screen.
 * - Teachers / admins: one big button to send today's homework, classwork and blackboard photos.
 * - Parents: today's homework for their child at a glance, with a way to open and sign the diary.
 */
export const HomeworkHero: React.FC<HomeworkHeroProps> = ({ onSend, onOpenDiary }) => {
  const { currentUser, students, diary } = useSchoolData();

  const isStaff = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const todayStr = new Date().toISOString().split('T')[0];

  if (isStaff) {
    const todays = diary.filter((d) => d.date === todayStr);
    const signed = todays.reduce((sum, d) => sum + d.read_by_parents.length, 0);

    return (
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#8B0000] via-[#700000] to-[#5B0202] text-[#EDE7C7] p-5 sm:p-7 shadow-xl border-2 border-[#D4AF37]/60">
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[#D4AF37]/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-12 w-40 h-40 rounded-full bg-black/20 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 border border-[#D4AF37]/50 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] font-['Cinzel',serif]">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-[#D4AF37] opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-[#D4AF37]" />
              </span>
              <span>Daily Diary • Homework • Classwork</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-['Cormorant_Garamond',serif] italic leading-tight">
              Aaj ka Homework &amp; Classwork bhejein
            </h2>
            <p className="text-xs sm:text-sm text-[#EDE7C7]/85 leading-relaxed">
              Board ki photo kheenchein ya likh kar bhej dein. Parents ko foran mil jata hai aur woh sign bhi kar dete
              hain.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 border border-[#D4AF37]/30 text-[11px] font-bold">
                <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                {todays.length} aaj bheje gaye
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 border border-[#D4AF37]/30 text-[11px] font-bold">
                <CheckCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                {signed} parent signatures
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 md:min-w-[250px]">
            <button
              id="btn-home-send-homework"
              onClick={onSend}
              className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#EDE7C7] text-[#8B0000] font-black text-sm shadow-lg border-2 border-[#D4AF37] hover:bg-white transition active:scale-95"
            >
              <Camera className="w-5 h-5" />
              <span>Send Homework / Classwork</span>
              <Send className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenDiary}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#EDE7C7]/90 hover:text-white transition"
            >
              <span>Purani entries dekhein</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Parent view
  const child = students.find((s) => s.parent_id === currentUser?.id) || students[0];
  const list = diary
    .filter((d) =>
      child ? d.class_id === child.class_id && (d.section === 'All' || d.section === child.section) : true
    )
    .slice()
    .sort((a, b) => (b.created_at || b.date || '').localeCompare(a.created_at || a.date || ''))
    .slice(0, 3);

  return (
    <section className="rounded-[32px] bg-white border-2 border-[#D4AF37]/50 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#8B0000] to-[#5B0202] text-[#EDE7C7] px-5 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <BookOpen className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span className="font-bold text-lg font-['Cormorant_Garamond',serif] italic truncate">
            Aaj ka Homework &amp; Classwork
          </span>
        </div>
        {child && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/25 border border-[#D4AF37]/40 whitespace-nowrap">
            {child.name}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        {list.length === 0 ? (
          <p className="text-xs sm:text-sm text-[#200E01]/70 text-center py-4">
            Abhi tak koi homework nahi aaya. Teacher ke post karte hi yahan nazar aayega.
          </p>
        ) : (
          list.map((entry) => {
            const isSigned = entry.read_by_parents.some((r) => r.parent_id === currentUser?.id);
            return (
              <button
                key={entry.id}
                onClick={onOpenDiary}
                className="w-full text-left flex items-start gap-3 p-3 rounded-2xl bg-[#FAF8F2] border border-[#EDE7C7] hover:bg-[#EDE7C7]/60 transition"
              >
                <span className="mt-0.5 px-2.5 py-1 rounded-lg bg-[#8B0000] text-[#EDE7C7] text-[11px] font-black whitespace-nowrap">
                  {entry.subject}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs sm:text-sm font-bold text-[#200E01] line-clamp-2 whitespace-pre-line">
                    {entry.homework}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-[#5B0202]/80">
                    {entry.due_date && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due: {entry.due_date}
                      </span>
                    )}
                    {isSigned ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCheck className="w-3 h-3" /> Signed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700">Sign baaqi hai</span>
                    )}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-[#8B0000] mt-1 shrink-0" />
              </button>
            );
          })
        )}

        <button
          onClick={onOpenDiary}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#8B0000] text-[#EDE7C7] font-black text-xs hover:bg-[#700000] transition active:scale-95 border border-[#D4AF37]/50"
        >
          <BookOpen className="w-4 h-4 text-[#D4AF37]" />
          <span>Poori Diary kholein &amp; Sign karein</span>
        </button>
      </div>
    </section>
  );
};
