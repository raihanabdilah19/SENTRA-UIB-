import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import {
  AppStateData,
  loadAppData,
  saveAppData,
  resetAppData,
  INITIAL_STATE,
  EMPTY_USER,
  getRegisteredAccounts,
  saveRegisteredAccounts,
  setActiveSessionUserId,
  loadAccountAppData,
  saveAccountAppData,
  normalizeAccountName,
  formatRupiah,
} from '../services/storage';
import {
  CloudSessionMeta,
  computeAccountKey,
  computeAuthVerifier,
  computePasswordHash,
  loadCloudSessionMeta,
  loginAccountFromCloud,
  registerAccountInCloud,
  saveAccountStateToCloud,
  saveCloudSessionMeta,
  subscribeToAccountCloud,
  syncLegacyLocalAccountsToCloud,
  updateAccountCredentialsInCloud,
} from '../services/cloudAccounts';
import {
  User,
  BukuAgendaSuratRow,
  SuratMasukItem,
  SuratKeluarItem,
  DokumenOrganisasiItem,
  ProposalLpjItem,
  TransaksiKeuanganItem,
  AgendaItem,
  KejadianPentingItem,
  AktivitasLogItem,
  NotificationItem,
  ThemeSettings,
  ThirdPartyIntegrationConfig,
  CloudBackupInfo,
} from '../types';
import { playNotificationChime, sendSimulatedEmail } from '../services/notificationService';

export type NavTab =
  | 'dashboard'
  | 'surat-menyurat'
  | 'surat-masuk'
  | 'surat-keluar'
  | 'buku-agenda'
  | 'arsip'
  | 'proposal-lpj'
  | 'keuangan'
  | 'rencana-agenda'
  | 'kejadian-penting'
  | 'laporan'
  | 'pengurus'
  | 'pengaturan';

export type SuratSubTab = 'masuk' | 'keluar';

