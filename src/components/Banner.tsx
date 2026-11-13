import React from 'react';

export const Banner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003366] via-[#09488a] to-[#1464b4] text-white shadow-lg shadow-blue-900/10 mb-6">
      {/* Decorative background dynamic diagonal stripes */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Golden diagonal speed accents matching the screenshot */}
      <div className="absolute -top-12 -left-8 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl transform rotate-45 pointer-events-none" />
      <div className="absolute top-0 left-0 w-32 h-8 bg-gradient-to-r from-amber-400 to-amber-300 opacity-80 -skew-x-45 transform -translate-x-10 pointer-events-none" />
      <div className="absolute top-6 left-0 w-44 h-4 bg-gradient-to-r from-amber-400 to-transparent opacity-60 -skew-x-45 transform -translate-x-6 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 md:p-8 gap-4 sm:gap-6">
        {/* Left: UIB Logo & SENTRA UIB Branding */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-5 w-full md:w-auto">
          {/* Official Universitas Islam Bogor Logo (B44) */}
          <div className="flex w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-white p-1.5 sm:p-2 items-center justify-center shrink-0 shadow-lg shadow-black/20 group">
            <img
              src="/assets/aistudio/B443C882-D294-49A8-AAE7-73DBA70A68D5_d8b6524b.jpg"
              alt="Logo Universitas Islam Bogor"
              className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="space-y-0.5 sm:space-y-1 text-center sm:text-left min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              SENTRA <span className="text-amber-400">UIB</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base font-semibold text-blue-100 leading-snug">
              Sistem Elektronik Administrasi Organisasi
            </p>
            <p className="text-[11px] sm:text-xs md:text-sm text-blue-200/90 font-medium italic">
              &quot;Tertib Administrasi, Progresif Berorganisasi&quot;
            </p>
          </div>
        </div>

        {/* Right: Gedung Universitas Islam Bogor Artwork (AAGV) */}
        <div className="relative w-full md:w-96 h-32 sm:h-36 md:h-40 shrink-0 rounded-2xl overflow-hidden border border-white/25 shadow-xl bg-white group">
          <img
            src="/assets/aistudio/AAGVtcZw2Jk_1789264556552_4aa2a4d9.png"
            alt="Gedung Universitas Islam Bogor"
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md text-[10px] font-semibold text-white tracking-wide border border-white/20">
              Universitas Islam Bogor
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-400/90 text-slate-900 text-[10px] font-bold tracking-wider">
              UIB AKTIF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
