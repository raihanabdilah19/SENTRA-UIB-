import React from 'react';
import { Mail, Send, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SuratMasukView } from './SuratMasukView';
import { SuratKeluarView } from './SuratKeluarView';

export const SuratMenyuratView: React.FC = () => {
  const { state, suratSubTab, setSuratSubTab, setActiveModal } = useApp();

  const totalMasuk = state.suratMasuk.length;
  const totalKeluar = state.suratKeluar.length;

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 sm:pb-12 animate-in fade-in duration-200">
      {/* Top Main Navigation Card & Tab Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
          {/* Title & Description */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  Surat Menyurat Organisasi
                </h2>
                <span className="text-[10.5px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  {totalMasuk + totalKeluar} Surat
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Sentralisasi administrasi persuratan: kelola registrasi surat masuk dan penerbitan surat keluar dengan format spreadsheet.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setActiveModal('input-surat-masuk')}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Input Surat Masuk
            </button>

            <button
              onClick={() => setActiveModal('input-surat-keluar')}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Buat Surat Keluar
            </button>
          </div>
        </div>

        {/* Sub-Tabs Segmented Control: Hanya Surat Masuk & Surat Keluar */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSuratSubTab('masuk')}
            className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              suratSubTab === 'masuk'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-600/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Surat Masuk</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                suratSubTab === 'masuk'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {totalMasuk}
            </span>
          </button>

          <button
            onClick={() => setSuratSubTab('keluar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              suratSubTab === 'keluar'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-600/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Surat Keluar</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                suratSubTab === 'keluar'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {totalKeluar}
            </span>
          </button>
        </div>
      </div>

      {/* Subtab Content View */}
      {suratSubTab === 'masuk' && <SuratMasukView />}
      {suratSubTab === 'keluar' && <SuratKeluarView />}
    </div>
  );
};
