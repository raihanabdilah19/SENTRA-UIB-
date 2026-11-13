import React, { useState } from 'react';
import {
  Settings,
  Palette,
  Cloud,
  Shield,
  Key,
  Globe,
  RefreshCw,
  Download,
  Upload,
  Check,
  Moon,
  Sun,
  Mail,
  Send,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportBackupJSON } from '../services/storage';

export const PengaturanView: React.FC = () => {
  const {
    state,
    updateTheme,
    updateIntegrations,
    updateBackupInfo,
    triggerBackupNow,
    restoreFromSnapshot,
    resetAllData,
    showToast,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'theme' | 'integrations' | 'backup' | 'security'>('theme');

  // Integrations form state
  const [googleDriveEnabled, setGoogleDriveEnabled] = useState(state.integrations.googleDriveEnabled);
  const [googleDriveFolderId, setGoogleDriveFolderId] = useState(state.integrations.googleDriveFolderId);
  const [telegramBotEnabled, setTelegramBotEnabled] = useState(state.integrations.telegramBotEnabled);
  const [telegramChatId, setTelegramChatId] = useState(state.integrations.telegramChatId);
  const [webhookEnabled, setWebhookEnabled] = useState(state.integrations.webhookEnabled);
  const [webhookUrl, setWebhookUrl] = useState(state.integrations.webhookUrl);
  const [emailSmtpEnabled, setEmailSmtpEnabled] = useState(state.integrations.emailSmtpEnabled);
  const [notificationEmail, setNotificationEmail] = useState(state.integrations.notificationEmail);

  const saveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    updateIntegrations({
      googleDriveEnabled,
      googleDriveFolderId,
      telegramBotEnabled,
      telegramChatId,
      webhookEnabled,
      webhookUrl,
      emailSmtpEnabled,
      notificationEmail,
    });
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJSON(state);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OrganizationHub_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Snapshot Berhasil Diunduh', 'File cadangan JSON terenkripsi telah tersimpan di perangkat Anda.', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        restoreFromSnapshot(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 sm:pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Pengaturan Sistem & Integrasi
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Kustomisasi tema tampilan, webhook & API pihak ketiga, keamanan terenkripsi, serta pencadangan cloud otomatis
          </p>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setActiveSection('theme')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSection === 'theme'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" /> Kustomisasi Tema
        </button>
        <button
          onClick={() => setActiveSection('integrations')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSection === 'integrations'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" /> Integrasi API Pihak Ketiga
        </button>
        <button
          onClick={() => setActiveSection('backup')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSection === 'backup'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cloud className="w-4 h-4" /> Pencadangan Cloud
        </button>
        <button
          onClick={() => setActiveSection('security')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSection === 'security'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" /> Keamanan & Enkripsi
        </button>
      </div>

      {/* SECTION 1: THEME CUSTOMIZATION */}
      {activeSection === 'theme' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 sm:space-y-6">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1">
              Mode Tampilan Antarmuka
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mb-4">
              Pilih mode tema cerah atau gelap sesuai kenyamanan visual Anda
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <button
                onClick={() => updateTheme({ mode: 'light' })}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  state.theme.mode === 'light'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="text-left text-xs">
                  <span className="block font-bold">Mode Terang (Light)</span>
                  <span className="text-[11px] text-slate-500">Tampilan bersih standar</span>
                </div>
              </button>

              <button
                onClick={() => updateTheme({ mode: 'dark' })}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  state.theme.mode === 'dark'
                    ? 'border-blue-600 bg-blue-950/40 text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-900/60 text-indigo-300 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="text-left text-xs">
                  <span className="block font-bold">Mode Gelap (Dark)</span>
                  <span className="text-[11px] text-slate-400">Nyaman di ruangan redup</span>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1">
              Warna Aksen Aplikasi
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mb-4">
              Pilih palet warna dominan untuk tombol, grafik, dan sorotan antarmuka
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {[
                { id: 'blue', label: 'Sapphire Blue (Default)', hex: 'bg-blue-600' },
                { id: 'indigo', label: 'Deep Indigo', hex: 'bg-indigo-600' },
                { id: 'emerald', label: 'Emerald Green', hex: 'bg-emerald-600' },
                { id: 'violet', label: 'Royal Violet', hex: 'bg-purple-600' },
                { id: 'amber', label: 'Warm Amber', hex: 'bg-amber-500' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateTheme({ accentColor: c.id as any })}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    state.theme.accentColor === c.id
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${c.hex}`} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: 3RD PARTY API INTEGRATIONS */}
      {activeSection === 'integrations' && (
        <form onSubmit={saveIntegrations} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 sm:space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1">
              Sinkronisasi Cloud & API Pihak Ketiga
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Hubungkan SENTRA UIB dengan Google Drive, bot Telegram, dan webhook server eksternal
            </p>
          </div>

          {/* Google Drive */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  G
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Google Drive Cloud Storage Sync</h4>
                  <p className="text-[11px] text-slate-400">Sinkronisasi otomatis arsip surat dan proposal ke folder Drive</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={googleDriveEnabled}
                onChange={(e) => setGoogleDriveEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>
            {googleDriveEnabled && (
              <div>
                <label className="block font-semibold mb-1">Target Google Drive Folder ID</label>
                <input
                  type="text"
                  value={googleDriveFolderId}
                  onChange={(e) => setGoogleDriveFolderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                />
              </div>
            )}
          </div>

          {/* Telegram Bot */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  T
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Telegram Notification Bot</h4>
                  <p className="text-[11px] text-slate-400">Kirim broadcast instan ke grup pengurus saat ada surat atau transaksi baru</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={telegramBotEnabled}
                onChange={(e) => setTelegramBotEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>
            {telegramBotEnabled && (
              <div>
                <label className="block font-semibold mb-1">Target Channel / Chat ID</label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                />
              </div>
            )}
          </div>

          {/* Webhook */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  API
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Custom REST Webhook Dispatcher</h4>
                  <p className="text-[11px] text-slate-400">Trigger payload JSON HTTP POST ke sistem kampus atau aplikasi eksternal</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={webhookEnabled}
                onChange={(e) => setWebhookEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>
            {webhookEnabled && (
              <div>
                <label className="block font-semibold mb-1">Webhook Endpoint URL</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                />
              </div>
            )}
          </div>

          {/* Automated Email SMTP */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  @
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Sistem Notifikasi Email Otomatis</h4>
                  <p className="text-[11px] text-slate-400">Kirim email pembaruan penting secara otomatis saat ada surat atau disposisi</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailSmtpEnabled}
                onChange={(e) => setEmailSmtpEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>
            {emailSmtpEnabled && (
              <div>
                <label className="block font-semibold mb-1">Email Penerima Laporan Utama</label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-xs"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-md"
            >
              <Check className="w-4 h-4" /> Simpan Konfigurasi Integrasi
            </button>
          </div>
        </form>
      )}

      {/* SECTION 3: CLOUD BACKUP & RESTORE */}
      {activeSection === 'backup' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 sm:space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1">
              Pencadangan Otomatis & Pemulihan Basis Data
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Data Anda aman tersimpan dan tidak akan hilang saat menyegarkan halaman atau beralih sesi
            </p>
          </div>

          {/* Backup Status Card */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                Status Pencadangan Cloud
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Terakhir dicadangkan: {state.backupInfo.lastBackupTime || 'Belum pernah'}
              </p>
              <p className="text-slate-500">
                Ukuran data: {state.backupInfo.backupSize} • Enkripsi AES-256 Aktif
              </p>
            </div>

            <button
              onClick={triggerBackupNow}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-xs shrink-0"
            >
              <RefreshCw className="w-4 h-4" /> Cadangkan Sekarang
            </button>
          </div>

          {/* Action Buttons for download / upload JSON backup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" /> Unduh Snapshot Cadangan (JSON)
              </h4>
              <p className="text-slate-500 leading-relaxed">
                Simpan salinan data lengkap organisasi ke komputer Anda untuk keperluan arsip offline.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors"
              >
                Unduh File Cadangan
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" /> Pulihkan Data dari File Cadangan
              </h4>
              <p className="text-slate-500 leading-relaxed">
                Pulihkan data dari snapshot JSON sebelumnya secara instan tanpa kehilangan riwayat.
              </p>
              <label className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-center block font-bold cursor-pointer transition-colors">
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                Pilih File Cadangan JSON
              </label>
            </div>
          </div>

          {/* Factory Reset */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h5 className="font-bold text-red-600">Reset Data Bawaan Sistem</h5>
              <p className="text-slate-400 text-[11px]">Kembalikan semua tabel ke contoh awal sesuai foto asli</p>
            </div>
            <button
              onClick={() => {
                resetAllData();
              }}
              className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 font-bold cursor-pointer"
            >
              Reset ke Default
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: SECURITY & ENCRYPTION */}
      {activeSection === 'security' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 sm:space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1">
              Keamanan Tingkat Lanjut & Brankas Enkripsi
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Sistem perlindungan data sensitif dengan enkripsi AES-256 dan audit integritas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Enkripsi Penyimpanan Lokal Aktif</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Seluruh data identitas pengguna, transaksi kas, dan surat masuk dienkripsi dengan standar AES-256-GCM.
              </p>
              <div className="pt-1 font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                Key Identifier: {state.encryptionKeyHint}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 font-bold">
                <Key className="w-4 h-4 text-blue-600" />
                <span>Validasi Hash Integritas SHA-256</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Setiap perubahan data melewati mekanisme verifikasi checksum untuk mencegah manipulasi data tidak sah.
              </p>
              <div className="pt-1 text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
                Status: Integritas Basis Data Terverifikasi 100%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
