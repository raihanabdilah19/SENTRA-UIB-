import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Download,
  FileCheck,
  Eye,
  X,
  Calendar,
  AlertTriangle,
  FileCode,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../services/storage';
import { ProposalLpjItem } from '../types';

export const ProposalLpjView: React.FC = () => {
  const { state, setActiveModal, updateProposalStatus, deleteProposalLpj, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Semua');
  const [previewItem, setPreviewItem] = useState<ProposalLpjItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ProposalLpjItem | null>(null);

  const filteredItems = state.proposalLpj.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      item.judul.toLowerCase().includes(q) ||
      item.penanggungJawab.toLowerCase().includes(q) ||
      (item.tanggalDiajukan || '').includes(q) ||
      (item.catatan || '').toLowerCase().includes(q) ||
      (item.fileName || '').toLowerCase().includes(q);
    const matchType = selectedType === 'Semua' || item.jenis === selectedType;
    return matchSearch && matchType;
  });

  const totalAnggaran = state.proposalLpj.reduce((acc, curr) => acc + curr.anggaranDiajukan, 0);
  const disetujuiAnggaran = state.proposalLpj
    .filter((p) => p.status === 'Disetujui Ketua' || p.status === 'Selesai')
    .reduce((acc, curr) => acc + curr.anggaranDisetujui, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disetujui Ketua':
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'Review Bendahara':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300';
      case 'Review Sekretaris':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300';
      case 'Revisi':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800';
    }
  };

  const handleDownloadFile = (item: ProposalLpjItem) => {
    const targetFileName = item.fileName || `${item.jenis}_${item.judul.trim().replace(/[\/\\]/g, '_')}.pdf`;

    if (item.fileData && item.fileData.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = item.fileData;
      link.download = targetFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Download Berhasil', `Berkas ${targetFileName} berhasil diunduh.`, 'success');
    } else {
      const content =
        item.textContent ||
        `===============================================================\nDOKUMEN RESMI ${item.jenis.toUpperCase()} KEGIATAN\n===============================================================\n\nNama Kegiatan     : ${item.judul}\nJenis Dokumen     : ${item.jenis}\nTanggal Pengajuan : ${item.tanggalDiajukan}\nAnggaran Diajukan : ${formatRupiah(item.anggaranDiajukan)}\nPenanggung Jawab  : ${item.penanggungJawab}\nStatus            : ${item.status}\n\nCatatan:\n${item.catatan || '-'}\n\nDokumen resmi yang tersimpan di sistem SENTRA UIB.`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const downloadName = targetFileName.endsWith('.pdf') ? targetFileName.replace('.pdf', '.txt') : targetFileName;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Download Berhasil', `Berkas ${downloadName} berhasil diunduh.`, 'success');
    }
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteProposalLpj(itemToDelete.id);
    showToast('Dokumen Dihapus', `${itemToDelete.jenis} "${itemToDelete.judul}" telah dihapus.`, 'info');
    setItemToDelete(null);
  };

  // Helper to render file content directly
  const renderItemContent = (item: ProposalLpjItem) => {
    const isImage =
      item.fileType?.startsWith('image/') ||
      item.fileData?.startsWith('data:image/') ||
      Boolean(item.fileName?.match(/\.(png|jpe?g|webp|gif|svg)$/i));

    const isPdf =
      item.fileType?.includes('pdf') ||
      item.fileData?.startsWith('data:application/pdf') ||
      Boolean(item.fileName?.toLowerCase().endsWith('.pdf'));

    if (isImage && item.fileData) {
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/5 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <img
            src={item.fileData}
            alt={item.judul}
            className="max-w-full max-h-[550px] object-contain rounded-xl shadow-md border border-white/20"
          />
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
            <span>Berkas Asli: {item.fileName}</span>
            <span>•</span>
            <span>{item.ukuranFile || 'Gambar'}</span>
          </div>
        </div>
      );
    }

    if (isPdf && item.fileData && item.fileData.startsWith('data:application/pdf')) {
      return (
        <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
          <iframe
            src={item.fileData}
            title={item.judul}
            className="w-full h-[540px] border-0 rounded-2xl bg-white"
          />
        </div>
      );
    }

    // Text content or decoded content
    let textToDisplay = item.textContent || '';

    if (!textToDisplay && item.fileData && item.fileData.startsWith('data:text/')) {
      try {
        const parts = item.fileData.split(',');
        if (parts[0].includes(';base64')) {
          textToDisplay = atob(parts[1]);
        } else {
          textToDisplay = decodeURIComponent(parts[1]);
        }
      } catch {
        textToDisplay = '';
      }
    }

    if (!textToDisplay) {
      textToDisplay = `===============================================================
DOKUMEN RESMI ${item.jenis.toUpperCase()} KEGIATAN ORGANISASI
===============================================================

Nama Kegiatan     : ${item.judul}
Jenis Dokumen     : ${item.jenis === 'Proposal' ? 'Proposal Pengajuan Program Kerja' : 'Laporan Pertanggungjawaban (LPJ)'}
Tanggal Pengajuan : ${item.tanggalDiajukan}
Anggaran Diajukan : ${formatRupiah(item.anggaranDiajukan)}
Anggaran Disetujui: ${formatRupiah(item.anggaranDisetujui)}
Penanggung Jawab  : ${item.penanggungJawab}
Nama Berkas       : ${item.fileName || `${item.jenis}_${item.judul}.pdf`}
Status Dokumen    : ${item.status}

---------------------------------------------------------------
RINCIAN & CATATAN:
${item.catatan || 'Dokumen pengajuan program kerja dan pertanggungjawaban kegiatan organisasi mahasiswa.'}

Catatan Administrasi:
- Berkas telah tercatat secara resmi dalam sistem SENTRA UIB.
- Rincian anggaran dan lampiran kegiatan telah terverifikasi.
- Berkas sah dan dapat diunduh kapan saja menggunakan tombol "Unduh".
===============================================================`;
    }

    return (
      <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-inner">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
          <span className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
            <FileCode className="w-4 h-4" /> Isi Berkas ({item.fileName || `${item.jenis}.txt`})
          </span>
          <span className="font-mono text-slate-400">{item.ukuranFile || 'Teks Asli'}</span>
        </div>
        <pre className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto pr-2 select-text selection:bg-purple-500 selection:text-white">
          {textToDisplay}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 sm:pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-600/10 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Monitoring Proposal Kegiatan & LPJ
            </h2>
            <span className="text-[10.5px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
              {state.proposalLpj.length} Berkas
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Total Anggaran Diajukan: <strong className="text-slate-800 dark:text-slate-200">{formatRupiah(totalAnggaran)}</strong> • Disetujui: <strong className="text-emerald-600">{formatRupiah(disetujuiAnggaran)}</strong>
          </p>
        </div>

        <button
          onClick={() => setActiveModal('input-proposal')}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Ajukan Proposal / LPJ
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder=""
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['Semua', 'Proposal', 'LPJ'].map((tp) => (
            <button
              key={tp}
              onClick={() => setSelectedType(tp)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedType === tp
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Proposal Cards List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mb-3 mx-auto border border-purple-100 dark:border-purple-800">
              <FileCheck className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {state.proposalLpj.length === 0 ? 'Belum Ada Proposal atau LPJ' : 'Tidak Ada Dokumen yang Sesuai'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
              {state.proposalLpj.length === 0
                ? 'Mulai ajukan proposal kegiatan baru atau unggah LPJ beserta filenya agar dapat dilihat dan diunduh.'
                : 'Tidak ada proposal atau LPJ yang cocok dengan pencarian Anda.'}
            </p>
            {state.proposalLpj.length === 0 && (
              <button
                onClick={() => setActiveModal('input-proposal')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Ajukan Proposal / LPJ Pertama
              </button>
            )}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.jenis === 'Proposal'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60'
                      }`}
                    >
                      {item.jenis}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" /> Tanggal: {item.tanggalDiajukan}
                    </span>
                    {item.fileName && (
                      <span className="text-[11px] font-mono text-slate-400">
                        • {item.fileName} {item.ukuranFile ? `(${item.ukuranFile})` : ''}
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => setPreviewItem(item)}
                    className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-purple-600 cursor-pointer transition-colors"
                    title="Klik untuk melihat isi berkas langsung"
                  >
                    {item.judul}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    PIC: <strong className="text-slate-700 dark:text-slate-300">{item.penanggungJawab}</strong>
                    {item.catatan ? ` • ${item.catatan}` : ''}
                  </p>
                </div>

                {/* Budget & Status Block */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0 justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Anggaran Diajukan
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      {formatRupiah(item.anggaranDiajukan)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>

                    {/* Workflow Approval Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <select
                        value={item.status}
                        onChange={(e) => updateProposalStatus(item.id, e.target.value as any)}
                        className="text-[11px] font-semibold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Review Sekretaris">Review Sekretaris</option>
                        <option value="Review Bendahara">Review Bendahara</option>
                        <option value="Disetujui Ketua">Disetujui Ketua</option>
                        <option value="Revisi">Revisi</option>
                        <option value="Selesai">Selesai</option>
                      </select>

                      {/* View content button */}
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-blue-200/60 dark:border-blue-900"
                        title="Lihat Isi Berkas Langsung"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Isi</span>
                      </button>

                      {/* Download button */}
                      <button
                        onClick={() => handleDownloadFile(item)}
                        className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 cursor-pointer transition-colors"
                        title="Unduh Berkas ke Komputer"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        title="Hapus Proposal/LPJ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Direct Content Viewer Modal for Proposal & LPJ */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0a1738] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                <div className="w-8 h-8 rounded-xl bg-purple-600/40 border border-purple-400/40 flex items-center justify-center text-purple-200 shrink-0">
                  <Eye className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base leading-tight truncate text-white">
                    {previewItem.judul}
                  </h3>
                  <p className="text-[11px] text-blue-200/80 truncate">
                    {previewItem.jenis} • Tanggal: {previewItem.tanggalDiajukan} • Anggaran: {formatRupiah(previewItem.anggaranDiajukan)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownloadFile(previewItem)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Unduh Berkas"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh</span>
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Direct File Content Rendering */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {renderItemContent(previewItem)}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Penanggung Jawab: <strong className="text-slate-700 dark:text-slate-300">{previewItem.penanggungJawab}</strong>
              </span>
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-800 font-semibold text-xs cursor-pointer transition-all"
              >
                Tutup Pratinjau
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
                Hapus {itemToDelete.jenis}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus {itemToDelete.jenis.toLowerCase()} berikut?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="font-bold text-purple-600 dark:text-purple-400">{itemToDelete.judul}</div>
                <div className="text-slate-500 text-[11px]">Tanggal: {itemToDelete.tanggalDiajukan} • Anggaran: {formatRupiah(itemToDelete.anggaranDiajukan)}</div>
                {itemToDelete.fileName && (
                  <div className="text-slate-400 text-[10.5px] font-mono truncate">{itemToDelete.fileName}</div>
                )}
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
