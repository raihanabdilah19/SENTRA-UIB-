import React, { useState, useEffect } from 'react';
import { X, User, Check, Shield, Key, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UserProfileModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    state,
    updateCurrentUserProfile,
    registerAndLoginAccount,
  } = useApp();

  const [tab, setTab] = useState<'edit' | 'create'>('edit');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeModal === 'profile') {
      setErrorMsg(null);
      if (tab === 'edit') {
        setName(state.currentUser.name || '');
        setPassword(state.currentUser.password || '');
      } else {
        setName('');
        setPassword('');
      }
    }
  }, [activeModal, tab, state.currentUser.name, state.currentUser.password]);

  if (activeModal !== 'profile') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (tab === 'edit') {
        if (!name.trim() || !password.trim()) {
          setErrorMsg('Nama lengkap dan password wajib diisi.');
          return;
        }
        const res = await updateCurrentUserProfile({
          name: name.trim(),
          password: password.trim(),
          role: 'superadmin',
          nim: '',
          division: 'SENTRA UIB',
          phone: '',
        });
        if (!res.ok) {
          setErrorMsg(res.error || 'Gagal memperbarui akun.');
          return;
        }
        setActiveModal(null);
      } else {
        const res = await registerAndLoginAccount(name, password);
        if (!res.ok) {
          setErrorMsg(res.error || 'Gagal membuat akun baru.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#0a1738] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/40 border border-blue-400/30 flex items-center justify-center text-blue-200">
              {tab === 'edit' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <UserPlus className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Buat / Atur Akun</h3>
              <p className="text-xs text-blue-200/80">Kelola akun aktif atau buat akun baru</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setTab('edit')}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'edit'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Atur Akun Ini
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setTab('create')}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'create'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              + Buat Akun Baru
            </button>
          </div>
        </div>

        {/* Form Body - Only Nama Lengkap & Password */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder=""
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                disabled={isSubmitting}
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-60"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-start gap-2.5 text-[11px] text-blue-900 dark:text-blue-200">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">
                {tab === 'edit' ? 'Tersinkron ke Cloud' : 'Ruang Kerja Baru & Terpisah'}
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                {tab === 'edit'
                  ? 'Perubahan akun dan seluruh data Anda otomatis tersimpan ke cloud agar bisa dibuka dari HP maupun laptop.'
                  : 'Akun baru akan masuk dengan isi terbaru yang bersih dan tersimpan otomatis di cloud.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500/80 text-white font-semibold flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:cursor-wait"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isSubmitting
                ? 'Menyimpan...'
                : tab === 'edit'
                ? 'Simpan Perubahan'
                : 'Buat Akun & Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
