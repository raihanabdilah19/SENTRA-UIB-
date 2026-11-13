import React from 'react';
import { Calendar, Clock, MapPin, ArrowRight, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AgendaCard: React.FC = () => {
  const { state, setCurrentTab, setActiveModal } = useApp();

  // Helper to extract day and month abbreviation
  const formatDateParts = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return { day: '01', month: 'Jan' };
      }
      const day = d.getDate().toString();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return { day, month: months[d.getMonth()] };
    } catch {
      return { day: '01', month: 'Jan' };
    }
  };

  const getBadgeStyle = (tipe: string) => {
    switch (tipe) {
      case 'Internal':
        return 'text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30';
      case 'Kegiatan':
        return 'text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30';
      case 'Evaluasi':
        return 'text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30';
      default:
        return 'text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30';
    }
  };

  const upcoming = state.agenda.slice(0, 3);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
            Agenda Terdekat
          </h3>
        </div>
        <button
          onClick={() => setCurrentTab('rencana-agenda')}
          className="text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Agenda items list or empty state */}
      {upcoming.length === 0 ? (
        <div className="py-6 px-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/60 my-auto">
          <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Belum ada agenda terdekat
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Jadwalkan rapat pengurus, pelaksanaan proker, atau evaluasi kegiatan organisasi Anda.
          </p>
          <button
            onClick={() => setActiveModal('input-agenda')}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Tambah Agenda Baru
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3.5">
          {upcoming.map((item) => {
            const { day, month } = formatDateParts(item.tanggal);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2.5 sm:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  {/* Date Square Badge matching screenshot */}
                  <div className="w-11 h-12 sm:w-12 sm:h-13 rounded-xl bg-[#e0f2fe] dark:bg-blue-950/60 text-[#0284c7] dark:text-sky-300 flex flex-col items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900 shadow-2xs">
                    <span className="text-base sm:text-lg font-extrabold leading-none">{day}</span>
                    <span className="text-[9.5px] sm:text-[10px] font-bold leading-tight uppercase mt-0.5 tracking-wider">
                      {month}
                    </span>
                  </div>

                  {/* Content details */}
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 dark:text-slate-100 truncate">
                      {item.judul}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.waktuMulai} – {item.waktuSelesai}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.lokasi}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tag Badge */}
                <div className="shrink-0">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getBadgeStyle(
                      item.tipe
                    )}`}
                  >
                    {item.tipe}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
