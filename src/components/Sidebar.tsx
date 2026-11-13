import React from 'react';
import {
  Home,
  Mail,
  Send,
  FolderArchive,
  FileText,
  Wallet,
  CalendarDays,
  BarChart2,
  AlertCircle,
  Settings,
  X,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, sidebarOpen, setSidebarOpen, state } = useApp();

  const totalSurat = state.suratMasuk.length + state.suratKeluar.length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'surat-menyurat', label: 'Surat Menyurat', icon: Mail, badgeCount: totalSurat },
    { id: 'arsip', label: 'Arsip Organisasi', icon: FolderArchive, badgeCount: state.dokumen.length },
    { id: 'proposal-lpj', label: 'Proposal & LPJ', icon: FileText, badgeCount: state.proposalLpj.length },
    { id: 'keuangan', label: 'Keuangan', icon: Wallet },
    { id: 'rencana-agenda', label: 'Rencana Agenda', icon: CalendarDays, badgeCount: state.agenda.filter(a => a.status === 'Akan Datang').length },
    { id: 'kejadian-penting', label: 'Kejadian Penting', icon: AlertCircle, badgeCount: (state.kejadianPenting || []).length },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a1738] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none select-none`}
      >
        {/* Brand Header */}
        <div className="pt-4 pb-3.5 px-4 lg:pt-5 lg:pb-4 lg:px-5 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
              <img
                src="/assets/aistudio/B443C882-D294-49A8-AAE7-73DBA70A68D5_d8b6524b.jpg"
                alt="Logo UIB"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight truncate">
                SENTRA <span className="text-amber-400">UIB</span>
              </h1>
              <p className="text-[9px] sm:text-[9.5px] text-blue-200/80 font-medium tracking-normal leading-tight line-clamp-2">
                Sistem Elektronik Administrasi Organisasi
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden shrink-0"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentTab === item.id ||
              (item.id === 'surat-menyurat' &&
                ['surat-menyurat', 'surat-masuk', 'surat-keluar', 'buku-agenda'].includes(currentTab));
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 text-left relative ${
                  isActive
                    ? 'bg-[#1b63e0] text-white shadow-md shadow-blue-900/40 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/6'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                <span className="truncate">{item.label}</span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && !isActive && (
                  <span className="ml-auto text-[11px] font-semibold bg-white/10 text-blue-200 px-2 py-0.5 rounded-full">
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Graphic: University Columns Illustration */}
        <div className="relative mt-auto pt-4 px-4 pb-4 overflow-hidden border-t border-white/5 bg-gradient-to-t from-[#060e24] to-transparent">
          {/* Subtle Security Badge */}
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/90 mb-2 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Terenkripsi AES-256 • Online</span>
          </div>

          {/* Classical Campus Building Columns Vector Illustration */}
          <div className="mt-2.5 flex items-end justify-center opacity-70 hover:opacity-90 transition-opacity">
            <svg
              className="w-full h-16 text-blue-400/40"
              viewBox="0 0 200 70"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Pediment triangle roof */}
              <polygon points="100,6 20,24 180,24" fill="currentColor" fillOpacity="0.4" />
              <line x1="16" y1="24" x2="184" y2="24" stroke="currentColor" strokeWidth="2" />
              <rect x="25" y="24" width="150" height="4" fill="currentColor" fillOpacity="0.7" />

              {/* Columns */}
              <rect x="36" y="28" width="6" height="30" fill="currentColor" fillOpacity="0.8" rx="1" />
              <rect x="58" y="28" width="6" height="30" fill="currentColor" fillOpacity="0.8" rx="1" />
              <rect x="80" y="28" width="6" height="30" fill="currentColor" fillOpacity="0.8" rx="1" />
              <rect x="102" y="28" width="6" height="30" fill="currentColor" fillOpacity="0.8" rx="1" />
              <rect x="124" y="28" width="6" height="30" fill="currentColor" fillOpacity="0.8" rx="1" />
              <rect x="146" y="28" width="6" height="30" fill="currentColor" fillOpacity="0.8" rx="1" />

              {/* Plinth Base Steps */}
              <rect x="20" y="58" width="160" height="3" fill="currentColor" fillOpacity="0.7" />
              <rect x="12" y="61" width="176" height="3" fill="currentColor" fillOpacity="0.9" />
              <rect x="5" y="64" width="190" height="4" fill="currentColor" />

              {/* Soft wave under building */}
              <path
                d="M0 68 C 60 62, 140 74, 200 68 L200 70 L0 70 Z"
                fill="currentColor"
                fillOpacity="0.3"
              />
            </svg>
          </div>
        </div>
      </aside>
    </>
  );
};
