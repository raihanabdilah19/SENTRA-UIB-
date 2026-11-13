import React from 'react';
import {
  Zap,
  Mail,
  Send,
  FolderUp,
  FileText,
  Wallet,
  CalendarPlus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuickMenu: React.FC = () => {
  const { setActiveModal } = useApp();

  const actions = [
    {
      id: 'input-surat-masuk',
      title: 'Input\nSurat Masuk',
      icon: Mail,
      action: () => setActiveModal('input-surat-masuk'),
    },
    {
      id: 'input-surat-keluar',
      title: 'Input\nSurat Keluar',
      icon: Send,
      action: () => setActiveModal('input-surat-keluar'),
    },
    {
      id: 'upload-dokumen',
      title: 'Upload\nArsip Organisasi',
      icon: FolderUp,
      action: () => setActiveModal('upload-dokumen'),
    },
    {
      id: 'input-proposal',
      title: 'Input\nProposal & LPJ',
      icon: FileText,
      action: () => setActiveModal('input-proposal'),
    },
    {
      id: 'input-keuangan',
      title: 'Input\nKeuangan',
      icon: Wallet,
      action: () => setActiveModal('input-keuangan'),
    },
    {
      id: 'input-agenda',
      title: 'Input\nRencana Agenda',
      icon: CalendarPlus,
      action: () => setActiveModal('input-agenda'),
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3.5 sm:mb-4">
        <Zap className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-500 fill-amber-500 shrink-0" />
        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
          Menu Cepat
        </h3>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.action}
              className="group p-2.5 sm:p-3 rounded-2xl bg-[#eff6ff] dark:bg-slate-800/80 hover:bg-[#dbeafe] dark:hover:bg-slate-750 border border-blue-100/60 dark:border-slate-700/60 flex flex-col items-center justify-center text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center mb-1.5 sm:mb-2 shadow-xs group-hover:scale-110 transition-transform">
                <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] sm:text-[11.5px] font-bold text-slate-700 dark:text-slate-200 whitespace-pre-line leading-tight">
                {act.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
