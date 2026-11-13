import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Key,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthView: React.FC = () => {
  const { state, loginWithCredentials, registerAndLoginAccount } = useApp();

  // Default to register if no accounts have been created yet, otherwise login
  const [mode, setMode] = useState<'login' | 'register'>(
    state.users.length > 0 ? 'login' : 'register'
  );
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleModeChange = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'login') {
      const res = loginWithCredentials(name, password);
      if (!res.ok) {
        setErrorMsg(res.error || 'Gagal masuk ke akun.');
      }
    } else {
      const res = registerAndLoginAccount(name, password);
      if (!res.ok) {
        setErrorMsg(res.error || 'Gagal membuat akun baru.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Branding Panel */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0a1738] via-[#0e245c] to-[#143d8c] text-white p-5 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 sm:space-y-6">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-white p-1 sm:p-1.5 flex items-center justify-center shrink-0 shadow-lg">
                <img
                  src="/assets/aistudio/B443C882-D294-49A8-AAE7-73DBA70A68D5_d8b6524b.jpg"
                  alt="Logo Universitas Islam Bogor"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl md:text-2xl font-extrabold tracking-tight text-white leading-tight truncate">
                  SENTRA <span className="text-amber-400">UIB</span>
                </h1>
                <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-blue-100 leading-snug">
                  Sistem Elektronik Administrasi Organisasi
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-amber-300 italic">
                &quot;Tertib Administrasi, Progresif Berorganisasi&quot;
              </p>
              <p className="text-xs text-blue-100/85 leading-relaxed">
                Portal terpadu pengelolaan surat menyurat format A4, arsip dokumen, proposal &amp; LPJ, buku kas keuangan, rencana agenda, dan catatan kejadian penting organisasi mahasiswa Universitas Islam Bogor.
              </p>
            </div>

            {/* Campus Building Image */}
            <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-white h-36 sm:h-44">
              <img
                src="/assets/aistudio/AAGVtcZw2Jk_1789264556552_4aa2a4d9.png"
                alt="Gedung Universitas Islam Bogor"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900/75 text-[10px] font-semibold text-white border border-white/20">
                  Universitas Islam Bogor
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold">
                  UIB AKTIF
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Penyimpanan Terpisah &amp; Aman Per Akun Pengguna</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-6 p-5 sm:p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">
              {mode === 'login' ? 'Masuk ke Akun Anda' : 'Buat / Atur Akun Baru'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
              {mode === 'login'
                ? 'Masukkan Nama Lengkap dan Password untuk membuka data organisasi milik akun Anda.'
                : 'Daftarkan akun baru dengan Nama Lengkap dan Password untuk memulai ruang kerja terbaru.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 mb-6">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Akun</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('register')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Buat Akun Baru</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder=""
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder=""
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  aria-label="Tampilkan atau sembunyikan password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/60 flex items-start gap-2.5 text-[11px] text-blue-900 dark:text-blue-200">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {mode === 'register'
                  ? 'Masuk dengan akun baru akan menyiapkan halaman kerja terbaru yang bersih, dan seluruh input Anda akan disimpan otomatis khusus untuk akun ini.'
                  : 'Setiap data surat, arsip, keuangan, proposal, dan agenda tersimpan terpisah sesuai akun Anda masing-masing.'}
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <span>{mode === 'login' ? 'Masuk ke Sistem' : 'Buat Akun & Masuk'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Subtle Bottom Watermark */}
      <footer className="mt-4 sm:mt-6 text-center">
        <p className="text-[10.5px] sm:text-[11px] font-medium text-slate-400/90 dark:text-slate-500 tracking-wide">
          By : MPM 26/27 Parlemen Confluentia
        </p>
      </footer>
    </div>
  );
};
