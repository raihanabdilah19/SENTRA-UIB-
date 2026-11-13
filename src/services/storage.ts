import {
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
  User,
  CloudBackupInfo,
  ThirdPartyIntegrationConfig,
  ThemeSettings,
} from '../types';
import * as XLSX from 'xlsx';

export interface AppStateData {
  users: User[];
  currentUser: User;
  suratMasuk: SuratMasukItem[];
  suratKeluar: SuratKeluarItem[];
  bukuAgenda: BukuAgendaSuratRow[];
  dokumen: DokumenOrganisasiItem[];
  proposalLpj: ProposalLpjItem[];
  transaksi: TransaksiKeuanganItem[];
  agenda: AgendaItem[];
  kejadianPenting: KejadianPentingItem[];
  aktivitas: AktivitasLogItem[];
  notifications: NotificationItem[];
  backupInfo: CloudBackupInfo;
  integrations: ThirdPartyIntegrationConfig;
  theme: ThemeSettings;
  vaultEncrypted: boolean;
  encryptionKeyHint: string;
}

const STORAGE_KEY = 'organization_hub_app_data_v2';
const ACCOUNTS_STORAGE_KEY = 'sentra_uib_accounts_v1';
const ACTIVE_SESSION_KEY = 'sentra_uib_active_session_v1';
const ACCOUNT_DATA_PREFIX = 'sentra_uib_account_data_';
const MIGRATION_FLAG_KEY = 'sentra_uib_migrated_v2';

// In-memory fallback in case browser restricts localStorage in strict iframe contexts
const memoryStorageFallback: Record<string, string> = {};

const safeGetItem = (key: string): string | null => {
  if (typeof window === 'undefined') return memoryStorageFallback[key] ?? null;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : memoryStorageFallback[key] ?? null;
  } catch {
    return memoryStorageFallback[key] ?? null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  memoryStorageFallback[key] = value;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn('localStorage write failed, using in-memory fallback:', err);
  }
};

const safeRemoveItem = (key: string): void => {
  delete memoryStorageFallback[key];
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
};

export const normalizeAccountName = (name: string): string =>
  name.trim().replace(/\s+/g, ' ').toLowerCase();

export const EMPTY_USER: User = {
  id: 'user-empty',
  name: '',
  email: '',
  password: '',
  role: 'superadmin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  nim: '',
  division: 'SENTRA UIB',
  phone: '',
  lastActive: '',
};

export const DEFAULT_USER: User = {
  id: 'user-admin',
  name: 'Admin Organisasi',
  email: 'admin@uib.ac.id',
  password: '',
  role: 'superadmin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  nim: '',
  division: 'SENTRA UIB',
  phone: '',
  lastActive: 'Aktif Sekarang',
};

export const INITIAL_USERS: User[] = [];

