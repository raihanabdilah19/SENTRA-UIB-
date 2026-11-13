import React, { useState, useRef } from 'react';
import { X, FileText, Upload, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InputProposalModal: React.FC = () => {
  const { activeModal, setActiveModal, addProposalLpj, state, showToast } = useApp();

  const [judul, setJudul] = useState('');
  const [jenis, setJenis] = useState<'Proposal' | 'LPJ'>('Proposal');
  const [tanggalDiajukan, setTanggalDiajukan] = useState(new Date().toISOString().split('T')[0]);
  const [anggaranDiajukan, setAnggaranDiajukan] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [catatan, setCatatan] = useState('');

  // File state
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [ukuranFile, setUkuranFile] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (activeModal !== 'input-proposal') return null;

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
      setFileData(`data:text/plain;charset=utf-8,${encodeURIComponent(`BERKAS ${jenis.toUpperCase()}\nNama: ${file.name}`)}`);
    };
    reader.readAsDataURL(file);

    // If it's a text-compatible file, read text for instant inline reader
    const isTextCompatible =
      file.type.startsWith('text/') ||
      Boolean(file.name.match(/\.(txt|md|csv|json|html|xml|log)$/i));

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
      showToast('Judul Wajib Diisi', 'Silakan masukkan nama kegiatan / program kerja.', 'warning');
      return;
    }

    const nominal = parseInt(anggaranDiajukan, 10) || 0;
    const finalFileName = fileName || `${jenis}_${judul.trim().replace(/[\s\W]+/g, '_')}.pdf`;

    const defaultText = `===============================================================
DOKUMEN RESMI ${jenis.toUpperCase()} KEGIATAN ORGANISASI
===============================================================

Nama Kegiatan     : ${judul.trim()}
Jenis Dokumen     : ${jenis === 'Proposal' ? 'Proposal Pengajuan Program Kerja' : 'Laporan Pertanggungjawaban (LPJ)'}
Tanggal Pengajuan : ${tanggalDiajukan}
Anggaran          : Rp ${nominal.toLocaleString('id-ID')}
Penanggung Jawab  : ${penanggungJawab}
Nama Berkas       : ${finalFileName}
Status Pengajuan  : Review Sekretaris

---------------------------------------------------------------
URAIAN & RINGKASAN:
${catatan.trim() || `Dokumen resmi ${jenis} untuk program kerja "${judul.trim()}". Berkas diajukan untuk peninjauan administrasi kesekretariatan dan pendanaan kebendaharaan.`}

Catatan Administrasi:
- Seluruh rincian anggaran terlampir dalam proposal/LPJ ini.
- Berkas telah tercatat secara digital dalam sistem SENTRA UIB.
- Berkas sah dan dapat diunduh langsung untuk keperluan arsip/cetak.
===============================================================`;

    const finalFileData =
      fileData ||
      `data:text/plain;charset=utf-8,${encodeURIComponent(defaultText)}`;
    const finalFileType = fileType || (finalFileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain');
    const finalTextContent = textContent || defaultText;

    addProposalLpj({
      judul: judul.trim(),
      jenis,
      tanggalDiajukan,
      anggaranDiajukan: nominal,
      anggaranDisetujui: nominal,
      status: 'Review Sekretaris',
      penanggungJawab: penanggungJawab.trim() || state.currentUser.name,
      catatan: catatan.trim() || 'Diajukan untuk peninjauan berkas dan pendanaan kegiatan.',
      fileName: finalFileName,
      fileData: finalFileData,
      fileType: finalFileType,
      textContent: finalTextContent,
      ukuranFile: ukuranFile || '1.0 MB',
    });

    showToast('Berhasil Diajukan', `${jenis} "${judul.trim()}" berhasil diunggah dan diajukan.`, 'success');

    // Reset and close
    setJudul('');
    setAnggaranDiajukan('');
    setPenanggungJawab('');
    setCatatan('');
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
            <div className="w-9 h-9 rounded-xl bg-purple-600/40 border border-purple-400/30 flex items-center justify-center text-purple-200">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Input Proposal & LPJ</h3>
              <p className="text-xs text-blue-200/80">Pengajuan rencana kegiatan dan pertanggungjawaban dana</p>
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

        {/* Form Body: Divisi removed, Tanggal & File Upload added */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Dokumen *
              </label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="Proposal">Proposal Kegiatan</option>
                <option value="LPJ">Laporan Pertanggungjawaban (LPJ)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pengajuan *
              </label>
              <input
                type="date"
                required
                value={tanggalDiajukan}
                onChange={(e) => setTanggalDiajukan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Kegiatan / Program Kerja *
            </label>
            <input
              type="text"
              required
              placeholder=""
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimasi Anggaran (Rp) *
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                required
                value={anggaranDiajukan}
                onChange={(e) => setAnggaranDiajukan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-semibold text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Penanggung Jawab (PJ)
              </label>
              <input
                type="text"
                placeholder=""
                value={penanggungJawab}
                onChange={(e) => setPenanggungJawab(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>
          </div>

          {/* File Upload Field */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Unggah File Berkas ({jenis})
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
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                  : fileName
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              {fileName ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
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
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                    <Upload className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Klik di sini untuk memilih berkas berkas {jenis} (PDF/Word/Excel)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Berkas akan dapat langsung dilihat isinya dan diunduh oleh pengurus
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Urgensi Pendanaan
            </label>
            <textarea
              rows={2}
              placeholder=""
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer active:scale-98"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah & Ajukan {jenis}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
