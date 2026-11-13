import React from 'react';
import { Mail, Send, Folder, Wallet, ArrowUp, FileText, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../services/storage';

export const MetricCards: React.FC = () => {
  const { state, setCurrentTab } = useApp();

  const totalSuratMasuk = state.suratMasuk.length;
  const totalSuratKeluar = state.suratKeluar.length;
  const totalDokumen = state.dokumen.length;
  const totalProposal = state.proposalLpj.length;
  const totalKejadianPenting = (state.kejadianPenting || []).length;

  // Calculate current cash balance from latest transaction or 0
  const saldoKas = state.transaksi.length > 0 ? state.transaksi[0].saldoSetelah : 0;

  const cards = [
    {
      id: 'surat-masuk',
      title: 'Surat Masuk',
      value: totalSuratMasuk.toString(),
      trend: totalSuratMasuk > 0 ? `${totalSuratMasuk} surat` : '0 tercatat',
      tab: 'surat-masuk' as const,
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0 shadow-xs">
          <Mail className="w-5 h-5" />
        </div>
      ),
      bgGlow: 'hover:border-sky-300',
    },
    {
      id: 'surat-keluar',
      title: 'Surat Keluar',
      value: totalSuratKeluar.toString(),
      trend: totalSuratKeluar > 0 ? `${totalSuratKeluar} surat` : '0 tercatat',
      tab: 'surat-keluar' as const,
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0 shadow-xs">
          <Send className="w-5 h-5" />
        </div>
      ),
      bgGlow: 'hover:border-blue-300',
    },
    {
      id: 'dokumen',
      title: 'Arsip Organisasi',
      value: totalDokumen.toString(),
      trend: totalDokumen > 0 ? `${totalDokumen} berkas` : '0 berkas',
      tab: 'arsip' as const,
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0 shadow-xs">
          <Folder className="w-5 h-5" />
        </div>
      ),
      bgGlow: 'hover:border-amber-300',
    },
    {
      id: 'proposal-lpj',
      title: 'Proposal & LPJ',
      value: totalProposal.toString(),
      trend: totalProposal > 0 ? `${totalProposal} pengajuan` : '0 pengajuan',
      tab: 'proposal-lpj' as const,
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center shrink-0 shadow-xs">
          <FileText className="w-5 h-5" />
        </div>
      ),
      bgGlow: 'hover:border-purple-300',
    },
    {
      id: 'kejadian-penting',
      title: 'Kejadian Penting',
      value: totalKejadianPenting.toString(),
      trend: totalKejadianPenting > 0 ? `${totalKejadianPenting} agenda` : '0 agenda',
      tab: 'kejadian-penting' as const,
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center shrink-0 shadow-xs">
          <AlertCircle className="w-5 h-5" />
        </div>
      ),
      bgGlow: 'hover:border-orange-300',
    },
    {
      id: 'saldo-kas',
      title: 'Saldo Kas',
      value: formatRupiah(saldoKas),
      trend: saldoKas > 0 ? 'Saldo aktif' : 'Rp 0 saldo',
      tab: 'keuangan' as const,
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0 shadow-xs">
          <Wallet className="w-5 h-5" />
        </div>
      ),
      bgGlow: 'hover:border-emerald-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5 md:gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => setCurrentTab(card.tab)}
          className={`bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between min-w-0 ${card.bgGlow}`}
        >
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {card.title}
            </span>
            <div className="scale-75 sm:scale-90 md:scale-100 origin-right shrink-0">
              {card.icon}
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
              {card.value}
            </h3>
            <div className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
              <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3] shrink-0" />
              <span className="truncate">{card.trend}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
