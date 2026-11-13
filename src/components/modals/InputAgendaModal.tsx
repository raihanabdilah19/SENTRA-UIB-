import React, { useState } from 'react';
import { X, CalendarPlus, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InputAgendaModal: React.FC = () => {
  const { activeModal, setActiveModal, addAgenda, state, showToast } = useApp();

  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [waktuMulai, setWaktuMulai] = useState('');
  const [waktuSelesai, setWaktuSelesai] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tipe, setTipe] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [peserta, setPeserta] = useState('');

  if (activeModal !== 'input-agenda') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) {
      showToast('Judul Wajib Diisi', 'Silakan masukkan nama agenda/kegiatan.', 'warning');
      return;
    }
    if (!lokasi.trim()) {
      showToast('Lokasi Wajib Diisi', 'Silakan masukkan lokasi kegiatan.', 'warning');
      return;
    }

    addAgenda({
      judul: judul.trim(),
      tanggal,
      waktuMulai: waktuMulai.trim() || '08.00',
      waktuSelesai: waktuSelesai.trim() || 'Selesai',
      lokasi: lokasi.trim(),
      tipe: tipe.trim() || 'Umum',
      deskripsi: deskripsi.trim() || '-',
      penanggungJawab: penanggungJawab.trim() || state.currentUser.name,
      peserta: peserta.trim() || '-',
      status: 'Akan Datang',
    });

    // Reset state & close modal
    setJudul('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setWaktuMulai('');
    setWaktuSelesai('');
    setLokasi('');
    setTipe('');
    setDeskripsi('');
    setPenanggungJawab('');
    setPeserta('');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#0a1738] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/40 border border-blue-400/30 flex items-center justify-center text-blue-200">
              <CalendarPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Input Rencana Agenda</h3>
              <p className="text-xs text-blue-200/80">Jadwalkan rapat, kegiatan kampus, atau evaluasi kerja</p>
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

        {/* Form Body: All example values and placeholder examples removed */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Agenda / Kegiatan *
            </label>
            <input
              type="text"
              required
              placeholder=""
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Klasifikasi Agenda
              </label>
              <input
                type="text"
                placeholder=""
                value={tipe}
                onChange={(e) => setTipe(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pelaksanaan *
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Waktu Mulai
              </label>
              <input
                type="text"
                placeholder=""
                value={waktuMulai}
                onChange={(e) => setWaktuMulai(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Waktu Selesai
              </label>
              <input
                type="text"
                placeholder=""
                value={waktuSelesai}
                onChange={(e) => setWaktuSelesai(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lokasi / Tempat *
            </label>
            <input
              type="text"
              required
              placeholder=""
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Penanggung Jawab (PIC)
              </label>
              <input
                type="text"
                placeholder=""
                value={penanggungJawab}
                onChange={(e) => setPenanggungJawab(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Peserta
              </label>
              <input
                type="text"
                placeholder=""
                value={peserta}
                onChange={(e) => setPeserta(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Agenda
            </label>
            <textarea
              rows={2}
              placeholder=""
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium resize-none"
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" /> Simpan Agenda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
