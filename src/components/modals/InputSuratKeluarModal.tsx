import React, { useState } from 'react';
import { X, Send, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InputSuratKeluarModal: React.FC = () => {
  const { activeModal, setActiveModal, addSuratKeluar } = useApp();

  const [nomorSurat, setNomorSurat] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [perihal, setPerihal] = useState('');
  const [tanggalKirim, setTanggalKirim] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');
  const [kategori, setKategori] = useState<'Undangan' | 'Pemberitahuan' | 'Permohonan' | 'Rekomendasi' | 'Mandat' | 'Lainnya'>('Undangan');
  const [customKategori, setCustomKategori] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Menunggu TTD' | 'Terkirim'>('Terkirim');

  if (activeModal !== 'input-surat-keluar') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorSurat.trim() || !tujuan.trim() || !perihal.trim()) return;

    const finalKategori = kategori === 'Lainnya' ? (customKategori.trim() || 'Lainnya') : kategori;

    addSuratKeluar({
      nomorSurat: nomorSurat.trim(),
      tujuan: tujuan.trim(),
      perihal: perihal.trim(),
      tanggalKirim,
      tanggalSurat: tanggalKirim,
      keterangan: keterangan.trim() || '-',
      kategori: finalKategori,
      status,
      fileName: `Surat_Keluar_${nomorSurat.replace(/[\/\\]/g, '_')}.pdf`,
    });

    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#0a1738] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/40 border border-blue-400/30 flex items-center justify-center text-blue-200">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Input Surat Keluar</h3>
              <p className="text-xs text-blue-200/80">Otomatis tercatat ke Spreadsheet Surat Keluar</p>
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
              Nomor Surat *
            </label>
            <input
              type="text"
              required
              placeholder=""
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dikirim Kepada / Tujuan *
              </label>
              <input
                type="text"
                required
                placeholder=""
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Klasifikasi Kategori
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Undangan">Undangan</option>
                <option value="Pemberitahuan">Pemberitahuan</option>
                <option value="Permohonan">Permohonan</option>
                <option value="Rekomendasi">Rekomendasi</option>
                <option value="Mandat">Mandat / Surat Tugas</option>
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
              Perihal Isi Surat *
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

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Surat *
              </label>
              <input
                type="date"
                required
                value={tanggalKirim}
                onChange={(e) => setTanggalKirim(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Dokumen
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Terkirim">Terkirim</option>
                <option value="Menunggu TTD">Menunggu TTD</option>
                <option value="Draft">Draft Internal</option>
              </select>
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
              <Check className="w-4 h-4" /> Simpan Surat Keluar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
