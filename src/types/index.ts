export type UserRole = 'superadmin' | 'ketua' | 'sekretaris' | 'bendahara' | 'divisi' | 'anggota';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  nim: string;
  division: string;
  phone?: string;
  lastActive?: string;
}

export type LetterStatus = 'Diterima' | 'Didisposisi' | 'Ditindaklanjuti' | 'Diarsipkan';

export interface BukuAgendaSuratRow {
  id: string;
  no: number;
  tanggalSurat: string;
  nomorSurat: string;
  perihal: string;
  dituju: string;
  keterangan: string;
  penerima: string;
  jenisSurat: 'Masuk' | 'Keluar';
}

export interface SuratMasukItem {
  id: string;
  nomorSurat: string;
  pengirim: string;
  perihal: string;
  tanggalSurat: string;
  tanggalTerima: string; // Tanggal Masuk
  tanggalAcara?: string; // Tanggal Acara
  keterangan?: string; // Keterangan
  kategori: string;
  status: LetterStatus;
  disposisiKepada?: string;
  catatanDisposisi?: string;
  fileUrl?: string;
  fileName?: string;
  fileData?: string;
  fileType?: string;
  urgensi: 'Biasa' | 'Penting' | 'Segera';
  penerima?: string;
}

export interface SuratKeluarItem {
  id: string;
  nomorSurat: string;
  tujuan: string; // Dikirim Kepada
  perihal: string; // Perihal Isi Surat
  tanggalKirim: string; // Tanggal Surat / Tanggal Kirim
  tanggalSurat?: string;
  keterangan?: string; // Keterangan
  kategori: string;
  penandatangan?: string;
  status: 'Draft' | 'Menunggu TTD' | 'Terkirim' | 'Ditolak';
  fileUrl?: string;
  fileName?: string;
}

export interface DokumenOrganisasiItem {
  id: string;
  judul: string;
  tanggalUpload: string;
  kategori?: string;
  nomorSK?: string;
  tahun?: string;
  diuploadOleh?: string;
  ukuranFile?: string;
  fileUrl?: string;
  fileName?: string;
  fileData?: string; // Data URL for direct download and preview
  fileType?: string; // MIME type or extension for rendering
  textContent?: string; // Text content if text/markdown/csv
  versi?: string;
  deskripsi?: string;
}

export interface ProposalLpjItem {
  id: string;
  judul: string;
  jenis: 'Proposal' | 'LPJ';
  tanggalDiajukan: string;
  divisi?: string;
  anggaranDiajukan: number;
  anggaranDisetujui: number;
  status: 'Draft' | 'Review Sekretaris' | 'Review Bendahara' | 'Disetujui Ketua' | 'Revisi' | 'Selesai';
  penanggungJawab: string;
  catatan?: string;
  fileUrl?: string;
  fileName?: string;
  fileData?: string;
  fileType?: string;
  textContent?: string;
  ukuranFile?: string;
}

export interface TransaksiKeuanganItem {
  id: string;
  tanggal: string;
  keterangan: string;
  jenis: 'Pemasukan' | 'Pengeluaran';
  kategori: string;
  nominal: number;
  saldoSetelah: number;
  penanggungJawab: string;
  buktiUrl?: string;
  buktiName?: string;
  statusVerifikasi: 'Terverifikasi' | 'Menunggu' | 'Ditolak';
}

export interface AgendaItem {
  id: string;
  judul: string;
  tanggal: string; // e.g. "2026-10-12"
  waktuMulai: string; // "08.00"
  waktuSelesai: string; // "10.00"
  lokasi: string;
  tipe: string;
  deskripsi: string;
  penanggungJawab: string;
  peserta: string;
  status: 'Akan Datang' | 'Berjalan' | 'Selesai' | 'Dibatalkan';
}

export interface KejadianPentingItem {
  id: string;
  no?: number;
  namaAgenda: string;
  namaKegiatan?: string;
  tanggal: string;
  tanggalAcara?: string;
  kendala: string;
  jumlahPeserta: number | string;
  keterangan: string;
  createdAt?: number;
}

export interface AktivitasLogItem {
  id: string;
  userId?: string;
  userName: string;
  userRole?: string;
  tipe: 'Surat Masuk' | 'Surat Keluar' | 'Proposal Kegiatan' | 'Transaksi Keuangan' | 'Agenda Baru' | 'Dokumen' | 'Sistem' | 'Keamanan' | 'Kegiatan' | 'Kejadian Penting';
  judul: string;
  detail: string;
  waktu: string;
  timestamp: number;
  ipAddress?: string;
  level: 'info' | 'success' | 'warning' | 'danger';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'mail' | 'finance' | 'agenda' | 'proposal' | 'security' | 'system';
  linkTo?: string;
}

export interface CloudBackupInfo {
  lastBackupTime: string | null;
  backupSize: string;
  autoBackupEnabled: boolean;
  backupFrequency: 'realtime' | 'daily' | 'weekly';
  cloudProvider: 'Google Cloud' | 'AWS S3' | 'Custom Server';
  encrypted: boolean;
}

export interface ThirdPartyIntegrationConfig {
  googleDriveEnabled: boolean;
  googleDriveFolderId: string;
  googleDriveUrl?: string;
  googleSheetsUrl?: string;
  googleSheetsEnabled?: boolean;
  telegramBotEnabled: boolean;
  telegramChatId: string;
  webhookEnabled: boolean;
  webhookUrl: string;
  emailSmtpEnabled: boolean;
  notificationEmail: string;
}

export interface ThemeSettings {
  mode: 'light' | 'dark';
  accentColor: 'blue' | 'indigo' | 'emerald' | 'violet' | 'amber';
  compactDensity: boolean;
}
