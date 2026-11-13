/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { startAutoUpdateWatcher } from './services/autoUpdate';

// Views
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { SuratMenyuratView } from './views/SuratMenyuratView';
import { ArsipDokumenView } from './views/ArsipDokumenView';
import { ProposalLpjView } from './views/ProposalLpjView';
import { KeuanganView } from './views/KeuanganView';
import { AgendaView } from './views/AgendaView';
import { KejadianPentingView } from './views/KejadianPentingView';
import { PengaturanView } from './views/PengaturanView';

// Modals
import { InputSuratMasukModal } from './components/modals/InputSuratMasukModal';
import { InputSuratKeluarModal } from './components/modals/InputSuratKeluarModal';
import { UploadDokumenModal } from './components/modals/UploadDokumenModal';
import { InputProposalModal } from './components/modals/InputProposalModal';
import { InputKeuanganModal } from './components/modals/InputKeuanganModal';
import { InputAgendaModal } from './components/modals/InputAgendaModal';
import { InputKejadianPentingModal } from './components/modals/InputKejadianPentingModal';
import { EmailLogsModal } from './components/modals/EmailLogsModal';
import { UserProfileModal } from './components/modals/UserProfileModal';

const MainLayout: React.FC = () => {
  const { currentTab, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <AuthView />
        <ToastContainer />
      </>
    );
  }

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'surat-menyurat':
      case 'surat-masuk':
      case 'surat-keluar':
      case 'buku-agenda':
        return <SuratMenyuratView />;
      case 'arsip':
        return <ArsipDokumenView />;
      case 'proposal-lpj':
        return <ProposalLpjView />;
      case 'keuangan':
        return <KeuanganView />;
      case 'rencana-agenda':
        return <AgendaView />;
      case 'kejadian-penting':
        return <KejadianPentingView />;
      case 'pengaturan':
        return <PengaturanView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Container offset for desktop sidebar */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Sticky Top Header */}
        <Header />

        {/* Dynamic Main View Area */}
        <main className="flex-1 p-3 sm:p-5 md:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentView()}
        </main>

        {/* Subtle Bottom Watermark */}
        <footer className="px-4 py-3 text-center print:hidden">
          <p className="text-[10.5px] sm:text-[11px] font-medium text-slate-400/90 dark:text-slate-500 tracking-wide">
            By : MPM 26/27 Parlemen Confluentia
          </p>
        </footer>
      </div>

      {/* Modals & Notifications */}
      <InputSuratMasukModal />
      <InputSuratKeluarModal />
      <UploadDokumenModal />
      <InputProposalModal />
      <InputKeuanganModal />
      <InputAgendaModal />
      <InputKejadianPentingModal />
      <EmailLogsModal />
      <UserProfileModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  useEffect(() => {
    return startAutoUpdateWatcher();
  }, []);

  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
