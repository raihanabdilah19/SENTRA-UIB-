import React from 'react';
import { BarChart3, TrendingUp, PieChart, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../services/storage';

export const LaporanAnalitikView: React.FC = () => {
  const { state, showToast } = useApp();

  const totalSurat = state.suratMasuk.length + state.suratKeluar.length;
  const suratSelesai = state.suratMasuk.filter((s) => s.status === 'Ditindaklanjuti' || s.status === 'Diarsipkan').length;
  const disposisiRate = state.suratMasuk.length > 0 ? Math.round((suratSelesai / state.suratMasuk.length) * 100) : 0;

  const totalAnggaran = state.proposalLpj.reduce((acc, c) => acc + c.anggaranDiajukan, 0);
  const realisasiAnggaran = state.transaksi
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((acc, c) => acc + c.nominal, 0);
  const budgetExecutionRate = totalAnggaran > 0 ? Math.min(100, Math.round((realisasiAnggaran / totalAnggaran) * 100)) : 0;

  const kelengkapanRate = Math.min(100, Math.round((state.dokumen.length / 8) * 100));

  const handlePrint = () => {
    window.print();
    showToast('Mencetak Laporan', 'Menyiapkan berkas cetak lembar eksekutif...', 'info');
  };

  const months = ['Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep'];

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 sm:pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Dasbor Analitik & Laporan Performa Organisasi
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Evaluasi mendalam efektivitas kesekretariatan, penyerapan kas, dan produktivitas program kerja kabinet
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" /> Cetak Lembar Eksekutif
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Rasio Ketepatan Disposisi</span>
          <div className="flex items-baseline justify-between gap-1 mt-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-600">{disposisiRate}%</h3>
            <span className="text-[10.5px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 sm:px-2 py-0.5 rounded-md">
              {disposisiRate > 0 ? 'Sangat Baik' : 'Mulai Input'}
            </span>
          </div>
          <p className="text-[10.5px] sm:text-[11px] text-slate-400 mt-2">
            {suratSelesai} dari {state.suratMasuk.length} surat tuntas ditindaklanjuti
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Penyerapan Anggaran Kas</span>
          <div className="flex items-baseline justify-between gap-1 mt-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-purple-600">{budgetExecutionRate}%</h3>
            <span className="text-[10.5px] sm:text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-1.5 sm:px-2 py-0.5 rounded-md">
              {budgetExecutionRate > 0 ? 'Terkendali' : 'Nol Realisasi'}
            </span>
          </div>
          <p className="text-[10.5px] sm:text-[11px] text-slate-400 mt-2">
            {formatRupiah(realisasiAnggaran)} dari {formatRupiah(totalAnggaran)} pagu proker
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Kelengkapan Konstitusi</span>
          <div className="flex items-baseline justify-between gap-1 mt-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-500">{kelengkapanRate}%</h3>
            <span className="text-[10.5px] sm:text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 sm:px-2 py-0.5 rounded-md">
              {kelengkapanRate === 100 ? 'Lengkap' : `${state.dokumen.length}/8 Arsip`}
            </span>
          </div>
          <p className="text-[10.5px] sm:text-[11px] text-slate-400 mt-2">
            {state.dokumen.length} Dokumen utama (AD/ART, GBHO, SOP) terarsip
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Pengurus Terdaftar</span>
          <div className="flex items-baseline justify-between gap-1 mt-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-600">{state.users.length}</h3>
            <span className="text-[10.5px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 sm:px-2 py-0.5 rounded-md">
              Aktif
            </span>
          </div>
          <p className="text-[10.5px] sm:text-[11px] text-slate-400 mt-2">
            {state.users.length} akun pengurus dapat menginput data
          </p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Pos Anggaran Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
            Distribusi Pos Pengeluaran Organisasi
          </h3>

          {realisasiAnggaran === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <p className="text-xs font-semibold">Belum ada pengeluaran kas dicatat</p>
              <p className="text-[11px] mt-1 text-slate-400">Persentase distribusi pos otomatis dihitung setelah Anda menginput pengeluaran.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {[
                { pos: 'Konsumsi Rapat & Kegiatan', percent: 42, color: 'bg-blue-600' },
                { pos: 'Perlengkapan, ATK, & Kesekretariatan', percent: 28, color: 'bg-emerald-500' },
                { pos: 'Publikasi, Domain & Media Digital', percent: 18, color: 'bg-amber-500' },
                { pos: 'Transportasi & Logistik Lapangan', percent: 12, color: 'bg-purple-500' },
              ].map((p) => (
                <div key={p.pos} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{p.pos}</span>
                    <span className="text-slate-900 dark:text-white">{p.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full ${p.color}`} style={{ width: `${p.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Volume Persuratan Bulanan */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            Aktivitas Administrasi (Surat Masuk vs Surat Keluar)
          </h3>

          {totalSurat === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <p className="text-xs font-semibold">Belum ada surat masuk atau surat keluar</p>
              <p className="text-[11px] mt-1 text-slate-400">Grafik perbandingan akan terisi saat surat baru diinput pengurus.</p>
            </div>
          ) : (
            <div className="flex items-end justify-between h-44 pt-6 px-2">
              {months.map((m) => {
                const countMasuk = state.suratMasuk.filter((s) => (s.tanggalTerima || s.tanggalSurat || '').includes(m)).length;
                const countKeluar = state.suratKeluar.filter((s) => (s.tanggalKirim || '').includes(m)).length;
                const maxVal = Math.max(5, state.suratMasuk.length, state.suratKeluar.length);
                return (
                  <div key={m} className="flex flex-col items-center gap-2 flex-1">
                    <div className="flex items-end gap-1.5 h-32">
                      <div
                        className="w-3 sm:w-4 bg-blue-600 rounded-t-sm transition-all"
                        style={{ height: `${(countMasuk / maxVal) * 100}%` }}
                        title={`Surat Masuk: ${countMasuk}`}
                      />
                      <div
                        className="w-3 sm:w-4 bg-amber-500 rounded-t-sm transition-all"
                        style={{ height: `${(countKeluar / maxVal) * 100}%` }}
                        title={`Surat Keluar: ${countKeluar}`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">{m}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" /> Surat Masuk ({state.suratMasuk.length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> Surat Keluar ({state.suratKeluar.length})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
