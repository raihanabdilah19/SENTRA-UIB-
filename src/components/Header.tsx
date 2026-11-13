import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  Shield,
  Cloud,
  CheckCircle2,
  Mail,
  Calendar,
  DollarSign,
  FileText,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    state,
    currentTab,
    setSidebarOpen,
    setActiveModal,
    logoutUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setCurrentTab,
  } = useApp();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = state.notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifs.length;

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'surat-menyurat':
      case 'surat-masuk':
      case 'surat-keluar':
      case 'buku-agenda':
        return 'Surat Menyurat Organisasi';
      case 'arsip':
        return 'Arsip Organisasi';
      case 'proposal-lpj':
        return 'Proposal & Laporan Pertanggungjawaban';
      case 'keuangan':
        return 'Laporan & Kas Keuangan';
      case 'rencana-agenda':
        return 'Rencana Agenda & Kalender Kegiatan';
      case 'kejadian-penting':
        return 'Kejadian Penting';
      case 'pengaturan':
        return 'Pengaturan Sistem & Integrasi';
      default:
        return 'Dashboard';
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'mail':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'finance':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'agenda':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'proposal':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'security':
        return <Shield className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 h-14 sm:h-16 px-3 sm:px-4 md:px-8 flex items-center justify-between gap-2 shadow-xs transition-colors">
      {/* Left: Hamburger & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
          {getTabTitle()}
        </h1>
      </div>

      {/* Right: Cloud Sync Pill, Notifications, User profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-4 shrink-0">
        {/* Real-time Cloud Sync Pill (Desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Cloud className="w-3.5 h-3.5" />
          <span>Tersimpan Otomatis</span>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Menu Dropdown */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Semua Dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {state.notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada notifikasi saat ini
                  </div>
                ) : (
                  state.notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.linkTo) {
                          setCurrentTab(notif.linkTo as any);
                          setNotifDropdownOpen(false);
                        }
                      }}
                      className={`px-4 py-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        !notif.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 px-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                <button
                  onClick={() => {
                    setActiveModal('email-logs');
                    setNotifDropdownOpen(false);
                  }}
                  className="hover:text-blue-600 text-blue-600 dark:text-blue-400 font-medium"
                >
                  Lihat Riwayat Email Terkirim
                </button>
                <span>Live Push Active</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill with Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-blue-500 shadow-xs">
              <img
                src={state.currentUser.avatar}
                alt={state.currentUser.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-none">Halo,</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                  {state.currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider block mt-0.5">
                {state.currentUser.division || state.currentUser.role}
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {state.currentUser.name}
                </p>
                {state.currentUser.email && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {state.currentUser.email}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 uppercase">
                    {state.currentUser.role}
                  </span>
                  {state.currentUser.division && (
                    <span className="text-[10px] text-slate-400 truncate">
                      {state.currentUser.division}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 px-2 space-y-1">
                <button
                  onClick={() => {
                    setActiveModal('profile');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  + Buat / Atur Akun & Password
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('pengaturan');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  Pengaturan Keamanan & Backup
                </button>
                <button
                  onClick={() => {
                    logoutUser();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Keluar Akun
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
