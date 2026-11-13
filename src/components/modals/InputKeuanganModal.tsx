import React, { useState } from 'react';
import { X, Wallet, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InputKeuanganModal: React.FC = () => {
  const { activeModal, setActiveModal, addTransaksi, state } = useApp();

  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');
  const [jenis, setJenis] = useState<'Pemasukan' | 'Pengeluaran'>('Pengeluaran');
  const [kategori, setKategori] = useState('');
  const [nominal, setNominal] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [buktiName, setBuktiName] = useState('');

  if (activeModal !== 'input-keuangan') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keterangan.trim()) return;

    const amount = parseInt(nominal, 10) || 0;

    addTransaksi({
      tanggal,
      keterangan: keterangan.trim(),
      jenis,
      kategori: kategori.trim() || (jenis === 'Pemasukan' ? 'Pemasukan Kas' : 'Pengeluaran Kas'),
      nominal: amount,
      penanggungJawab: penanggungJawab.trim() || state.currentUser.name,
      buktiName: buktiName.trim() || '',
      statusVerifikasi: 'Terverifikasi',
    });

    // Reset and close
    setKeterangan('');
    setKategori('');
    setNominal('');
    setPenanggungJawab('');
    setBuktiName('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#0a1738] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/40 border border-emerald-400/30 flex items-center justify-center text-emerald-200">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Input Transaksi Keuangan</h3>
              <p className="text-xs text-blue-200/80">Pencatatan arus kas masuk & pengeluaran kas organisasi</p>
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
          {/* Tipe Transaksi (Pemasukan vs Pengeluaran tabs) */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setJenis('Pemasukan')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                jenis === 'Pemasukan'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              + Pemasukan Kas
            </button>
            <button
              type="button"
              onClick={() => setJenis('Pengeluaran')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                jenis === 'Pengeluaran'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              - Pengeluaran Kas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Pos Anggaran
              </label>
              <input
                type="text"
                placeholder=""
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nominal (Rp) *
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                required
                placeholder=""
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan Transaksi *
            </label>
            <input
              type="text"
              required
              placeholder=""
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Penanggung Jawab / Bendahara
              </label>
              <input
                type="text"
                placeholder=""
                value={penanggungJawab}
                onChange={(e) => setPenanggungJawab(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Bukti Struk / Kwitansi (Opsional)
            </label>
            <input
              type="text"
              placeholder=""
              value={buktiName}
              onChange={(e) => setBuktiName(e.target.value)}
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
              className={`px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 shadow-md transition-all ${
                jenis === 'Pemasukan'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
              }`}
            >
              <Check className="w-4 h-4" /> Catat Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
