import React, { useState } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InputKejadianPentingModal: React.FC = () => {
  const { activeModal, setActiveModal, addKejadianPenting, showToast } = useApp();

  const [namaAgenda, setNamaAgenda] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kendala, setKendala] = useState('');
  const [jumlahPeserta, setJumlahPeserta] = useState('');
  const [keterangan, setKeterangan] = useState('');

  if (activeModal !== 'input-kejadian-penting') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaAgenda.trim()) {
      showToast('Wajib Diisi', 'Silakan masukkan nama agenda kegiatan.', 'warning');
      return;
    }

    addKejadianPenting({
      namaAgenda: namaAgenda.trim(),
      namaKegiatan: namaAgenda.trim(),
      tanggal,
      tanggalAcara: tanggal,
      kendala: kendala.trim() || '-',
      jumlahPeserta: jumlahPeserta.trim() || '0',
      keterangan: keterangan.trim() || '-',
    });

    showToast('Berhasil Disimpan', `Agenda "${namaAgenda.trim()}" telah dicatat ke Kejadian Penting.`, 'success');

    // Reset and close
    setNamaAgenda('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setKendala('');
    setJumlahPeserta('');
    setKeterangan('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#0a1738] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <AlertCircle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Input Kejadian Penting</h3>
              <p className="text-xs text-blue-200/80">Pencatatan agenda terlaksana, tanggal, kendala, peserta & keterangan</p>
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

        {/* Form Body: no placeholders */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Agenda *
            </label>
            <input
              type="text"
              required
              placeholder=""
              value={namaAgenda}
              onChange={(e) => setNamaAgenda(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal *
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah Peserta *
              </label>
              <input
                type="text"
                required
                placeholder=""
                value={jumlahPeserta}
                onChange={(e) => setJumlahPeserta(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kendala *
            </label>
            <textarea
              required
              rows={3}
              placeholder=""
              value={kendala}
              onChange={(e) => setKendala(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan
            </label>
            <textarea
              rows={2}
              placeholder=""
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium resize-none"
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
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-amber-600/30 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" /> Simpan Kejadian Penting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
