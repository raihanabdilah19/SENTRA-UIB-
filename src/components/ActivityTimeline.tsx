import React from 'react';
import { Clock, Mail, FileText, Wallet, Calendar, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ActivityTimeline: React.FC = () => {
  const { state, setCurrentTab } = useApp();

  const getActivityIcon = (tipe: string) => {
    switch (tipe) {
      case 'Surat Masuk':
        return {
          icon: <Mail className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-blue-600',
        };
      case 'Proposal Kegiatan':
      case 'Proposal':
        return {
          icon: <FileText className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-blue-500',
        };
      case 'Transaksi Keuangan':
      case 'Keuangan':
        return {
          icon: <Wallet className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-amber-500',
        };
      case 'Agenda Baru':
      case 'Agenda':
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-blue-600',
        };
      default:
        return {
          icon: <FileText className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-indigo-600',
        };
    }
  };

  const recent = state.aktivitas.slice(0, 4);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Aktivitas Terbaru
          </h3>
        </div>
        <button
          onClick={() => setCurrentTab('pengurus')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group"
        >
          <span>Lihat Pengurus</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Timeline List or Empty State */}
      {recent.length === 0 ? (
        <div className="py-7 px-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/60 my-auto">
          <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Belum ada aktivitas tercatat
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Setiap ada surat masuk, dokumen diunggah, transaksi kas dicatat, atau agenda baru, jejak audit otomatis terekam di sini.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-5 before:absolute before:left-3.5 before:top-2 before:bottom-3 before:w-0.5 before:bg-blue-200 dark:before:bg-blue-900/60">
          {recent.map((item) => {
            const { icon, bg } = getActivityIcon(item.tipe);
            return (
              <div key={item.id} className="relative flex items-start justify-between gap-3 group">
                {/* Node Bullet Icon */}
                <div
                  className={`absolute -left-6 top-0.5 w-7 h-7 rounded-full ${bg} flex items-center justify-center shadow-xs border-2 border-white dark:border-slate-900 shrink-0 z-10 transition-transform group-hover:scale-110`}
                >
                  {icon}
                </div>

                {/* Text detail */}
                <div className="min-w-0 flex-1 pl-2.5">
                  <h4 className="text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.judul || item.tipe}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {item.detail}
                  </p>
                </div>

                {/* Time ago */}
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0 whitespace-nowrap">
                  {item.waktu}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
