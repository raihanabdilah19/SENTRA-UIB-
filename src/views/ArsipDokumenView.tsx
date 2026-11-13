import React, { useState } from 'react';
import {
  FolderArchive,
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  Calendar,
  Eye,
  X,
  AlertTriangle,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DokumenOrganisasiItem } from '../types';

export const ArsipDokumenView: React.FC = () => {
  const { state, setActiveModal, deleteDokumen, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DokumenOrganisasiItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DokumenOrganisasiItem | null>(null);

  const filteredDocs = state.dokumen.filter((doc) => {
    const q = searchTerm.toLowerCase();
    return (
      doc.judul.toLowerCase().includes(q) ||
      (doc.tanggalUpload || '').includes(q) ||
      (doc.fileName || '').toLowerCase().includes(q) ||
      (doc.textContent || '').toLowerCase().includes(q)
    );
  });

  const handleDownloadDoc = (doc: DokumenOrganisasiItem) => {
    const targetFileName = doc.fileName || `${doc.judul.trim().replace(/[\/\\]/g, '_')}.pdf`;

    if (doc.fileData && doc.fileData.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = targetFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Download Berhasil', `Berkas ${targetFileName} berhasil diunduh.`, 'success');
    } else {
      const content =
        doc.textContent ||
        `========================================\nARSIP DOKUMEN RESMI ORGANISASI\n========================================\n\nJudul: ${doc.judul}\nTanggal Unggah: ${doc.tanggalUpload}\nDiupload Oleh: ${doc.diuploadOleh || 'Pengurus'}\n\nDokumen resmi yang tersimpan di sistem Arsip Organisasi.`;
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
    deleteDokumen(itemToDelete.id);
    showToast('Dokumen Dihapus', `Dokumen "${itemToDelete.judul}" telah dihapus dari arsip.`, 'info');
    setItemToDelete(null);
  };

  // Helper to render file content directly
  const renderDocumentContent = (doc: DokumenOrganisasiItem) => {
    const isImage =
      doc.fileType?.startsWith('image/') ||
      doc.fileData?.startsWith('data:image/') ||
      Boolean(doc.fileName?.match(/\.(png|jpe?g|webp|gif|svg)$/i));

    const isPdf =
      doc.fileType?.includes('pdf') ||
      doc.fileData?.startsWith('data:application/pdf') ||
      Boolean(doc.fileName?.toLowerCase().endsWith('.pdf'));

    // 1. Direct Image Rendering
    if (isImage && doc.fileData) {
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/5 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <img
            src={doc.fileData}
            alt={doc.judul}
            className="max-w-full max-h-[550px] object-contain rounded-xl shadow-md border border-white/20"
          />
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
            <span>Gambar Asli: {doc.fileName}</span>
            <span>•</span>
            <span>{doc.ukuranFile}</span>
          </div>
        </div>
      );
    }

    // 2. Direct PDF Rendering via Embedded Iframe
    if (isPdf && doc.fileData && doc.fileData.startsWith('data:application/pdf')) {
      return (
        <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
          <iframe
            src={doc.fileData}
            title={doc.judul}
            className="w-full h-[540px] border-0 rounded-2xl bg-white"
          />
        </div>
      );
    }

    // 3. Text / Markdown / Code / Document Text Rendering
    let textToDisplay = doc.textContent || '';

    // If no textContent, try to extract from text Data URL
    if (!textToDisplay && doc.fileData && doc.fileData.startsWith('data:text/')) {
      try {
        const parts = doc.fileData.split(',');
        if (parts[0].includes(';base64')) {
          textToDisplay = atob(parts[1]);
        } else {
          textToDisplay = decodeURIComponent(parts[1]);
        }
      } catch {
        textToDisplay = '';
      }
    }

    // Default formatted official document text if plain text is empty
    if (!textToDisplay) {
      textToDisplay = `===============================================================
ARSIP RESMI ORGANISASI MAHASISWA
===============================================================

Judul Dokumen  : ${doc.judul}
Tanggal Unggah : ${doc.tanggalUpload}
Nama Berkas    : ${doc.fileName || `${doc.judul.replace(/\s+/g, '_')}.pdf`}
Ukuran Berkas  : ${doc.ukuranFile || '1.0 MB'}
Status         : Terverifikasi dalam Arsip Organisasi

---------------------------------------------------------------
POKOK & DESKRIPSI DOKUMEN:
Dokumen "${doc.judul}" telah resmi terdaftar dan tersimpan di dalam
basis data repositori Arsip Organisasi pada tanggal ${doc.tanggalUpload}.

Petunjuk Kesekretariatan:
1. Berkas ini merupakan arsip resmi organisasi.
2. Seluruh pengurus dan anggota memiliki hak akses membaca.
3. Anda dapat mengunduh berkas lengkap kapan saja menggunakan tombol
   "Unduh Dokumen" di bawah ini.
===============================================================`;
    }

    return (
      <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-inner">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
          <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <FileCode className="w-4 h-4" /> Isi Dokumen ({doc.fileName || 'Dokumen Teks'})
          </span>
          <span className="font-mono text-slate-400">{doc.ukuranFile || 'Teks Asli'}</span>
        </div>
        <pre className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto pr-2 select-text selection:bg-amber-500 selection:text-white">
          {textToDisplay}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 sm:pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shrink-0">
              <FolderArchive className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Arsip Organisasi
            </h2>
            <span className="text-[10.5px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
              {state.dokumen.length} Dokumen
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Repositori berkas dan dokumen arsip resmi organisasi yang isinya dapat dilihat langsung dan diunduh
          </p>
        </div>

        <button
          onClick={() => setActiveModal('upload-dokumen')}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Unggah Dokumen Baru
        </button>
      </div>

      {/* Search Bar (No example placeholder as requested) */}
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

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-100 dark:border-amber-800">
            <FolderArchive className="w-6 h-6 text-amber-500" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {state.dokumen.length === 0 ? 'Arsip Organisasi Masih Kosong' : 'Tidak Ada Dokumen yang Sesuai'}
          </h4>
          <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
            {state.dokumen.length === 0
              ? 'Mulai unggah judul dokumen, tanggal unggah, dan filenya agar tersimpan dan dapat langsung dilihat isinya.'
              : 'Tidak ada dokumen arsip yang cocok dengan pencarian Anda.'}
          </p>
          {state.dokumen.length === 0 && (
            <button
              onClick={() => setActiveModal('upload-dokumen')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-md shadow-amber-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Unggah Dokumen Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    onClick={() => setPreviewDoc(doc)}
                    className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                    title="Klik untuk melihat isi dokumen langsung"
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  {doc.ukuranFile && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      {doc.ukuranFile}
                    </span>
                  )}
                </div>

                <h4
                  onClick={() => setPreviewDoc(doc)}
                  className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-amber-600 transition-colors cursor-pointer"
                  title="Klik untuk melihat isi dokumen langsung"
                >
                  {doc.judul}
                </h4>

                {doc.fileName && (
                  <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate mb-3">
                    {doc.fileName}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Tanggal Unggah:
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {doc.tanggalUpload}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  {/* Button to view content directly */}
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="flex-1 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-blue-200/60 dark:border-blue-900"
                    title="Buka dan lihat isi berkas langsung"
                  >
                    <Eye className="w-3.5 h-3.5" /> Lihat Isi
                  </button>

                  {/* Button to download file */}
                  <button
                    onClick={() => handleDownloadDoc(doc)}
                    className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-amber-600/30 transition-all cursor-pointer"
                    title="Unduh Berkas ke Komputer"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => setItemToDelete(doc)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Content Viewer Modal (Spacious, full content view) */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0a1738] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                <div className="w-8 h-8 rounded-xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Eye className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base leading-tight truncate text-white">
                    {previewDoc.judul}
                  </h3>
                  <p className="text-[11px] text-blue-200/80 truncate">
                    Tanggal Unggah: {previewDoc.tanggalUpload} • {previewDoc.fileName || 'Berkas Dokumen'} ({previewDoc.ukuranFile || '1.0 MB'})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownloadDoc(previewDoc)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Unduh Berkas"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh</span>
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Direct File Content Rendering */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {renderDocumentContent(previewDoc)}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Dokumen resmi terverifikasi dalam Arsip Organisasi
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
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
                Hapus Dokumen Arsip?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus dokumen berikut dari Arsip Organisasi?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="font-bold text-amber-600 dark:text-amber-400">{itemToDelete.judul}</div>
                <div className="text-slate-500 text-[11px]">Tanggal Unggah: {itemToDelete.tanggalUpload}</div>
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
