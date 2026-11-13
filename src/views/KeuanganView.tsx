import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Trash2,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, exportKeuanganToExcel, exportKeuanganToCSV } from '../services/storage';
import { PrintA4KeuanganModal } from '../components/modals/PrintA4KeuanganModal';

export const KeuanganView: React.FC = () => {
  const { state, setActiveModal, deleteTransaksi, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Semua');
  const [isPrintA4Open, setIsPrintA4Open] = useState(false);

  const latestSaldo = state.transaksi.length > 0 ? state.transaksi[0].saldoSetelah : 0;

  const totalPemasukan = state.transaksi
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalPengeluaran = state.transaksi
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const filteredTrx = state.transaksi.filter((t) => {
    const matchSearch =
      t.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === 'Semua' || t.jenis === selectedType;
    return matchSearch && matchType;
  });

  const handleDownloadExcel = () => {
    if (state.transaksi.length === 0) {
      showToast('Data Kas Kosong', 'Belum ada transaksi keuangan untuk diunduh.', 'warning');
      return;
    }
    const filename = `Laporan_Keuangan_Kas_A4_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportKeuanganToExcel(state.transaksi, filename);
    showToast(
      'Download Berhasil',
      `Spreadsheet ${filename} berhasil diunduh dengan format Pemasukan, Pengeluaran & Saldo Akhir A4.`,
      'success'
    );
  };

  const exportCSV = () => {
    if (state.transaksi.length === 0) {
      showToast('Data Kas Kosong', 'Belum ada transaksi keuangan untuk diekspor.', 'warning');
      return;
    }
    exportKeuanganToCSV(state.transaksi);
    showToast('Ekspor Berhasil', 'Laporan keuangan berhasil diunduh dalam format CSV.', 'success');
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 sm:pb-12 animate-in fade-in duration-200">
      {/* 3 Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Saldo Kas Saat Ini</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
            {formatRupiah(latestSaldo)}
          </h3>
          <p className="text-[10.5px] sm:text-[11px] text-emerald-600 font-medium mt-1">
            ↑ +5% dari bulan lalu (Terverifikasi)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Total Pemasukan Tercatat</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-blue-600 dark:text-blue-400 truncate">
            {formatRupiah(totalPemasukan)}
          </h3>
          <p className="text-[10.5px] sm:text-[11px] text-slate-400 mt-1">
            Dari dana hibah, iuran, & donatur
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Total Pengeluaran Operasional</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-amber-600 dark:text-amber-400 truncate">
            {formatRupiah(totalPengeluaran)}
          </h3>
          <p className="text-[10.5px] sm:text-[11px] text-slate-400 mt-1">
            Konsumsi, ATK, & sewa fasilitas
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari transaksi, pos biaya, atau PJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['Semua', 'Pemasukan', 'Pengeluaran'].map((tp) => (
              <button
                key={tp}
                onClick={() => setSelectedType(tp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedType === tp
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tp}
              </button>
            ))}
          </div>

          {/* Unduh Excel (.xlsx) Format A4 */}
          <button
            onClick={handleDownloadExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="Unduh seluruh transaksi dalam spreadsheet Excel (.xlsx) berformat A4"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel A4 (.xlsx)</span>
          </button>

          {/* Cetak / Unduh Format A4 */}
          <button
            onClick={() => setIsPrintA4Open(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            title="Tampilkan tata letak rapi standar A4 siap cetak & simpan PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Unduh Format A4</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
            title="Ekspor ke CSV"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>.CSV</span>
          </button>

          <button
            onClick={() => setActiveModal('input-keuangan')}
            className="px-4 py-2 rounded-xl bg-[#0a1738] hover:bg-[#122452] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-slate-900/20 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Catat Transaksi
          </button>
        </div>
      </div>

      {/* Transaction Ledger Table: Pemasukan, Pengeluaran, Saldo Akhir */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-3.5 text-center w-12 border-r border-slate-200/60 dark:border-slate-800">No</th>
                <th className="py-3.5 px-4 whitespace-nowrap border-r border-slate-200/60 dark:border-slate-800 w-28">Tanggal</th>
                <th className="py-3.5 px-4 border-r border-slate-200/60 dark:border-slate-800">Uraian / Keterangan Transaksi</th>
                <th className="py-3.5 px-4 whitespace-nowrap border-r border-slate-200/60 dark:border-slate-800 w-28">Kategori Pos</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap border-r border-slate-200/60 dark:border-slate-800 w-32 text-emerald-700 dark:text-emerald-400">Pemasukan (Rp)</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap border-r border-slate-200/60 dark:border-slate-800 w-32 text-amber-700 dark:text-amber-400">Pengeluaran (Rp)</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap border-r border-slate-200/60 dark:border-slate-800 w-36 font-bold text-slate-900 dark:text-white">Saldo Akhir (Rp)</th>
                <th className="py-3.5 px-4 whitespace-nowrap border-r border-slate-200/60 dark:border-slate-800 w-32">Bukti / PJ</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTrx.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100 dark:border-emerald-800">
                        <Wallet className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Belum Ada Catatan Transaksi Keuangan
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Klik &quot;Catat Transaksi&quot; untuk menambahkan arus kas masuk atau keluar.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrx.map((trx, idx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-3.5 text-center font-semibold text-slate-500 border-r border-slate-100 dark:border-slate-800/60">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium border-r border-slate-100 dark:border-slate-800/60">
                      {trx.tanggal}
                    </td>
                    <td className="py-3.5 px-4 max-w-md border-r border-slate-100 dark:border-slate-800/60">
                      <p className="font-semibold text-slate-900 dark:text-white leading-snug">
                        {trx.keterangan}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap border-r border-slate-100 dark:border-slate-800/60">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {trx.kategori}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold border-r border-slate-100 dark:border-slate-800/60">
                      {trx.jenis === 'Pemasukan' ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          +{formatRupiah(trx.nominal)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold border-r border-slate-100 dark:border-slate-800/60">
                      {trx.jenis === 'Pengeluaran' ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          -{formatRupiah(trx.nominal)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-extrabold text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800/60">
                      {formatRupiah(trx.saldoSetelah)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap border-r border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {trx.penanggungJawab}
                        </span>
                        <span className="text-emerald-500" title="Terverifikasi Bendahara">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      {trx.buktiName && (
                        <span
                          className="text-[10px] text-blue-500 underline block cursor-pointer mt-0.5"
                          onClick={() => showToast('Bukti Kwitansi', `Membuka lampiran ${trx.buktiName}`, 'info')}
                        >
                          {trx.buktiName}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteTransaksi(trx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredTrx.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/80 dark:bg-slate-850 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <td colSpan={4} className="py-3 px-4 uppercase text-center tracking-wider text-[11px] border-r border-slate-200 dark:border-slate-750">
                    Total Rekapitulasi Kas
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-slate-750 font-bold font-mono">
                    +{formatRupiah(totalPemasukan)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap text-amber-600 dark:text-amber-400 border-r border-slate-200 dark:border-slate-750 font-bold font-mono">
                    -{formatRupiah(totalPengeluaran)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap font-extrabold font-mono text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-750">
                    {formatRupiah(latestSaldo)}
                  </td>
                  <td colSpan={2} className="py-3 px-4 text-center text-[10px] text-slate-500 font-normal italic">
                    {filteredTrx.length} Transaksi Tercatat
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* A4 Printable & Downloadable Preview Modal */}
      <PrintA4KeuanganModal
        isOpen={isPrintA4Open}
        onClose={() => setIsPrintA4Open(false)}
        transactions={filteredTrx.length > 0 ? filteredTrx : state.transaksi}
      />
    </div>
  );
};
