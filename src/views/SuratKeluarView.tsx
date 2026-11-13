import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Trash2,
  Eye,
  X,
  Download,
  FileText,
  AlertTriangle,
  Printer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SuratKeluarItem } from '../types';
import { exportSuratKeluarToExcel, exportSuratKeluarToCSV } from '../services/storage';
import { PrintA4SuratKeluarModal } from '../components/modals/PrintA4SuratKeluarModal';

export const SuratKeluarView: React.FC = () => {
  const {
    state,
    setActiveModal,
    updateSuratKeluar,
    deleteSuratKeluar,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<SuratKeluarItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<SuratKeluarItem | null>(null);
  const [isPrintA4Open, setIsPrintA4Open] = useState(false);

  const filteredLetters = state.suratKeluar.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.nomorSurat.toLowerCase().includes(q) ||
      item.tujuan.toLowerCase().includes(q) ||
      item.perihal.toLowerCase().includes(q) ||
      (item.keterangan || '').toLowerCase().includes(q) ||
      (item.tanggalSurat || item.tanggalKirim || '').includes(q)
    );
  });

  const handleDownloadExcel = () => {
    if (state.suratKeluar.length === 0) {
      showToast('Spreadsheet Kosong', 'Belum ada data surat keluar untuk diunduh.', 'warning');
      return;
    }
    const filename = `Buku_Agenda_Surat_Keluar_A4_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportSuratKeluarToExcel(state.suratKeluar, filename);
    showToast('Download Berhasil', `Spreadsheet ${filename} berhasil diunduh dalam format A4 siap cetak.`, 'success');
  };

  const handleDownloadCSV = () => {
    if (state.suratKeluar.length === 0) {
      showToast('Spreadsheet Kosong', 'Belum ada data surat keluar untuk diunduh.', 'warning');
      return;
    }
    const filename = `Surat_Keluar_${new Date().toISOString().split('T')[0]}.csv`;
    exportSuratKeluarToCSV(state.suratKeluar, filename);
    showToast('Download Berhasil', `File CSV ${filename} berhasil diunduh.`, 'success');
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteSuratKeluar(itemToDelete.id);
    showToast('Surat Berhasil Dihapus', `Surat ${itemToDelete.nomorSurat} telah dihapus dari spreadsheet.`, 'info');
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner with Spreadsheet Details & Download Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600/10 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
              <FileSpreadsheet className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Buku Agenda Surat Keluar
            </h2>
            <span className="text-[10.5px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
              {state.suratKeluar.length} Baris Data
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Data surat keluar yang diinput otomatis masuk ke buku agenda spreadsheet dan dapat langsung diunduh dengan format rapi A4:
            <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1">
              No, Tanggal Surat, No Surat, Dikirim Kepada (Tujuan), Perihal Isi Surat, Keterangan.
            </span>
          </p>
        </div>

        {/* Action Buttons: Download and Add */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Download Excel (.xlsx) Format A4 */}
          <button
            onClick={handleDownloadExcel}
            title="Unduh seluruh data surat keluar ke Excel (.xlsx) dengan tata letak A4"
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel A4 (.xlsx)</span>
          </button>

          {/* Cetak / Unduh Format A4 */}
          <button
            onClick={() => setIsPrintA4Open(true)}
            title="Lihat format dokumen A4 rapi siap cetak & simpan PDF"
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh Format A4</span>
          </button>

          {/* Download CSV */}
          <button
            onClick={handleDownloadCSV}
            title="Unduh data dalam format CSV"
            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh .CSV</span>
          </button>

          {/* Input Surat Keluar */}
          <button
            onClick={() => setActiveModal('input-surat-keluar')}
            className="px-4 py-2.5 rounded-xl bg-[#0a1738] hover:bg-[#122452] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-slate-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Surat Keluar</span>
          </button>
        </div>
      </div>

      {/* Search Bar Only (Filter pills removed as requested) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nomor surat, tujuan, perihal, atau keterangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Spreadsheet Table: 6 Exact Columns Requested */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-blue-50/60 dark:bg-slate-850 border-b border-blue-100 dark:border-slate-800 text-blue-950 dark:text-blue-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 w-12 text-center border-r border-blue-100/50 dark:border-slate-800">
                  No
                </th>
                <th className="py-3 px-4 whitespace-nowrap border-r border-blue-100/50 dark:border-slate-800">
                  Tanggal Surat
                </th>
                <th className="py-3 px-4 whitespace-nowrap border-r border-blue-100/50 dark:border-slate-800">
                  No Surat
                </th>
                <th className="py-3 px-4 border-r border-blue-100/50 dark:border-slate-800">
                  Dikirim Kepada / Tujuan
                </th>
                <th className="py-3 px-4 border-r border-blue-100/50 dark:border-slate-800">
                  Perihal Isi Surat
                </th>
                <th className="py-3 px-4 border-r border-blue-100/50 dark:border-slate-800">
                  Keterangan
                </th>
                <th className="py-3 px-4 whitespace-nowrap">
                  Status
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-3 border border-blue-100 dark:border-blue-800">
                        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {state.suratKeluar.length === 0
                          ? 'Spreadsheet Surat Keluar Masih Kosong'
                          : 'Tidak Ada Surat Keluar yang Sesuai'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 mb-4 text-center">
                        {state.suratKeluar.length === 0
                          ? 'Mulai input data surat keluar baru untuk otomatis dicatat ke spreadsheet.'
                          : 'Tidak ada surat keluar yang cocok dengan pencarian Anda.'}
                      </p>
                      {state.suratKeluar.length === 0 && (
                        <button
                          onClick={() => setActiveModal('input-surat-keluar')}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Buat Surat Keluar Pertama
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLetters.map((letter, index) => (
                  <tr
                    key={letter.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* 1. No */}
                    <td className="py-3 px-3.5 text-center font-bold text-slate-400 border-r border-slate-100 dark:border-slate-800">
                      {index + 1}
                    </td>

                    {/* 2. Tanggal Surat */}
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                      {letter.tanggalSurat || letter.tanggalKirim}
                    </td>

                    {/* 3. No Surat */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-blue-600 dark:text-blue-400 border-r border-slate-100 dark:border-slate-800">
                      {letter.nomorSurat}
                    </td>

                    {/* 4. Dikirim Kepada (Tujuan) */}
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap border-r border-slate-100 dark:border-slate-800">
                      {letter.tujuan}
                    </td>

                    {/* 5. Perihal Isi Surat */}
                    <td className="py-3 px-4 max-w-xs border-r border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {letter.perihal}
                      </p>
                      {letter.kategori && (
                        <span className="text-[10px] text-slate-400 mt-0.5 inline-block">
                          Kategori: {letter.kategori}
                        </span>
                      )}
                    </td>

                    {/* 6. Keterangan */}
                    <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                      <p className="line-clamp-2">
                        {letter.keterangan || '-'}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={letter.status}
                        onChange={(e) =>
                          updateSuratKeluar(letter.id, { status: e.target.value as any })
                        }
                        className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border-0 cursor-pointer ${
                          letter.status === 'Terkirim'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : letter.status === 'Menunggu TTD'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                        }`}
                      >
                        <option value="Terkirim">Terkirim</option>
                        <option value="Menunggu TTD">Menunggu TTD</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedLetter(letter)}
                          title="Lihat Detail Surat"
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(letter)}
                          title="Hapus Baris Surat Keluar"
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom summary bar */}
        {filteredLetters.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              Menampilkan {filteredLetters.length} dari {state.suratKeluar.length} baris spreadsheet surat keluar
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadExcel}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Spreadsheet (.xlsx)
              </button>
              <span>•</span>
              <button
                onClick={handleDownloadCSV}
                className="text-slate-600 dark:text-slate-300 hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> Unduh CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail Surat Keluar */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-[#0a1738] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-blue-300 uppercase tracking-widest">
                  Baris Spreadsheet Surat Keluar
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedLetter.nomorSurat}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLetter(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Dikirim Kepada / Tujuan</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {selectedLetter.tujuan}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Klasifikasi Kategori</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedLetter.kategori}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Perihal Isi Surat</span>
                <p className="font-medium text-slate-900 dark:text-white mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                  {selectedLetter.perihal}
                </p>
              </div>

              <div className="py-2 border-y border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Surat</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedLetter.tanggalSurat || selectedLetter.tanggalKirim}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Keterangan</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                  {selectedLetter.keterangan || '-'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLetter(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 font-semibold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal (Reliable, no window.confirm) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 border border-red-200 dark:border-red-900/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hapus Surat Keluar?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus data baris surat berikut dari spreadsheet?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1 font-mono">
                <div className="font-bold text-blue-600 dark:text-blue-400">{itemToDelete.nomorSurat}</div>
                <div className="text-slate-700 dark:text-slate-300 truncate font-sans font-medium">{itemToDelete.perihal}</div>
                <div className="text-slate-500 text-[11px] font-sans">Tujuan: {itemToDelete.tujuan}</div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 font-medium text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak Format A4 Surat Keluar */}
      <PrintA4SuratKeluarModal
        isOpen={isPrintA4Open}
        onClose={() => setIsPrintA4Open(false)}
        items={filteredLetters.length > 0 ? filteredLetters : state.suratKeluar}
      />
    </div>
  );
};
