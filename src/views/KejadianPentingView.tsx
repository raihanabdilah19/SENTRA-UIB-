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
  Calendar,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KejadianPentingItem } from '../types';
import { exportKejadianPentingToExcel, exportKejadianPentingToCSV } from '../services/storage';

export const KejadianPentingView: React.FC = () => {
  const { state, setActiveModal, deleteKejadianPenting, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<KejadianPentingItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<KejadianPentingItem | null>(null);

  const items = state.kejadianPenting || [];

  const filteredItems = items.filter((item) => {
    const q = searchTerm.toLowerCase();
    const agendaName = (item.namaAgenda || item.namaKegiatan || '').toLowerCase();
    const kendalaText = (item.kendala || '').toLowerCase();
    const dateText = (item.tanggal || item.tanggalAcara || '').toLowerCase();
    const pesertaText = String(item.jumlahPeserta || '').toLowerCase();
    const ketText = (item.keterangan || '').toLowerCase();

    return (
      agendaName.includes(q) ||
      kendalaText.includes(q) ||
      dateText.includes(q) ||
      pesertaText.includes(q) ||
      ketText.includes(q)
    );
  });

  const handleDownloadExcel = () => {
    if (items.length === 0) {
      showToast('Spreadsheet Kosong', 'Belum ada data kejadian penting untuk diunduh.', 'warning');
      return;
    }
    const filename = `Kejadian_Penting_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportKejadianPentingToExcel(items, filename);
    showToast('Download Berhasil', `Spreadsheet ${filename} berhasil diunduh.`, 'success');
  };

  const handleDownloadCSV = () => {
    if (items.length === 0) {
      showToast('Spreadsheet Kosong', 'Belum ada data kejadian penting untuk diunduh.', 'warning');
      return;
    }
    const filename = `Kejadian_Penting_${new Date().toISOString().split('T')[0]}.csv`;
    exportKejadianPentingToCSV(items, filename);
    showToast('Download Berhasil', `File CSV ${filename} berhasil diunduh.`, 'success');
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteKejadianPenting(itemToDelete.id);
    showToast('Data Dihapus', `Agenda "${itemToDelete.namaAgenda || itemToDelete.namaKegiatan}" telah dihapus.`, 'info');
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Details & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shrink-0">
              <FileSpreadsheet className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Kejadian Penting
            </h2>
            <span className="text-[10.5px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
              {items.length} Agenda Terlaksana
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Format spreadsheet pencatatan kejadian penting:
            <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1">
              No, Nama Agenda, Tanggal, Kendala, Jumlah Peserta, Keterangan.
            </span>
          </p>
        </div>

        {/* Action Buttons: Download and Add */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownloadExcel}
            title="Unduh seluruh data kejadian penting ke Excel (.xlsx)"
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            title="Unduh data dalam format CSV"
            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh .CSV</span>
          </button>

          <button
            onClick={() => setActiveModal('input-kejadian-penting')}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Agenda Terlaksana</span>
          </button>
        </div>
      </div>

      {/* Search Bar (No placeholder examples) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder=""
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>
      </div>

      {/* Spreadsheet Table: 6 exact columns + Aksi */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-amber-50/70 dark:bg-slate-850 border-b border-amber-200/60 dark:border-slate-800 text-amber-950 dark:text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 w-12 text-center border-r border-amber-200/40 dark:border-slate-800">
                  No
                </th>
                <th className="py-3 px-4 border-r border-amber-200/40 dark:border-slate-800">
                  Nama Agenda
                </th>
                <th className="py-3 px-4 whitespace-nowrap border-r border-amber-200/40 dark:border-slate-800">
                  Tanggal
                </th>
                <th className="py-3 px-4 border-r border-amber-200/40 dark:border-slate-800">
                  Kendala
                </th>
                <th className="py-3 px-4 whitespace-nowrap border-r border-amber-200/40 dark:border-slate-800">
                  Jumlah Peserta
                </th>
                <th className="py-3 px-4 border-r border-amber-200/40 dark:border-slate-800">
                  Keterangan
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-3 border border-amber-100 dark:border-amber-800">
                        <FileSpreadsheet className="w-6 h-6 text-amber-600" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {items.length === 0 ? 'Belum Ada Kejadian Penting' : 'Tidak Ada Data yang Sesuai'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 mb-4 text-center">
                        {items.length === 0
                          ? 'Mulai input agenda terlaksana untuk dicatat ke spreadsheet kejadian penting.'
                          : 'Tidak ada data kejadian penting yang cocok dengan pencarian Anda.'}
                      </p>
                      {items.length === 0 && (
                        <button
                          onClick={() => setActiveModal('input-kejadian-penting')}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Input Agenda Pertama
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* 1. No */}
                    <td className="py-3.5 px-3.5 text-center font-bold text-slate-400 border-r border-slate-100 dark:border-slate-800">
                      {index + 1}
                    </td>

                    {/* 2. Nama Agenda */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800 max-w-xs">
                      <p className="line-clamp-2">{item.namaAgenda || item.namaKegiatan}</p>
                    </td>

                    {/* 3. Tanggal */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.tanggal || item.tanggalAcara}</span>
                      </div>
                    </td>

                    {/* 4. Kendala */}
                    <td className="py-3.5 px-4 max-w-xs text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                      <p className="line-clamp-2 leading-relaxed">{item.kendala || '-'}</p>
                    </td>

                    {/* 5. Jumlah Peserta */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-blue-600 dark:text-blue-400 border-r border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.jumlahPeserta}</span>
                      </div>
                    </td>

                    {/* 6. Keterangan */}
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                      <p className="line-clamp-2">{item.keterangan || '-'}</p>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedItem(item)}
                          title="Lihat Detail Kejadian Penting"
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          title="Hapus Baris Kejadian Penting"
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
        {filteredItems.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              Menampilkan {filteredItems.length} dari {items.length} baris kejadian penting
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

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-[#0a1738] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest">
                  Detail Kejadian Penting
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedItem.namaAgenda || selectedItem.namaKegiatan}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Acara</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {selectedItem.tanggal || selectedItem.tanggalAcara}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Jumlah Peserta</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {selectedItem.jumlahPeserta}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Nama Agenda</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                  {selectedItem.namaAgenda || selectedItem.namaKegiatan}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Kendala yang Dihadapi</span>
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 mt-1">
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.kendala || '-'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Keterangan</span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 mt-1">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedItem.keterangan || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 font-semibold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 border border-red-200 dark:border-red-900/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hapus Kejadian Penting?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus data kejadian penting berikut dari spreadsheet?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="font-bold text-amber-600 dark:text-amber-400">{itemToDelete.namaAgenda || itemToDelete.namaKegiatan}</div>
                <div className="text-slate-500 text-[11px]">Tanggal: {itemToDelete.tanggal || itemToDelete.tanggalAcara} • Peserta: {itemToDelete.jumlahPeserta}</div>
                <div className="text-slate-600 dark:text-slate-300 text-[11px] truncate">Kendala: {itemToDelete.kendala}</div>
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
    </div>
  );
};
