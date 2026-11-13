import React from 'react';
import { Megaphone, Sparkles } from 'lucide-react';

export const OrgInfoCard: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0a1b3f] via-[#081533] to-[#040b1c] text-white p-4 sm:p-5 md:p-6 border border-blue-900/40 shadow-xs flex flex-col justify-between">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-blue-600/40 border border-blue-400/30 flex items-center justify-center text-blue-200 shrink-0">
          <Megaphone className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-bold text-white text-sm sm:text-base">
          Informasi Organisasi
        </h3>
      </div>

      {/* Body text */}
      <div className="relative z-10 my-1">
        <p className="text-[11px] sm:text-xs md:text-sm text-blue-100/90 leading-relaxed font-normal">
          Organisasi kita, bergerak bersama untuk masa depan yang lebih baik!
        </p>

        {/* Golden Cursive / Script Banner */}
        <div className="my-2.5 sm:my-3 py-1">
          <span className="font-script text-xl sm:text-2xl md:text-3xl text-amber-400 font-bold block transform -rotate-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
            Solid, Progresif, Berdampak!
          </span>
        </div>
      </div>

      {/* Bottom Cheering Students Silhouette Vector Artwork */}
      <div className="relative z-10 mt-auto pt-2 overflow-hidden">
        <svg
          viewBox="0 0 300 90"
          className="w-full h-20 text-blue-400/40 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle starry glints */}
          <circle cx="40" cy="15" r="1.5" fill="#facc15" opacity="0.6" />
          <circle cx="120" cy="8" r="1.5" fill="#facc15" opacity="0.8" />
          <circle cx="220" cy="12" r="1.5" fill="#facc15" opacity="0.5" />
          <circle cx="280" cy="22" r="1" fill="#facc15" opacity="0.7" />

          {/* Cheering Crowd Silhouettes with hands up in unity */}
          <path
            d="
              M 0 90
              L 0 75
              C 10 70, 15 50, 22 55
              C 25 45, 30 35, 35 48
              C 40 40, 48 30, 52 45
              C 58 42, 65 38, 70 52
              C 75 35, 80 20, 85 45
              C 92 48, 100 42, 105 56
              C 112 30, 118 15, 125 40
              C 132 45, 140 38, 148 50
              C 155 25, 162 12, 168 38
              C 175 42, 182 35, 190 48
              C 198 28, 205 18, 212 42
              C 218 46, 225 40, 232 54
              C 240 32, 248 22, 255 45
              C 262 48, 270 42, 278 58
              C 285 52, 292 48, 300 62
              L 300 90
              Z
            "
            opacity="0.45"
          />

          {/* Foreground sharper crowd silhouettes */}
          <path
            d="
              M 0 90
              L 0 80
              C 12 75, 20 62, 30 68
              C 38 52, 45 42, 52 60
              C 60 55, 68 48, 75 65
              C 85 42, 95 28, 102 58
              C 110 52, 118 45, 128 62
              C 138 35, 145 22, 155 52
              C 165 48, 172 40, 180 60
              C 190 32, 198 24, 208 55
              C 218 50, 225 44, 235 62
              C 245 38, 252 30, 260 58
              C 270 52, 280 48, 290 65
              L 300 70
              L 300 90
              Z
            "
            opacity="0.85"
            fill="#061229"
          />
        </svg>

        <div className="flex items-center justify-between text-[10px] text-blue-200/60 pt-1 border-t border-blue-900/50">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Kabinet Berkarya 2026
          </span>
          <span>BEM & UKM Terpadu</span>
        </div>
      </div>
    </div>
  );
};