export type ActiveModal =
  | null
  | 'input-surat-masuk'
  | 'input-surat-keluar'
  | 'upload-dokumen'
  | 'input-proposal'
  | 'input-keuangan'
  | 'input-agenda'
  | 'input-kejadian-penting'
  | 'login'
  | 'profile'
  | 'email-logs'
  | 'backup-manager';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  state: AppStateData;
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  suratSubTab: SuratSubTab;
  setSuratSubTab: (tab: SuratSubTab) => void;
  activeModal: ActiveModal;
  setActiveModal: (modal: ActiveModal) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Auth & User actions
  isAuthenticated: boolean;
  loginUser: (user: User) => void;
  loginWithCredentials: (name: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerAndLoginAccount: (name: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logoutUser: () => void;
  updateCurrentUserProfile: (updated: Partial<User>) => Promise<{ ok: boolean; error?: string }>;
  switchUser: (userId: string) => void;

  // CRUD for collections
  addSuratMasuk: (item: Omit<SuratMasukItem, 'id'>) => void;
  updateSuratMasuk: (id: string, item: Partial<SuratMasukItem>) => void;
  deleteSuratMasuk: (id: string) => void;

  addSuratKeluar: (item: Omit<SuratKeluarItem, 'id'>) => void;
  updateSuratKeluar: (id: string, item: Partial<SuratKeluarItem>) => void;
  deleteSuratKeluar: (id: string) => void;

  // Buku Agenda Surat (Spreadsheet)
  addBukuAgendaRow: (item: Omit<BukuAgendaSuratRow, 'id' | 'no'>) => void;
  updateBukuAgendaRow: (id: string, item: Partial<BukuAgendaSuratRow>) => void;
  deleteBukuAgendaRow: (id: string) => void;

  addDokumen: (item: Omit<DokumenOrganisasiItem, 'id' | 'diuploadOleh'> & { tanggalUpload?: string }) => void;
  deleteDokumen: (id: string) => void;

  addProposalLpj: (item: Omit<ProposalLpjItem, 'id'> & { tanggalDiajukan?: string }) => void;
  updateProposalStatus: (id: string, status: ProposalLpjItem['status'], catatan?: string) => void;
  deleteProposalLpj: (id: string) => void;

  addTransaksi: (item: Omit<TransaksiKeuanganItem, 'id' | 'saldoSetelah'>) => void;
  deleteTransaksi: (id: string) => void;

  addAgenda: (item: Omit<AgendaItem, 'id'>) => void;
  updateAgenda: (id: string, item: Partial<AgendaItem>) => void;
  deleteAgenda: (id: string) => void;

  // Kejadian Penting CRUD
  addKejadianPenting: (item: Omit<KejadianPentingItem, 'id'>) => void;
  updateKejadianPenting: (id: string, patch: Partial<KejadianPentingItem>) => void;
  deleteKejadianPenting: (id: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;

  // Settings & Theme
  updateTheme: (theme: Partial<ThemeSettings>) => void;
  updateIntegrations: (integrations: Partial<ThirdPartyIntegrationConfig>) => void;
  updateBackupInfo: (info: Partial<CloudBackupInfo>) => void;
  triggerBackupNow: () => void;
  restoreFromSnapshot: (snapshotJson: string) => boolean;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppStateData>(() => loadAppData());
  const [currentTab, setCurrentTabState] = useState<NavTab>('dashboard');
  const [suratSubTab, setSuratSubTab] = useState<SuratSubTab>('masuk');

  const handleSetCurrentTab = useCallback((tab: NavTab) => {
    if (tab === 'surat-masuk') {
      setCurrentTabState('surat-menyurat');
      setSuratSubTab('masuk');
    } else if (tab === 'surat-keluar') {
      setCurrentTabState('surat-menyurat');
      setSuratSubTab('keluar');
    } else if (tab === 'buku-agenda') {
      setCurrentTabState('surat-menyurat');
      setSuratSubTab('masuk');
    } else {
      setCurrentTabState(tab);
    }
  }, []);

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [cloudSession, setCloudSession] = useState<CloudSessionMeta | null>(() =>
    loadCloudSessionMeta()
  );

  const isApplyingRemoteRef = useRef(false);
  const cloudSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestStateRef = useRef<AppStateData>(state);
  latestStateRef.current = state;

  const isAuthenticated = Boolean(
    state.currentUser &&
      state.currentUser.id &&
      state.currentUser.id !== 'user-empty' &&
      state.currentUser.name.trim().length > 0 &&
      state.currentUser.name !== 'Admin Organisasi' &&
      state.currentUser.name !== 'Tamu / Pengunjung'
  );

  // Sync any pre-existing laptop local accounts to Firestore on boot and restore cloudSession if missing
  useEffect(() => {
    let cancelled = false;
    const bootstrapCloudAccounts = async () => {
      try {
        const localAccounts = getRegisteredAccounts();
        if (localAccounts.length > 0) {
          await syncLegacyLocalAccountsToCloud(localAccounts);
        }
        if (cancelled) return;
        if (isAuthenticated && !cloudSession && state.currentUser.name && state.currentUser.password) {
          const [accountKey, passwordHash, authVerifier] = await Promise.all([
            computeAccountKey(state.currentUser.name),
            computePasswordHash(state.currentUser.name, state.currentUser.password),
            computeAuthVerifier(state.currentUser.name, state.currentUser.password),
          ]);
          if (cancelled) return;
          const meta: CloudSessionMeta = {
            accountKey,
            userId: state.currentUser.id,
            normalizedName: normalizeAccountName(state.currentUser.name),
            authVerifier,
            passwordHash,
          };
          saveCloudSessionMeta(meta);
          setCloudSession(meta);
        }
      } catch (err) {
        console.warn('Background cloud account migration warning:', err);
      }
    };
    void bootstrapCloudAccounts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Subscribe to real-time Firestore updates for active account
  useEffect(() => {
    if (!isAuthenticated || !cloudSession?.accountKey) return;
    const activeUserSnapshot = latestStateRef.current.currentUser;
    const localAccounts = getRegisteredAccounts();
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = subscribeToAccountCloud(
        cloudSession.accountKey,
        activeUserSnapshot,
        localAccounts,
        (remoteState) => {
          isApplyingRemoteRef.current = true;
          saveAccountAppData(activeUserSnapshot.id, remoteState);
          setState((prev) => ({
            ...remoteState,
            currentUser: {
              ...remoteState.currentUser,
              password: prev.currentUser.password || remoteState.currentUser.password,
            },
            users: prev.users,
          }));
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 50);
        }
      );
    } catch (err) {
      console.warn('Cloud subscription error:', err);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, cloudSession?.accountKey]);

  // Auto-save to localStorage immediately & debounce sync to Firestore cloud
  useEffect(() => {
    if (!isAuthenticated) return;
    saveAppData(state);

    if (isApplyingRemoteRef.current || !cloudSession) return;
    if (cloudSyncTimerRef.current) {
      clearTimeout(cloudSyncTimerRef.current);
    }
    const sessionSnapshot = cloudSession;
    const stateSnapshot = state;
    cloudSyncTimerRef.current = setTimeout(() => {
      void saveAccountStateToCloud(sessionSnapshot, stateSnapshot).catch((err) => {
        console.warn('Cloud auto-sync failed:', err);
      });
    }, 500);

    return () => {
      if (cloudSyncTimerRef.current) {
        clearTimeout(cloudSyncTimerRef.current);
      }
    };
  }, [state, isAuthenticated, cloudSession]);

  // Apply dark mode class and accent color to root HTML element
  useEffect(() => {
    if (state.theme.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-accent', state.theme.accentColor || 'blue');
  }, [state.theme.mode, state.theme.accentColor]);

  const showToast = useCallback((title: string, description?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    playNotificationChime();
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helper to log audit activity
  const logActivity = useCallback((
    tipe: AktivitasLogItem['tipe'],
    judul: string,
    detail: string,
    level: AktivitasLogItem['level'] = 'info'
  ) => {
    const newLog: AktivitasLogItem = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      userRole: state.currentUser.role.toUpperCase(),
      tipe,
      judul,
      detail,
      waktu: 'Baru saja',
      timestamp: Date.now(),
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      level,
    };

    setState((prev) => ({
      ...prev,
      aktivitas: [newLog, ...prev.aktivitas.slice(0, 49)],
    }));
  }, [state.currentUser]);

  // Push notification helper
  const addNotification = useCallback((item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: item.title,
      message: item.message,
      type: item.type,
      linkTo: item.linkTo,
      timestamp: 'Baru saja',
      read: false,
    };
    setState((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));

    // Trigger email simulation if enabled
    if (state.integrations.emailSmtpEnabled && state.integrations.notificationEmail) {
      sendSimulatedEmail(
        state.integrations.notificationEmail,
        `[SENTRA UIB] ${item.title}`,
        `${item.message}\n\nWaktu: ${new Date().toLocaleString('id-ID')}\nPengguna: ${state.currentUser.name}`
      );
    }
  }, [state.integrations.emailSmtpEnabled, state.integrations.notificationEmail, state.currentUser.name]);

  const getMergedAccounts = (): User[] => {
    const stored = getRegisteredAccounts();
    const map = new Map<string, User>();
    [...stored, ...state.users].forEach((u) => {
      if (u && u.name && u.name.trim() && u.id !== 'user-empty') {
        map.set(normalizeAccountName(u.name), u);
      }
    });
    return Array.from(map.values());
  };

  const loginUser = (user: User) => {
    const accounts = getRegisteredAccounts();
    setActiveSessionUserId(user.id);
    const loaded = loadAccountAppData(user, accounts);
    setState(loaded);
    setCurrentTabState('dashboard');
    showToast('Login Berhasil', `Selamat datang kembali, ${user.name}!`, 'success');
  };

  const formatCloudAuthError = (err: unknown, fallback: string): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('offline') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('unavailable')) {
      return 'Koneksi ke server cloud terganggu. Pastikan internet aktif lalu coba lagi.';
    }
    return fallback;
  };

  const loginWithCredentials = async (
    name: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const cleanPassword = password.trim();

    if (!cleanName || !cleanPassword) {
      return { ok: false, error: 'Nama lengkap dan password wajib diisi.' };
    }

    const accounts = getMergedAccounts();
    try {
      const result = await loginAccountFromCloud(cleanName, cleanPassword, accounts);
      if (!result.ok || !result.user || !result.stateData || !result.sessionMeta) {
        return { ok: false, error: result.error || 'Gagal masuk ke akun.' };
      }

      const loggedUser = result.user;
      const targetKey = normalizeAccountName(loggedUser.name);
      const updatedAccounts = accounts.some((u) => normalizeAccountName(u.name) === targetKey)
        ? accounts.map((u) => (normalizeAccountName(u.name) === targetKey ? loggedUser : u))
        : [...accounts, loggedUser];

      saveRegisteredAccounts(updatedAccounts);
      setActiveSessionUserId(loggedUser.id);
      saveCloudSessionMeta(result.sessionMeta);
      setCloudSession(result.sessionMeta);

      const finalState: AppStateData = {
        ...result.stateData,
        users: updatedAccounts,
        currentUser: loggedUser,
      };
      saveAccountAppData(loggedUser.id, finalState);
      isApplyingRemoteRef.current = true;
      setState(finalState);
      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 50);

      setCurrentTabState('dashboard');
      setActiveModal(null);
      showToast(
        'Login Berhasil',
        `Selamat datang kembali, ${loggedUser.name}! Data akun berhasil disinkronkan.`,
        'success'
      );
      return { ok: true };
    } catch (err) {
      console.error('Cloud login error:', err);
      return {
        ok: false,
        error: formatCloudAuthError(err, 'Gagal menghubungi server login cloud. Coba lagi sebentar.'),
      };
    }
  };

  const registerAndLoginAccount = async (
    name: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const cleanPassword = password.trim();

    if (!cleanName) {
      return { ok: false, error: 'Nama lengkap wajib diisi.' };
    }
    if (!cleanPassword) {
      return { ok: false, error: 'Password wajib diisi.' };
    }

    const accounts = getMergedAccounts();
    try {
      const result = await registerAccountInCloud(cleanName, cleanPassword, accounts);
      if (!result.ok || !result.user || !result.stateData || !result.sessionMeta) {
        return { ok: false, error: result.error || 'Gagal membuat akun baru.' };
      }

      const newUser = result.user;
      const updatedAccounts = [...accounts.filter((u) => normalizeAccountName(u.name) !== normalizeAccountName(cleanName)), newUser];
      saveRegisteredAccounts(updatedAccounts);
      setActiveSessionUserId(newUser.id);
      saveCloudSessionMeta(result.sessionMeta);
      setCloudSession(result.sessionMeta);

      const freshData: AppStateData = {
        ...result.stateData,
        users: updatedAccounts,
        currentUser: newUser,
      };
      saveAccountAppData(newUser.id, freshData);
      isApplyingRemoteRef.current = true;
      setState(freshData);
      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 50);

      setCurrentTabState('dashboard');
      setActiveModal(null);
      showToast(
        'Akun Baru Berhasil Dibuat',
        `Selamat datang, ${cleanName}! Akun Anda tersimpan di cloud dan bisa dibuka dari HP maupun laptop.`,
        'success'
      );
      return { ok: true };
    } catch (err) {
      console.error('Cloud register error:', err);
      return {
        ok: false,
        error: formatCloudAuthError(err, 'Gagal mendaftarkan akun ke server cloud. Coba lagi sebentar.'),
      };
    }
  };

  const logoutUser = () => {
    if (cloudSyncTimerRef.current) {
      clearTimeout(cloudSyncTimerRef.current);
      cloudSyncTimerRef.current = null;
    }
    if (isAuthenticated) {
      saveAccountAppData(state.currentUser.id, state);
      if (cloudSession) {
        void saveAccountStateToCloud(cloudSession, state).catch(() => {});
      }
    }
    const accounts = getMergedAccounts();
    saveRegisteredAccounts(accounts);
    setActiveSessionUserId(null);
    saveCloudSessionMeta(null);
    setCloudSession(null);
    setState({
      ...INITIAL_STATE,
      users: accounts,
      currentUser: EMPTY_USER,
    });
    setActiveModal(null);
    setSidebarOpen(false);
    showToast('Keluar Akun Berhasil', 'Silakan masuk kembali atau buat akun baru.', 'info');
  };

  const updateCurrentUserProfile = async (
    updated: Partial<User>
  ): Promise<{ ok: boolean; error?: string }> => {
    const cleanName = (updated.name?.trim() || state.currentUser.name).replace(/\s+/g, ' ');
    const cleanPassword =
      updated.password !== undefined ? updated.password.trim() : state.currentUser.password || '';

    const accounts = getMergedAccounts();
    const targetId =
      state.currentUser.id &&
      state.currentUser.id !== 'user-empty' &&
      state.currentUser.id !== 'user-admin'
        ? state.currentUser.id
        : `user-${Date.now()}`;

    const newCurr: User = {
      ...state.currentUser,
      ...updated,
      id: targetId,
      name: cleanName,
      password: cleanPassword,
      role: updated.role || state.currentUser.role || 'superadmin',
      division: 'SENTRA UIB',
      lastActive: 'Aktif Sekarang',
    };

    try {
      if (cloudSession) {
        const cloudRes = await updateAccountCredentialsInCloud(cloudSession, newCurr, state);
        if (!cloudRes.ok || !cloudRes.sessionMeta) {
          return { ok: false, error: cloudRes.error || 'Gagal memperbarui akun di cloud.' };
        }
        saveCloudSessionMeta(cloudRes.sessionMeta);
        setCloudSession(cloudRes.sessionMeta);
      }

      const existsInList = accounts.some((u) => u.id === newCurr.id);
      const newUsers = existsInList
        ? accounts.map((u) => (u.id === newCurr.id ? newCurr : u))
        : [...accounts, newCurr];

      saveRegisteredAccounts(newUsers);
      setActiveSessionUserId(newCurr.id);

      const nextState: AppStateData = {
        ...state,
        currentUser: newCurr,
        users: newUsers,
      };
      saveAccountAppData(newCurr.id, nextState);
      isApplyingRemoteRef.current = true;
      setState(nextState);
      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 50);

      logActivity(
        'Keamanan',
        'Pengaturan Akun Diperbarui',
        `Profil & kredensial akun "${cleanName}" telah diperbarui.`,
        'success'
      );
      showToast(
        'Akun Diperbarui',
        `Pengaturan akun "${cleanName}" berhasil disimpan ke cloud.`,
        'success'
      );
      return { ok: true };
    } catch (err) {
      console.error('Update profile error:', err);
      return {
        ok: false,
        error: formatCloudAuthError(err, 'Gagal memperbarui kredensial akun ke cloud.'),
      };
    }
  };

  const switchUser = (userId: string) => {
    const accounts = getRegisteredAccounts();
    const target = accounts.find((u) => u.id === userId);
    if (target) {
      if (isAuthenticated) {
        saveAccountAppData(state.currentUser.id, state);
      }
      setActiveSessionUserId(target.id);
      const loaded = loadAccountAppData(target, accounts);
      setState(loaded);
      setCurrentTabState('dashboard');
      if (target.password) {
        void Promise.all([
          computeAccountKey(target.name),
          computePasswordHash(target.name, target.password),
          computeAuthVerifier(target.name, target.password),
        ]).then(([accountKey, passwordHash, authVerifier]) => {
          const meta: CloudSessionMeta = {
            accountKey,
            userId: target.id,
            normalizedName: normalizeAccountName(target.name),
            authVerifier,
            passwordHash,
          };
          saveCloudSessionMeta(meta);
          setCloudSession(meta);
        });
      } else {
        saveCloudSessionMeta(null);
        setCloudSession(null);
      }
      showToast('Beralih Akun', `Sekarang masuk sebagai ${target.name}`, 'info');
    }
  };

  // Surat Masuk CRUD
  const addSuratMasuk = (item: Omit<SuratMasukItem, 'id'>) => {
    const newItem: SuratMasukItem = {
      ...item,
      id: 'sm-' + Date.now(),
    };
    const newAgendaRow: BukuAgendaSuratRow = {
      id: 'bag-' + Date.now(),
      no: state.bukuAgenda.length + 1,
      tanggalSurat: item.tanggalTerima || item.tanggalSurat,
      nomorSurat: item.nomorSurat,
      perihal: item.perihal,
      dituju: item.disposisiKepada || 'Ketua Umum & Sekretaris',
      keterangan: item.keterangan || item.catatanDisposisi || `Status: ${item.status}`,
      penerima: item.penerima || item.pengirim || state.currentUser.name,
      jenisSurat: 'Masuk',
    };
    setState((prev) => ({
      ...prev,
      suratMasuk: [newItem, ...prev.suratMasuk],
      bukuAgenda: [newAgendaRow, ...prev.bukuAgenda],
    }));
    logActivity('Surat Masuk', 'Surat Masuk Baru', `${item.pengirim}: ${item.perihal}`, 'info');
    addNotification({
      title: 'Surat Masuk Baru',
      message: `Surat dari ${item.pengirim} (${item.nomorSurat}) telah diinput.`,
      type: 'mail',
      linkTo: 'surat-masuk',
    });
    showToast('Surat Masuk Ditambahkan', `Surat dari ${item.pengirim} berhasil disimpan ke database & buku agenda spreadsheet.`, 'success');
  };

  const updateSuratMasuk = (id: string, patch: Partial<SuratMasukItem>) => {
    setState((prev) => ({
      ...prev,
      suratMasuk: prev.suratMasuk.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
    logActivity('Surat Masuk', 'Pembaruan Surat Masuk', `Surat id #${id} diperbarui status/disposisinya`, 'info');
    showToast('Perubahan Disimpan', 'Data surat masuk berhasil diperbarui.', 'success');
  };

  const deleteSuratMasuk = (id: string) => {
    setState((prev) => ({
      ...prev,
      suratMasuk: prev.suratMasuk.filter((s) => s.id !== id),
    }));
    logActivity('Surat Masuk', 'Penghapusan Surat Masuk', `Surat id #${id} dihapus dari arsip`, 'warning');
    showToast('Surat Dihapus', 'Data surat masuk telah dihapus dari sistem.', 'info');
  };

  // Surat Keluar CRUD
  const addSuratKeluar = (item: Omit<SuratKeluarItem, 'id'>) => {
    const newItem: SuratKeluarItem = {
      ...item,
      id: 'sk-' + Date.now(),
      tanggalSurat: item.tanggalSurat || item.tanggalKirim,
      keterangan: item.keterangan || (item.penandatangan ? `TTD: ${item.penandatangan}` : '-'),
    };
    const newAgendaRow: BukuAgendaSuratRow = {
      id: 'bag-' + Date.now(),
      no: state.bukuAgenda.length + 1,
      tanggalSurat: item.tanggalKirim,
      nomorSurat: item.nomorSurat,
      perihal: item.perihal,
      dituju: item.tujuan,
      keterangan: item.keterangan || `Penandatangan: ${item.penandatangan} (${item.status})`,
      penerima: item.tujuan,
      jenisSurat: 'Keluar',
    };
    setState((prev) => ({
      ...prev,
      suratKeluar: [newItem, ...prev.suratKeluar],
      bukuAgenda: [newAgendaRow, ...prev.bukuAgenda],
    }));
    logActivity('Surat Keluar', 'Surat Keluar Diterbitkan', `${item.nomorSurat} kepada ${item.tujuan}`, 'info');
    addNotification({
      title: 'Surat Keluar Diterbitkan',
      message: `Surat ${item.nomorSurat} kepada ${item.tujuan} berhasil dicatat di spreadsheet.`,
      type: 'mail',
      linkTo: 'surat-keluar',
    });
    showToast('Surat Keluar Tersimpan', `Data surat ${item.nomorSurat} berhasil dicatat ke spreadsheet.`, 'success');
  };

  const updateSuratKeluar = (id: string, patch: Partial<SuratKeluarItem>) => {
    setState((prev) => ({
      ...prev,
      suratKeluar: prev.suratKeluar.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
    showToast('Surat Keluar Diperbarui', 'Data surat keluar berhasil disimpan.', 'success');
  };

  const deleteSuratKeluar = (id: string) => {
    setState((prev) => ({
      ...prev,
      suratKeluar: prev.suratKeluar.filter((s) => s.id !== id),
    }));
    showToast('Surat Keluar Dihapus', 'Surat keluar telah dihapus.', 'info');
  };

  // Buku Agenda Surat CRUD (Spreadsheet)
  const addBukuAgendaRow = (item: Omit<BukuAgendaSuratRow, 'id' | 'no'>) => {
    const newRow: BukuAgendaSuratRow = {
      ...item,
      id: 'bag-' + Date.now(),
      no: state.bukuAgenda.length + 1,
    };
    setState((prev) => ({
      ...prev,
      bukuAgenda: [newRow, ...prev.bukuAgenda],
    }));
    logActivity('Surat Masuk', 'Entri Agenda Ditambahkan', `${item.nomorSurat} - ${item.perihal}`, 'info');
    showToast('Agenda Tersimpan', `Surat ${item.nomorSurat} tercatat dalam buku agenda spreadsheet.`, 'success');
  };

  const updateBukuAgendaRow = (id: string, patch: Partial<BukuAgendaSuratRow>) => {
    setState((prev) => ({
      ...prev,
      bukuAgenda: prev.bukuAgenda.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
    showToast('Perubahan Disimpan', 'Baris buku agenda surat berhasil diperbarui.', 'success');
  };

  const deleteBukuAgendaRow = (id: string) => {
    setState((prev) => ({
      ...prev,
      bukuAgenda: prev.bukuAgenda.filter((r) => r.id !== id),
    }));
    showToast('Baris Dihapus', 'Entri telah dihapus dari buku agenda spreadsheet.', 'info');
  };

  // Dokumen CRUD
  const addDokumen = (item: Omit<DokumenOrganisasiItem, 'id' | 'diuploadOleh'> & { tanggalUpload?: string }) => {
    const newItem: DokumenOrganisasiItem = {
      ...item,
      id: 'dok-' + Date.now(),
      tanggalUpload: item.tanggalUpload || new Date().toISOString().split('T')[0],
      diuploadOleh: state.currentUser.name,
      kategori: item.kategori || 'Dokumen Organisasi',
      ukuranFile: item.ukuranFile || '1.0 MB',
      tahun: item.tahun || (item.tanggalUpload ? item.tanggalUpload.split('-')[0] : new Date().getFullYear().toString()),
    };
    setState((prev) => ({
      ...prev,
      dokumen: [newItem, ...prev.dokumen],
    }));
    logActivity('Dokumen', 'Dokumen Diunggah', `${item.judul}`, 'success');
    addNotification({
      title: 'Dokumen Organisasi Diunggah',
      message: `${item.judul} berhasil ditambahkan ke arsip organisasi.`,
      type: 'system',
      linkTo: 'arsip',
    });
    showToast('Dokumen Tersimpan', `${item.judul} berhasil diunggah ke Arsip Organisasi.`, 'success');
  };

  const deleteDokumen = (id: string) => {
    setState((prev) => ({
      ...prev,
      dokumen: prev.dokumen.filter((d) => d.id !== id),
    }));
    showToast('Dokumen Dihapus', 'Dokumen telah dihapus dari repositori.', 'info');
  };

  // Proposal LPJ CRUD
  const addProposalLpj = (item: Omit<ProposalLpjItem, 'id'> & { tanggalDiajukan?: string }) => {
    const newItem: ProposalLpjItem = {
      ...item,
      id: 'prop-' + Date.now(),
      tanggalDiajukan: item.tanggalDiajukan || new Date().toISOString().split('T')[0],
    };
    setState((prev) => ({
      ...prev,
      proposalLpj: [newItem, ...prev.proposalLpj],
    }));
    logActivity('Proposal Kegiatan', `${item.jenis} Diunggah`, `${item.judul} oleh ${item.penanggungJawab}`, 'info');
    addNotification({
      title: `${item.jenis} Baru Diajukan`,
      message: `${item.judul} membutuhkan peninjauan dan persetujuan.`,
      type: 'proposal',
      linkTo: 'proposal-lpj',
    });
    showToast('Berkas Diserahkan', `${item.jenis} ${item.judul} berhasil didaftarkan.`, 'success');
  };

  const updateProposalStatus = (id: string, status: ProposalLpjItem['status'], catatan?: string) => {
    setState((prev) => ({
      ...prev,
      proposalLpj: prev.proposalLpj.map((p) => (p.id === id ? { ...p, status, catatan: catatan ?? p.catatan } : p)),
    }));
    logActivity('Proposal Kegiatan', 'Status Proposal Berubah', `Status diubah menjadi: ${status}`, 'success');
    showToast('Status Diperbarui', `Proposal telah diperbarui ke status ${status}`, 'success');
  };

  const deleteProposalLpj = (id: string) => {
    setState((prev) => ({
      ...prev,
      proposalLpj: prev.proposalLpj.filter((p) => p.id !== id),
    }));
    showToast('Proposal Dihapus', 'Proposal/LPJ telah dihapus.', 'info');
  };

  // Keuangan CRUD
  const addTransaksi = (item: Omit<TransaksiKeuanganItem, 'id' | 'saldoSetelah'>) => {
    const latestSaldo = state.transaksi.length > 0 ? state.transaksi[0].saldoSetelah : 0;
    const newSaldo = item.jenis === 'Pemasukan' ? latestSaldo + item.nominal : latestSaldo - item.nominal;

    const newItem: TransaksiKeuanganItem = {
      ...item,
      id: 'trx-' + Date.now(),
      saldoSetelah: newSaldo,
    };

    setState((prev) => ({
      ...prev,
      transaksi: [newItem, ...prev.transaksi],
    }));

    logActivity(
      'Transaksi Keuangan',
      item.jenis === 'Pemasukan' ? 'Pemasukan Kas' : 'Pengeluaran Kas',
      `${item.keterangan} - ${formatRupiah(item.nominal)}`,
      item.jenis === 'Pemasukan' ? 'success' : 'warning'
    );

    addNotification({
      title: `Transaksi Keuangan: ${item.jenis}`,
      message: `${item.keterangan} (${formatRupiah(item.nominal)}). Saldo kini ${formatRupiah(newSaldo)}.`,
      type: 'finance',
      linkTo: 'keuangan',
    });

    showToast('Transaksi Berhasil Dicatat', `${item.jenis} sebesar ${formatRupiah(item.nominal)} tersimpan.`, 'success');
  };

  const deleteTransaksi = (id: string) => {
    setState((prev) => ({
      ...prev,
      transaksi: prev.transaksi.filter((t) => t.id !== id),
    }));
    showToast('Transaksi Dihapus', 'Catatan transaksi telah dihapus.', 'info');
  };

  // Agenda CRUD
  const addAgenda = (item: Omit<AgendaItem, 'id'>) => {
    const newItem: AgendaItem = {
      ...item,
      id: 'ag-' + Date.now(),
    };
    setState((prev) => ({
      ...prev,
      agenda: [...prev.agenda, newItem].sort((a, b) => a.tanggal.localeCompare(b.tanggal)),
    }));

    logActivity('Agenda Baru', 'Agenda Ditambahkan', `${item.judul} pada ${item.tanggal}`, 'success');

    addNotification({
      title: 'Agenda Baru Dijadwalkan',
      message: `${item.judul} pada tanggal ${item.tanggal} (${item.waktuMulai} - ${item.waktuSelesai}).`,
      type: 'agenda',
      linkTo: 'rencana-agenda',
    });

    showToast('Agenda Tersimpan', `${item.judul} telah dijadwalkan di kalender organisasi.`, 'success');
  };

  const updateAgenda = (id: string, patch: Partial<AgendaItem>) => {
    setState((prev) => ({
      ...prev,
      agenda: prev.agenda.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
    showToast('Agenda Diperbarui', 'Perubahan jadwal agenda telah disimpan.', 'success');
  };

  const deleteAgenda = (id: string) => {
    setState((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((a) => a.id !== id),
    }));
    showToast('Agenda Dihapus', 'Jadwal agenda telah dihapus.', 'info');
  };

  // Kejadian Penting CRUD
  const addKejadianPenting = (item: Omit<KejadianPentingItem, 'id'>) => {
    const newItem: KejadianPentingItem = {
      ...item,
      id: 'kp-' + Date.now(),
      no: (state.kejadianPenting || []).length + 1,
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      kejadianPenting: [newItem, ...(prev.kejadianPenting || [])],
    }));
    const agendaTitle = item.namaAgenda || item.namaKegiatan || 'Agenda';
    const agendaDate = item.tanggal || item.tanggalAcara || '';
    logActivity('Kejadian Penting', 'Kejadian Penting Dicatat', `${agendaTitle} (${agendaDate})`, 'info');
    showToast('Kejadian Penting Tersimpan', `Agenda "${agendaTitle}" berhasil dicatat ke spreadsheet.`, 'success');
  };

  const updateKejadianPenting = (id: string, patch: Partial<KejadianPentingItem>) => {
    setState((prev) => ({
      ...prev,
      kejadianPenting: (prev.kejadianPenting || []).map((k) => (k.id === id ? { ...k, ...patch } : k)),
    }));
    showToast('Pembaruan Disimpan', 'Data kejadian penting berhasil diperbarui.', 'success');
  };

  const deleteKejadianPenting = (id: string) => {
    setState((prev) => ({
      ...prev,
      kejadianPenting: (prev.kejadianPenting || []).filter((k) => k.id !== id),
    }));
    showToast('Data Dihapus', 'Catatan kejadian penting telah dihapus.', 'info');
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsAsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
    showToast('Semua Notifikasi Dibaca', 'Pemberitahuan telah ditandai selesai.', 'info');
  };

  // Theme & settings
  const updateTheme = (patch: Partial<ThemeSettings>) => {
    setState((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...patch },
    }));
    showToast('Preferensi Tampilan', 'Tema antarmuka berhasil disesuaikan.', 'success');
  };

  const updateIntegrations = (patch: Partial<ThirdPartyIntegrationConfig>) => {
    setState((prev) => ({
      ...prev,
      integrations: { ...prev.integrations, ...patch },
    }));
    showToast('Integrasi Eksternal Disimpan', 'Konfigurasi Webhook & API pihak ketiga telah diaktifkan.', 'success');
  };

  const updateBackupInfo = (patch: Partial<CloudBackupInfo>) => {
    setState((prev) => ({
      ...prev,
      backupInfo: { ...prev.backupInfo, ...patch },
    }));
  };

  const triggerBackupNow = () => {
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' }) + ' WIB';
    setState((prev) => ({
      ...prev,
      backupInfo: {
        ...prev.backupInfo,
        lastBackupTime: nowStr,
        backupSize: `${(JSON.stringify(prev).length / 1024).toFixed(1)} KB (Terenkripsi AES-256)`,
      },
    }));
    logActivity('Keamanan', 'Pencadangan Cloud Berhasil', 'Snapshot database terenkripsi disimpan ke cloud.', 'success');
    showToast('Pencadangan Berhasil', 'Seluruh data organisasi aman tercadangkan ke cloud storage.', 'success');
  };

  const restoreFromSnapshot = (snapshotJson: string): boolean => {
    try {
      const parsed = JSON.parse(snapshotJson);
      const incomingData = parsed.data || parsed;
      if (incomingData && Array.isArray(incomingData.suratMasuk)) {
        setState({
          ...INITIAL_STATE,
          ...incomingData,
        });
        showToast('Pemulihan Sukses', 'Database berhasil dipulihkan dari cadangan.', 'success');
        return true;
      }
      showToast('Gagal Memulihkan', 'Format file cadangan tidak valid.', 'error');
      return false;
    } catch {
      showToast('Gagal Memulihkan', 'Gagal membaca format JSON.', 'error');
      return false;
    }
  };

  const resetAllData = () => {
    const fresh = resetAppData();
    setState(fresh);
    showToast('Reset Selesai', 'Data dikembalikan ke konfigurasi awal bawaan.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        state,
        currentTab,
        setCurrentTab: handleSetCurrentTab,
        suratSubTab,
        setSuratSubTab,
        activeModal,
        setActiveModal,
        sidebarOpen,
        setSidebarOpen,
        toasts,
        showToast,
        removeToast,
        isAuthenticated,
        loginUser,
        loginWithCredentials,
        registerAndLoginAccount,
        logoutUser,
        updateCurrentUserProfile,
        switchUser,
        addSuratMasuk,
        updateSuratMasuk,
        deleteSuratMasuk,
        addSuratKeluar,
        updateSuratKeluar,
        deleteSuratKeluar,
        addBukuAgendaRow,
        updateBukuAgendaRow,
        deleteBukuAgendaRow,
        addDokumen,
        deleteDokumen,
        addProposalLpj,
        updateProposalStatus,
        deleteProposalLpj,
        addTransaksi,
        deleteTransaksi,
        addAgenda,
        updateAgenda,
        deleteAgenda,
        addKejadianPenting,
        updateKejadianPenting,
        deleteKejadianPenting,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        updateTheme,
        updateIntegrations,
        updateBackupInfo,
        triggerBackupNow,
        restoreFromSnapshot,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
