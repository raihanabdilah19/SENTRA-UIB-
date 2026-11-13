import React, { useState } from 'react';
import { Users, Shield, Activity, UserPlus, CheckCircle2, AlertTriangle, Info, Radio, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';

export const ManajemenPengurusView: React.FC = () => {
  const { state, switchUser, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'realtime' | 'users' | 'roles'>('realtime');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = state.aktivitas.filter((act) => {
    return (
      act.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.detail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'danger':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Kritis</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Perhatian</span>;
      case 'success':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Sukses</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Info</span>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 sm:pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Manajemen Pengurus & Dasbor Admin Real-Time
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Pantau aktivitas seluruh pengurus, riwayat perubahan data, kontrol hak akses (RBAC), dan status sesi aktif
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>Live Audit Feed Active</span>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setActiveTab('realtime')}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'realtime'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4 shrink-0" /> Log Aktivitas Pengguna Real-Time
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" /> Direktori Pengurus ({state.users.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'roles'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4 shrink-0" /> Matriks Hak Akses (RBAC)
        </button>
      </div>

      {/* Tab 1: Real-Time Activity Log */}
      {activeTab === 'realtime' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <input
              type="text"
              placeholder="Cari aktivitas berdasarkan nama, tindakan, atau kata kunci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
            <span className="text-xs text-slate-400 shrink-0">
              Menampilkan {filteredLogs.length} audit trail terakhir
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[11px]">
                    <th className="py-3.5 px-4">Waktu</th>
                    <th className="py-3.5 px-4">Pengguna & Peran</th>
                    <th className="py-3.5 px-4">Tipe Aksi</th>
                    <th className="py-3.5 px-4">Rincian Perubahan</th>
                    <th className="py-3.5 px-4">Alamat IP</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                        {log.waktu}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {log.userName}
                        </span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
                          {log.userRole || 'PENGURUS'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {log.tipe}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {log.judul}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {log.detail}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {log.ipAddress || '192.168.1.101'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {getLevelBadge(log.level)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Member Directory */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {state.users.map((user) => (
            <div
              key={user.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-xs transition-all ${
                state.currentUser.id === user.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200/90 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3.5 mb-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-blue-500 shadow-2xs"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {user.name}
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">
                    {user.role}
                  </p>
                  <span className="text-[11px] text-slate-400 block truncate">
                    NIM: {user.nim}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="truncate">Email: <strong className="text-slate-700 dark:text-slate-300">{user.email}</strong></p>
                <p className="truncate">Divisi: <strong className="text-slate-700 dark:text-slate-300">{user.division}</strong></p>
                <p className="truncate">Status: <span className="text-emerald-500 font-medium">{user.lastActive || 'Aktif'}</span></p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => switchUser(user.id)}
                  disabled={state.currentUser.id === user.id}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    state.currentUser.id === user.id
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 cursor-default'
                      : 'bg-slate-900 text-white dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600'
                  }`}
                >
                  {state.currentUser.id === user.id ? '✓ Akun Aktif Saat Ini' : 'Beralih ke Akun Ini'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: RBAC Permission Matrix */}
      {activeTab === 'roles' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4">
            Matriks Hak Akses Peran (Role-Based Access Control)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Fitur / Modul</th>
                  <th className="py-3 px-4">Super Admin / Ketua</th>
                  <th className="py-3 px-4">Sekretaris</th>
                  <th className="py-3 px-4">Bendahara</th>
                  <th className="py-3 px-4">Koordinator Divisi</th>
                  <th className="py-3 px-4">Anggota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {[
                  { feature: 'Dashboard & Statistik Utama', s: true, se: true, b: true, d: true, a: true },
                  { feature: 'Input & Disposisi Surat Masuk', s: true, se: true, b: false, d: false, a: false },
                  { feature: 'Penerbitan Surat Keluar Resmi', s: true, se: true, b: false, d: false, a: false },
                  { feature: 'Upload Dokumen AD/ART & SOP', s: true, se: true, b: false, d: false, a: false },
                  { feature: 'Pencatatan Keuangan Kas', s: true, se: false, b: true, d: false, a: false },
                  { feature: 'Pengajuan Proposal Kegiatan', s: true, se: true, b: true, d: true, a: false },
                  { feature: 'Validasi Persetujuan Anggaran', s: true, se: false, b: true, d: false, a: false },
                  { feature: 'Log Audit & Backup Cloud', s: true, se: false, b: false, d: false, a: false },
                ].map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{row.feature}</td>
                    <td className="py-3 px-4">{row.s ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : '—'}</td>
                    <td className="py-3 px-4">{row.se ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : '—'}</td>
                    <td className="py-3 px-4">{row.b ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : '—'}</td>
                    <td className="py-3 px-4">{row.d ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : '—'}</td>
                    <td className="py-3 px-4">{row.a ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
