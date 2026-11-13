import React, { useState } from 'react';
import { CalendarDays, Plus, Clock, MapPin, Users, Trash2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AgendaView: React.FC = () => {
  const { state, setActiveModal, updateAgenda, deleteAgenda, showToast } = useApp();

  const [selectedType, setSelectedType] = useState('Semua');

  const filtered = state.agenda.filter((item) => {
    return selectedType === 'Semua' || item.tipe === selectedType;
  });

  const getTagBadge = (tipe: string) => {
    switch (tipe) {
      case 'Internal':
        return 'border border-blue-200 text-blue-600 bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-900';
      case 'Kegiatan':
        return 'border border-emerald-200 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 dark:border-emerald-900';
      case 'Evaluasi':
        return 'border border-amber-200 text-amber-600 bg-amber-50/60 dark:bg-amber-950/40 dark:border-amber-900';
      default:
        return 'border border-purple-200 text-purple-600 bg-purple-50/60 dark:bg-purple-950/40 dark:border-purple-900';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 sm:pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Rencana Agenda & Kalender Kegiatan
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Jadwal kegiatan rapat, seminar, evaluasi, dan kunjungan resmi organisasi mahasiswa
          </p>
        </div>

        <button
          onClick={() => setActiveModal('input-agenda')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Jadwalkan Agenda Baru
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-x-auto">
        {['Semua', 'Internal', 'Kegiatan', 'Evaluasi', 'Eksternal'].map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === t
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Agenda Timeline List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5"
          >
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              {/* Date Box */}
              <div className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900 shadow-2xs">
                <span className="text-base sm:text-lg md:text-xl font-extrabold leading-none">{item.tanggal.split('-')[2] || '12'}</span>
                <span className="text-[9.5px] sm:text-[10px] font-bold uppercase mt-1 tracking-wider">
                  {new Date(item.tanggal).toLocaleString('id-ID', { month: 'short' }) || 'Okt'}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                    {item.judul}
                  </h3>
                  <span className={`text-[10.5px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full ${getTagBadge(item.tipe)}`}>
                    {item.tipe}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> {item.waktuMulai} - {item.waktuSelesai}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> {item.lokasi}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-500" /> {item.peserta}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 pt-0.5 line-clamp-2">
                  {item.deskripsi}
                </p>
                <span className="text-[11px] text-slate-400 block">
                  Penanggung Jawab: <strong className="text-slate-700 dark:text-slate-300">{item.penanggungJawab}</strong>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <select
                value={item.status}
                onChange={(e) => updateAgenda(item.id, { status: e.target.value as any })}
                className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="Akan Datang">Akan Datang</option>
                <option value="Berjalan">Sedang Berjalan</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>

              <button
                onClick={() => {
                  deleteAgenda(item.id);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Hapus Agenda"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
