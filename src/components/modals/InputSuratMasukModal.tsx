import React, { useState, useRef } from 'react';
import { X, Mail, Upload, FileText, Check, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InputSuratMasukModal: React.FC = () => {
  const { activeModal, setActiveModal, addSuratMasuk } = useApp();

  const [nomorSurat, setNomorSurat] = useState('');
  const [pengirim, setPengirim] = useState('');
  const [perihal, setPerihal] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().split('T')[0]);
  const [tanggalTerima, setTanggalTerima] = useState(new Date().toISOString().split('T')[0]);
  const [tanggalAcara, setTanggalAcara] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [kategori, setKategori] = useState<'Undangan' | 'Pemberitahuan' | 'Permohonan' | 'Lainnya'>('Undangan');
  const [customKategori, setCustomKategori] = useState('');
  const [urgensi, setUrgensi] = useState<'Biasa' | 'Penting' | 'Segera'>('Penting');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState('');
  const [fileType, setFileType] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (activeModal !== 'input-surat-masuk') return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileType(file.type || '');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFileData(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengirim.trim() || !perihal.trim()) return;

    const finalKategori = kategori === 'Lainnya' ? (customKategori.trim() || 'Lainnya') : kategori;

    addSuratMasuk({
      nomorSurat: nomorSurat.trim(),
      pengirim: pengirim.trim(),
      perihal: perihal.trim(),
      tanggalSurat,
      tanggalTerima,
      tanggalAcara: tanggalAcara.trim() || '-',
      keterangan: keterangan.trim() || 'Diterima di kesekretariatan',
      kategori: finalKategori,
      status: 'Diterima',
      urgensi,
      fileName: fileName || '',
      fileData: fileData || '',
      fileType: fileType || '',
    });

    // Reset state & close
    setNomorSurat('');
    setPengirim('');
    setPerihal('');
    setTanggalAcara('');
    setKeterangan('');
    setCustomKategori('');
    setFileName('');
    setFileData('');
    setFileType('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#0a1738] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/40 border border-blue-400/30 flex items-center justify-center text-blue-200">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Input Surat Masuk</h3>
              <p className="text-xs text-blue-200/80">Registrasi persuratan masuk ke dalam spreadsheet</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Surat Pengirim
            </label>
            <input
              type="text"
              placeholder=""
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Instansi / Pengirim *
              </label>
              <input
                type="text"
                required
                placeholder=""
                value={pengirim}
                onChange={(e) => setPengirim(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Surat
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Undangan">Undangan</option>
                <option value="Pemberitahuan">Pemberitahuan</option>
                <option value="Permohonan">Permohonan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          {kategori === 'Lainnya' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tulis Kategori Lainnya *
              </label>
              <input
                type="text"
                required
                placeholder=""
                value={customKategori}
                onChange={(e) => setCustomKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Perihal / Isi Ringkas Surat *
            </label>
            <textarea
              required
              rows={2}
              placeholder=""
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Masuk *
              </label>
              <input
                type="date"
                required
                value={tanggalTerima}
                onChange={(e) => setTanggalTerima(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Acara / Kegiatan
              </label>
              <input
                type="date"
                value={tanggalAcara}
                onChange={(e) => setTanggalAcara(e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              placeholder=""
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pada Surat
              </label>
              <input
                type="date"
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tingkat Urgensi
              </label>
              <select
                value={urgensi}
                onChange={(e) => setUrgensi(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Segera">Segera / Mendesak</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              File Berkas Lampiran Surat (Opsional)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              id="file-surat-masuk"
              onChange={handleFileChange}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                fileName
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              {fileName ? (
                <div className="flex items-center justify-between gap-2 px-2">
                  <div className="flex items-center gap-2 text-left truncate">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs truncate">
                        {fileName}
                      </p>
                      <p className="text-[10px] text-slate-400">Berkas siap disimpan & dilihat di spreadsheet</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileName('');
                      setFileData('');
                      setFileType('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Hapus berkas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <Upload className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Klik untuk Unggah Berkas Surat
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Mendukung berkas PDF, Word, scan surat, atau gambar (Max 10MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" /> Simpan Surat Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