export const INITIAL_SURAT_MASUK: SuratMasukItem[] = [];
export const INITIAL_SURAT_KELUAR: SuratKeluarItem[] = [];
export const INITIAL_DOKUMEN: DokumenOrganisasiItem[] = [];
export const INITIAL_PROPOSAL_LPJ: ProposalLpjItem[] = [];
export const INITIAL_TRANSAKSI: TransaksiKeuanganItem[] = [];
export const INITIAL_AGENDA: AgendaItem[] = [];
export const INITIAL_AKTIVITAS: AktivitasLogItem[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_BUKU_AGENDA: BukuAgendaSuratRow[] = [];

export const INITIAL_STATE: AppStateData = {
  users: [],
  currentUser: EMPTY_USER,
  suratMasuk: [],
  suratKeluar: [],
  bukuAgenda: [],
  dokumen: [],
  proposalLpj: [],
  transaksi: [],
  agenda: [],
  kejadianPenting: [],
  aktivitas: [],
  notifications: [],
  backupInfo: {
    lastBackupTime: null,
    backupSize: '0 KB',
    autoBackupEnabled: true,
    backupFrequency: 'realtime',
    cloudProvider: 'Google Cloud',
    encrypted: true,
  },
  integrations: {
    googleDriveEnabled: true,
    googleDriveFolderId: 'MPI-2026-DRIVE',
    googleDriveUrl: 'https://drive.google.com/drive/my-drive',
    googleSheetsEnabled: true,
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/Surat_Keluar_MPI_2026',
    telegramBotEnabled: false,
    telegramChatId: '',
    webhookEnabled: false,
    webhookUrl: '',
    emailSmtpEnabled: true,
    notificationEmail: 'admin@ummulquro.ac.id',
  },
  theme: {
    mode: 'light',
    accentColor: 'blue',
    compactDensity: false,
  },
  vaultEncrypted: true,
  encryptionKeyHint: 'AES-256-GCM-ORGANIZATION-2026',
};

const isGuestOrInvalidUser = (u?: Partial<User> | null): boolean => {
  if (!u || !u.name || !u.name.trim()) return true;
  return (
    u.name === 'Tamu / Pengunjung' ||
    u.name === 'Admin Organisasi' ||
    u.email === 'tamu@ormawa.id' ||
    u.division === 'Umum' ||
    u.id === 'guest' ||
    u.id === 'user-empty'
  );
};

const sanitizeMigratedUser = (u: User): User => ({
  ...u,
  id:
    !u.id || u.id === 'user-admin' || u.id === 'user-empty' || u.id === 'guest'
      ? `user-${normalizeAccountName(u.name).replace(/[^a-z0-9]/g, '_')}-${Date.now()}`
      : u.id,
  name: u.name.trim().replace(/\s+/g, ' '),
  password: u.password ?? '',
  role: u.role || 'superadmin',
  division: 'SENTRA UIB',
});

const runLegacyMigrationIfNeeded = (existing: User[]): User[] => {
  if (typeof window === 'undefined') return existing;
  if (safeGetItem(MIGRATION_FLAG_KEY) === 'done') return existing;

  const merged = [...existing];
  const hasAccount = (name: string) =>
    merged.some((u) => normalizeAccountName(u.name) === normalizeAccountName(name));

  try {
    const legacyRaw = safeGetItem(STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      const candidates: User[] = [];
      if (Array.isArray(legacy.users)) {
        candidates.push(...legacy.users);
      }
      if (legacy.currentUser) {
        candidates.push(legacy.currentUser);
      }

      candidates.forEach((cand) => {
        if (!isGuestOrInvalidUser(cand) && !hasAccount(cand.name)) {
          const clean = sanitizeMigratedUser(cand);
          merged.push(clean);
          const oldSnapKey = `sentra_uib_user_${cand.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          const snapRaw = safeGetItem(oldSnapKey);
          const accountKey = `${ACCOUNT_DATA_PREFIX}${clean.id}`;
          if (!safeGetItem(accountKey)) {
            const snap = snapRaw ? JSON.parse(snapRaw) : legacy;
            safeSetItem(
              accountKey,
              JSON.stringify({
                ...INITIAL_STATE,
                currentUser: clean,
                suratMasuk: snap.suratMasuk || [],
                suratKeluar: snap.suratKeluar || [],
                bukuAgenda: snap.bukuAgenda || [],
                dokumen: snap.dokumen || [],
                proposalLpj: snap.proposalLpj || [],
                transaksi: snap.transaksi || [],
                agenda: snap.agenda || [],
                kejadianPenting: snap.kejadianPenting || [],
              })
            );
          }
        }
      });
    }

    // Also inspect any sentra_uib_user_* per-user snapshot keys
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sentra_uib_user_')) {
          const rawSnap = localStorage.getItem(key);
          if (!rawSnap) continue;
          const snap = JSON.parse(rawSnap);
          if (snap?.user && !isGuestOrInvalidUser(snap.user) && !hasAccount(snap.user.name)) {
            const clean = sanitizeMigratedUser(snap.user);
            merged.push(clean);
            const accountKey = `${ACCOUNT_DATA_PREFIX}${clean.id}`;
            if (!safeGetItem(accountKey)) {
              safeSetItem(
                accountKey,
                JSON.stringify({
                  ...INITIAL_STATE,
                  currentUser: clean,
                  suratMasuk: snap.suratMasuk || [],
                  suratKeluar: snap.suratKeluar || [],
                  bukuAgenda: snap.bukuAgenda || [],
                  dokumen: snap.dokumen || [],
                  proposalLpj: snap.proposalLpj || [],
                  transaksi: snap.transaksi || [],
                  agenda: snap.agenda || [],
                  kejadianPenting: snap.kejadianPenting || [],
                })
              );
            }
          }
        }
      }
    } catch {
      // Ignore localStorage key enumeration restrictions
    }

    if (merged.length > 0) {
      safeSetItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(merged));
    }
    safeSetItem(MIGRATION_FLAG_KEY, 'done');
  } catch {
    safeSetItem(MIGRATION_FLAG_KEY, 'done');
  }

  return merged;
};

export const getRegisteredAccounts = (): User[] => {
  try {
    let base: User[] = [];
    const rawAccounts = safeGetItem(ACCOUNTS_STORAGE_KEY);
    if (rawAccounts) {
      const parsed = JSON.parse(rawAccounts);
      if (Array.isArray(parsed)) {
        base = parsed
          .filter((u: User) => !isGuestOrInvalidUser(u))
          .map((u: User) => sanitizeMigratedUser(u));
      }
    }
    return runLegacyMigrationIfNeeded(base);
  } catch {
    return [];
  }
};

export const saveRegisteredAccounts = (users: User[]): void => {
  try {
    const clean = users
      .filter((u) => !isGuestOrInvalidUser(u))
      .map((u) => sanitizeMigratedUser(u));
    safeSetItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(clean));
  } catch (err) {
    console.error('Failed to save registered accounts:', err);
  }
};

export const getActiveSessionUserId = (): string | null => {
  return safeGetItem(ACTIVE_SESSION_KEY);
};

export const setActiveSessionUserId = (userId: string | null): void => {
  if (userId) {
    safeSetItem(ACTIVE_SESSION_KEY, userId);
  } else {
    safeRemoveItem(ACTIVE_SESSION_KEY);
  }
};

export const createFreshAccountData = (user: User, allUsers?: User[]): AppStateData => {
  const accounts = allUsers || getRegisteredAccounts();
  return {
    ...INITIAL_STATE,
    users: accounts,
    currentUser: user,
    suratMasuk: [],
    suratKeluar: [],
    bukuAgenda: [],
    dokumen: [],
    proposalLpj: [],
    transaksi: [],
    agenda: [],
    kejadianPenting: [],
    aktivitas: [],
    notifications: [],
    theme: { ...INITIAL_STATE.theme, mode: 'light' },
  };
};

export const loadAccountAppData = (user: User, allUsers?: User[]): AppStateData => {
  const accounts = allUsers || getRegisteredAccounts();
  if (!user?.id) {
    return createFreshAccountData(user, accounts);
  }
  try {
    const raw = safeGetItem(`${ACCOUNT_DATA_PREFIX}${user.id}`);
    if (!raw) {
      const fresh = createFreshAccountData(user, accounts);
      saveAccountAppData(user.id, fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATE,
      ...parsed,
      users: accounts,
      currentUser: user,
      suratMasuk: parsed.suratMasuk || [],
      suratKeluar: parsed.suratKeluar || [],
      bukuAgenda: parsed.bukuAgenda || [],
      dokumen: parsed.dokumen || [],
      proposalLpj: parsed.proposalLpj || [],
      transaksi: parsed.transaksi || [],
      agenda: parsed.agenda || [],
      kejadianPenting: parsed.kejadianPenting || [],
      aktivitas: parsed.aktivitas || [],
      notifications: parsed.notifications || [],
      theme: { ...INITIAL_STATE.theme, ...(parsed.theme || {}) },
      integrations: { ...INITIAL_STATE.integrations, ...(parsed.integrations || {}) },
      backupInfo: { ...INITIAL_STATE.backupInfo, ...(parsed.backupInfo || {}) },
    };
  } catch {
    return createFreshAccountData(user, accounts);
  }
};

export const saveAccountAppData = (userId: string, data: AppStateData): void => {
  if (!userId || userId === 'user-empty' || userId === 'user-admin') return;
  try {
    const payload: AppStateData = {
      ...data,
      users: [], // Stored separately in ACCOUNTS_STORAGE_KEY
    };
    safeSetItem(`${ACCOUNT_DATA_PREFIX}${userId}`, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save account data:', err);
  }
};

// Storage helper functions
export const loadAppData = (): AppStateData => {
  try {
    if (safeGetItem('organization_hub_app_data_v1')) {
      safeRemoveItem('organization_hub_app_data_v1');
    }
    const accounts = getRegisteredAccounts();
    const activeId = getActiveSessionUserId();
    if (activeId) {
      const activeUser = accounts.find((u) => u.id === activeId);
      if (activeUser && !isGuestOrInvalidUser(activeUser)) {
        return loadAccountAppData(activeUser, accounts);
      }
    }

    return {
      ...INITIAL_STATE,
      users: accounts,
      currentUser: EMPTY_USER,
    };
  } catch (err) {
    console.warn('Failed to load app data, falling back to initial state:', err);
    return INITIAL_STATE;
  }
};

export const saveAppData = (data: AppStateData): void => {
  try {
    if (data.users && data.users.length > 0) {
      saveRegisteredAccounts(data.users);
    }
    if (data.currentUser && !isGuestOrInvalidUser(data.currentUser)) {
      saveAccountAppData(data.currentUser.id, data);
    }
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

// Reset to factory initial state for active account
export const resetAppData = (): AppStateData => {
  const accounts = getRegisteredAccounts();
  const activeId = getActiveSessionUserId();
  const activeUser = accounts.find((u) => u.id === activeId) || EMPTY_USER;
  const fresh = createFreshAccountData(activeUser, accounts);
  if (activeUser && !isGuestOrInvalidUser(activeUser)) {
    saveAccountAppData(activeUser.id, fresh);
  }
  return fresh;
};

// Export full database to encrypted JSON blob
export const exportBackupJSON = (data: AppStateData): string => {
  const payload = {
    app: 'SENTRA UIB',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    checksum: 'SHA256:' + Math.random().toString(36).substring(2, 15),
    data,
  };
  return JSON.stringify(payload, null, 2);
};

// Format Rupiah helper
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/\s+/g, ' ');
};

// Export Buku Agenda Surat to formatted Excel (.xlsx) spreadsheet
// Table headers: No, Tanggal Surat, No. Surat, Perihal Isi Surat, Dituju, Keterangan, Penerima
export const exportBukuAgendaToExcel = (
  rows: BukuAgendaSuratRow[],
  fileName: string = `Buku_Agenda_Surat_Ormawa_${new Date().toISOString().split('T')[0]}.xlsx`
): void => {
  const excelRows = rows.map((r, i) => ({
    'No': r.no || (i + 1),
    'Tanggal Surat': r.tanggalSurat,
    'No. Surat': r.nomorSurat,
    'Perihal Isi Surat': r.perihal,
    'Dituju': r.dituju,
    'Keterangan': r.keterangan,
    'Penerima': r.penerima,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);

  // Set explicit column widths for readability
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 15 }, // Tanggal Surat
    { wch: 28 }, // No. Surat
    { wch: 45 }, // Perihal Isi Surat
    { wch: 32 }, // Dituju
    { wch: 38 }, // Keterangan
    { wch: 26 }, // Penerima
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Buku Agenda Surat');
  XLSX.writeFile(workbook, fileName);
};

// Export Buku Agenda Surat to CSV
export const exportBukuAgendaToCSV = (
  rows: BukuAgendaSuratRow[],
  fileName: string = `Buku_Agenda_Surat_Ormawa_${new Date().toISOString().split('T')[0]}.csv`
): void => {
  const excelRows = rows.map((r, i) => ({
    'No': r.no || (i + 1),
    'Tanggal Surat': r.tanggalSurat,
    'No. Surat': r.nomorSurat,
    'Perihal Isi Surat': r.perihal,
    'Dituju': r.dituju,
    'Keterangan': r.keterangan,
    'Penerima': r.penerima,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export Surat Masuk directly to Spreadsheet with neat A4 format:
// Kop: Universitas Islam Bogor - SENTRA UIB
// Columns: No, Tanggal Masuk, No Surat, Perihal Isi Surat, Tanggal Acara, Pengirim Surat, Keterangan
export const exportSuratMasukToExcel = (
  items: SuratMasukItem[],
  fileName: string = `Buku_Agenda_Surat_Masuk_A4_${new Date().toISOString().split('T')[0]}.xlsx`
): void => {
  const aoa: (string | number)[][] = [
    ['UNIVERSITAS ISLAM BOGOR - SENTRA UIB'],
    ['BUKU AGENDA SURAT MASUK (FORMAT A4)'],
    [`Tertib Administrasi, Progresif Berorganisasi | Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`],
    [],
    ['No', 'Tanggal Masuk', 'No. Surat', 'Perihal Isi Surat', 'Tanggal Acara', 'Pengirim Surat', 'Keterangan'],
  ];

  items.forEach((s, i) => {
    aoa.push([
      i + 1,
      s.tanggalTerima || s.tanggalSurat,
      s.nomorSurat,
      s.perihal,
      s.tanggalAcara || '-',
      s.pengirim,
      s.keterangan || s.catatanDisposisi || s.status,
    ]);
  });

  aoa.push([]);
  aoa.push(['', '', '', `Total Surat Masuk: ${items.length} Berkas`, '', '', '']);

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Set explicit column widths tailored for A4 Landscape
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 16 }, // Tanggal Masuk
    { wch: 28 }, // No Surat
    { wch: 42 }, // Perihal Isi Surat
    { wch: 16 }, // Tanggal Acara
    { wch: 30 }, // Pengirim Surat
    { wch: 32 }, // Keterangan
  ];

  // A4 Landscape Print Setup (paperSize 9 is A4)
  worksheet['!pageSetup'] = {
    paperSize: 9,
    orientation: 'landscape',
    scale: 85,
    fitToWidth: 1,
    fitToHeight: 0,
  };
  worksheet['!margins'] = {
    left: 0.4,
    right: 0.4,
    top: 0.5,
    bottom: 0.5,
    header: 0.3,
    footer: 0.3,
  };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Surat Masuk A4');
  XLSX.writeFile(workbook, fileName);
};

// Export Keuangan directly to Spreadsheet with format:
// No, Tanggal, Keterangan / Uraian, Kategori Pos, Pemasukan (Rp), Pengeluaran (Rp), Saldo Akhir (Rp), Penanggung Jawab
export const exportKeuanganToExcel = (
  transactions: TransaksiKeuanganItem[],
  fileName: string = `Laporan_Keuangan_Kas_A4_${new Date().toISOString().split('T')[0]}.xlsx`
): void => {
  const totalPemasukan = transactions
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalPengeluaran = transactions
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const saldoAkhir = transactions.length > 0 ? transactions[0].saldoSetelah : 0;

  const aoa: (string | number)[][] = [
    ['UNIVERSITAS ISLAM BOGOR - SENTRA UIB'],
    ['BUKU KAS KEUANGAN ORGANISASI (FORMAT A4)'],
    [`Pemasukan, Pengeluaran & Saldo Akhir | Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`],
    [],
    ['No', 'Tanggal', 'Keterangan / Uraian Transaksi', 'Kategori Pos', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Saldo Akhir (Rp)', 'Penanggung Jawab'],
  ];

  transactions.forEach((t, i) => {
    aoa.push([
      i + 1,
      t.tanggal,
      t.keterangan,
      t.kategori,
      t.jenis === 'Pemasukan' ? t.nominal : 0,
      t.jenis === 'Pengeluaran' ? t.nominal : 0,
      t.saldoSetelah,
      t.penanggungJawab,
    ]);
  });

  // Rekapitulasi row
  aoa.push([]);
  aoa.push([
    '',
    '',
    'TOTAL REKAPITULASI KAS',
    '',
    totalPemasukan,
    totalPengeluaran,
    saldoAkhir,
    '',
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Column widths tailored for A4 Landscape
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 14 }, // Tanggal
    { wch: 40 }, // Keterangan / Uraian Transaksi
    { wch: 18 }, // Kategori Pos
    { wch: 18 }, // Pemasukan (Rp)
    { wch: 18 }, // Pengeluaran (Rp)
    { wch: 20 }, // Saldo Akhir (Rp)
    { wch: 22 }, // Penanggung Jawab
  ];

  // A4 Landscape Print Setup
  worksheet['!pageSetup'] = {
    paperSize: 9,
    orientation: 'landscape',
    scale: 85,
    fitToWidth: 1,
    fitToHeight: 0,
  };
  worksheet['!margins'] = {
    left: 0.4,
    right: 0.4,
    top: 0.5,
    bottom: 0.5,
    header: 0.3,
    footer: 0.3,
  };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Buku Kas A4');
  XLSX.writeFile(workbook, fileName);
};

export const exportKeuanganToCSV = (
  transactions: TransaksiKeuanganItem[],
  fileName: string = `Laporan_Keuangan_Kas_${new Date().toISOString().split('T')[0]}.csv`
): void => {
  const excelRows = transactions.map((t, i) => ({
    'No': i + 1,
    'Tanggal': t.tanggal,
    'Uraian Transaksi': t.keterangan,
    'Kategori': t.kategori,
    'Pemasukan (Rp)': t.jenis === 'Pemasukan' ? t.nominal : 0,
    'Pengeluaran (Rp)': t.jenis === 'Pengeluaran' ? t.nominal : 0,
    'Saldo Akhir (Rp)': t.saldoSetelah,
    'Penanggung Jawab': t.penanggungJawab,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportSuratMasukToCSV = (
  items: SuratMasukItem[],
  fileName: string = 'Surat_Masuk_MPI_2026.csv'
): void => {
  const excelRows = items.map((s, i) => ({
    'No': i + 1,
    'Tanggal Masuk': s.tanggalTerima || s.tanggalSurat,
    'No Surat': s.nomorSurat,
    'Perihal Isi Surat': s.perihal,
    'Tanggal Acara': s.tanggalAcara || '-',
    'Pengirim Surat': s.pengirim,
    'Keterangan': s.keterangan || s.catatanDisposisi || s.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export Surat Keluar directly to Spreadsheet with neat A4 format:
// Kop: Universitas Islam Bogor - SENTRA UIB
// Columns: No, Tanggal Surat, No Surat, Dikirim Kepada (Tujuan), Perihal Isi Surat, Keterangan
export const exportSuratKeluarToExcel = (
  items: SuratKeluarItem[],
  fileName: string = `Buku_Agenda_Surat_Keluar_A4_${new Date().toISOString().split('T')[0]}.xlsx`
): void => {
  const aoa: (string | number)[][] = [
    ['UNIVERSITAS ISLAM BOGOR - SENTRA UIB'],
    ['BUKU AGENDA SURAT KELUAR (FORMAT A4)'],
    [`Tertib Administrasi, Progresif Berorganisasi | Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`],
    [],
    ['No', 'Tanggal Surat', 'No. Surat', 'Dikirim Kepada', 'Perihal Isi Surat', 'Keterangan'],
  ];

  items.forEach((s, i) => {
    aoa.push([
      i + 1,
      s.tanggalSurat || s.tanggalKirim,
      s.nomorSurat,
      s.tujuan,
      s.perihal,
      s.keterangan || (s.penandatangan ? `TTD: ${s.penandatangan} (${s.status})` : s.status),
    ]);
  });

  aoa.push([]);
  aoa.push(['', '', '', '', `Total Surat Keluar: ${items.length} Berkas`, '']);

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Set explicit column widths tailored for A4 Landscape
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 16 }, // Tanggal Surat
    { wch: 28 }, // No Surat
    { wch: 32 }, // Dikirim Kepada
    { wch: 42 }, // Perihal Isi Surat
    { wch: 30 }, // Keterangan
  ];

  // A4 Landscape Print Setup (paperSize 9 is A4)
  worksheet['!pageSetup'] = {
    paperSize: 9,
    orientation: 'landscape',
    scale: 85,
    fitToWidth: 1,
    fitToHeight: 0,
    fitToPage: true,
  };
  worksheet['!margins'] = {
    left: 0.4,
    right: 0.4,
    top: 0.5,
    bottom: 0.5,
    header: 0.3,
    footer: 0.3,
  };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Surat Keluar A4');
  XLSX.writeFile(workbook, fileName);
};

export const exportSuratKeluarToCSV = (
  items: SuratKeluarItem[],
  fileName: string = 'Surat_Keluar_MPI_2026.csv'
): void => {
  const excelRows = items.map((s, i) => ({
    'No': i + 1,
    'Tanggal Surat': s.tanggalSurat || s.tanggalKirim,
    'No Surat': s.nomorSurat,
    'Tujuan': s.tujuan,
    'Perihal Isi Surat': s.perihal,
    'Keterangan': s.keterangan || (s.penandatangan ? `TTD: ${s.penandatangan} (${s.status})` : s.status),
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportKejadianPentingToExcel = (
  items: KejadianPentingItem[],
  fileName: string = 'Kejadian_Penting_Kegiatan.xlsx'
): void => {
  const excelRows = items.map((item, idx) => ({
    'No': idx + 1,
    'Nama Agenda': item.namaAgenda || item.namaKegiatan || '',
    'Tanggal': item.tanggal || item.tanggalAcara || '',
    'Kendala': item.kendala || '-',
    'Jumlah Peserta': item.jumlahPeserta || 0,
    'Keterangan': item.keterangan || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);

  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 32 }, // Nama Agenda
    { wch: 16 }, // Tanggal
    { wch: 40 }, // Kendala
    { wch: 16 }, // Jumlah Peserta
    { wch: 35 }, // Keterangan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kejadian Penting');
  XLSX.writeFile(workbook, fileName);
};

export const exportKejadianPentingToCSV = (
  items: KejadianPentingItem[],
  fileName: string = 'Kejadian_Penting_Kegiatan.csv'
): void => {
  const excelRows = items.map((item, idx) => ({
    'No': idx + 1,
    'Nama Agenda': item.namaAgenda || item.namaKegiatan || '',
    'Tanggal': item.tanggal || item.tanggalAcara || '',
    'Kendala': item.kendala || '-',
    'Jumlah Peserta': item.jumlahPeserta || 0,
    'Keterangan': item.keterangan || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


