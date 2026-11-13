import React, { useState, useRef } from 'react';
import { X, FolderUp, Upload, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UploadDokumenModal: React.FC = () => {
  const { activeModal, setActiveModal, addDokumen, showToast } = useApp();

  const [judul, setJudul] = useState('');
  const [tanggalUpload, setTanggalUpload] = useState(new Date().toISOString().split('T')[0]);
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [ukuranFile, setUkuranFile] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (activeModal !== 'upload-dokumen') return null;

  const processFile = (file: File) => {
    setFileName(file.name);
    setFileType(file.type || '');

    // Format file size
    const sizeInKb = file.size / 1024;
    if (sizeInKb > 1024) {
      setUkuranFile(`${(sizeInKb / 1024).toFixed(1)} MB`);
    } else {
      setUkuranFile(`${Math.max(1, Math.round(sizeInKb))} KB`);
    }

    // Read Data URL for preview and downloading
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileData(event.target.result as string);
      }
    };
    reader.onerror = () => {
      setFileData(`data:text/plain;charset=utf-8,${encodeURIComponent(`DOKUMEN ORGANISASI\nFile: ${file.name}`)}`);
    };
    reader.readAsDataURL(file);

    // If it's a text-compatible file, also read text content directly for instant inline reading
    const isTextCompatible =
      file.type.startsWith('text/') ||
      file.name.match(/\.(txt|md|csv|json|html|xml|log)$/i);

    if (isTextCompatible) {
      const textReader = new FileReader();
      textReader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setTextContent(event.target.result);
        }
      };
      textReader.readAsText(file);
    } else {
      setTextContent('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!judul.trim()) {
      showToast('Judul Wajib Diisi', 'Silakan masukkan judul dokumen.', 'warning');
      return;
    }

    const defaultText = `===============================================================
ARSIP RESMI ORGANISASI MAHASISWA
===============================================================

Judul Dokumen  : ${judul.trim()}
Tanggal Unggah : ${tanggalUpload}
Nama File      : ${fileName || `${judul.trim().replace(/\s+/g, '_')}.pdf`}
Status         : Terverifikasi & Tersimpan di Repositori Digital

---------------------------------------------------------------
RINGKASAN & POKOK DOKUMEN:
Dokumen "${judul.trim()}" telah didaftarkan dan diarsipkan secara resmi
pada tanggal ${tanggalUpload}. Berkas ini merupakan bagian dari arsip
konstitusi, pedoman, dan administrasi organisasi mahasiswa.

Catatan Kesekretariatan:
- Salinan digital tersimpan aman dalam basis data arsip organisasi.
- Hak akses penuh untuk seluruh pengurus dan anggota organisasi.
- Dokumen sah dan dapat diunduh kapan saja oleh pihak yang berwenang.
===============================================================`;

    const finalFileName = fileName || `${judul.trim().replace(/\s+/g, '_')}.pdf`;
    const finalFileData =
      fileData ||
      `data:text/plain;charset=utf-8,${encodeURIComponent(defaultText)}`;
    const finalFileType = fileType || (finalFileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain');
    const finalTextContent = textContent || defaultText;

    addDokumen({
      judul: judul.trim(),
      tanggalUpload,
      fileName: finalFileName,
      fileData: finalFileData,
      fileType: finalFileType,
      textContent: finalTextContent,
      ukuranFile: ukuranFile || '1.0 MB',
      kategori: 'Dokumen Organisasi',
      versi: 'v1.0',
      deskripsi: `Dokumen resmi diunggah pada ${tanggalUpload}`,
    });

    showToast('Unggah Berhasil', `Dokumen "${judul.trim()}" berhasil disimpan ke arsip dan siap dilihat.`, 'success');

    // Reset state & close modal
    setJudul('');
    setFileName('');
    setFileData('');
    setFileType('');
    setTextContent('');
    setUkuranFile('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#0a1738] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <FolderUp className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Unggah Dokumen Arsip</h3>
              <p className="text-xs text-blue-200/80">Simpan berkas ke dalam Arsip Organisasi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body: Only 3 requested fields */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* 1. Judul Dokumen */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul Dokumen *
            </label>
            <input
              type="text"
              required
              placeholder=""
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* 2. Tanggal Unggah */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Unggah *
            </label>
            <input
              type="date"
              required
              value={tanggalUpload}
              onChange={(e) => setTanggalUpload(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* 3. File Dokumen */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              File Dokumen
            </label>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                  : fileName
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              {fileName ? (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold text-xs truncate max-w-xs">
                    {fileName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Ukuran: {ukuranFile} • Klik untuk mengganti berkas
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Klik di sini untuk memilih berkas dari komputer
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Mendukung berkas PDF, Word, Excel, gambar, atau teks
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-amber-600/30 transition-all cursor-pointer active:scale-98"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Dokumen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
