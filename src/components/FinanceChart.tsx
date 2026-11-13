import React, { useState, useMemo } from 'react';
import {
  BarChart2,
  TrendingUp,
  ChevronDown,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../services/storage';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTH_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const FinanceChart: React.FC = () => {
  const { state, setActiveModal, addTransaksi, showToast } = useApp();
  const [period, setPeriod] = useState<'3 Bulan Terakhir' | '6 Bulan Terakhir' | '1 Tahun'>(
    '6 Bulan Terakhir'
  );
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute reference year and month (use current date, default 2026)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0 - 11

  // Generate target month slots based on selected period
  const monthSlots = useMemo(() => {
    let count = 6;
    if (period === '3 Bulan Terakhir') count = 3;
    if (period === '1 Tahun') count = 12;

    const slots: { year: number; monthIndex: number; label: string; fullLabel: string; key: string }[] = [];

    if (period === '1 Tahun') {
      // Show full calendar year (Jan to Des)
      for (let m = 0; m < 12; m++) {
        slots.push({
          year: currentYear,
          monthIndex: m,
          label: MONTH_NAMES[m],
          fullLabel: `${MONTH_FULL[m]} ${currentYear}`,
          key: `${currentYear}-${String(m + 1).padStart(2, '0')}`,
        });
      }
    } else {
      // Show rolling months up to current month
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        slots.push({
          year: y,
          monthIndex: m,
          label: MONTH_NAMES[m],
          fullLabel: `${MONTH_FULL[m]} ${y}`,
          key: `${y}-${String(m + 1).padStart(2, '0')}`,
        });
      }
    }
    return slots;
  }, [period, currentYear, currentMonth]);

  // Aggregate transaction amounts per month slot
  const chartData = useMemo(() => {
    return monthSlots.map((slot) => {
      let totalIn = 0;
      let totalOut = 0;

      state.transaksi.forEach((t) => {
        if (!t.tanggal) return;

        // Parse date robustly from ISO "YYYY-MM-DD" or standard date formats
        let txYear = 0;
        let txMonth = -1;

        if (t.tanggal.includes('-')) {
          const parts = t.tanggal.split('-');
          txYear = parseInt(parts[0], 10);
          txMonth = parseInt(parts[1], 10) - 1;
        } else {
          const parsedDate = new Date(t.tanggal);
          if (!isNaN(parsedDate.getTime())) {
            txYear = parsedDate.getFullYear();
            txMonth = parsedDate.getMonth();
          }
        }

        // Match transaction with current slot
        if (txYear === slot.year && txMonth === slot.monthIndex) {
          if (t.jenis === 'Pemasukan') {
            totalIn += Number(t.nominal) || 0;
          } else if (t.jenis === 'Pengeluaran') {
            totalOut += Number(t.nominal) || 0;
          }
        }
      });

      return {
        ...slot,
        totalIn,
        totalOut,
        net: totalIn - totalOut,
      };
    });
  }, [monthSlots, state.transaksi]);

  // Calculate overall totals for the selected period
  const periodTotalIn = chartData.reduce((acc, d) => acc + d.totalIn, 0);
  const periodTotalOut = chartData.reduce((acc, d) => acc + d.totalOut, 0);
  const periodNet = periodTotalIn - periodTotalOut;
  const hasTransactions = state.transaksi.length > 0;

  // Calculate highest value for Y-Axis scaling
  const maxDataVal = Math.max(
    ...chartData.map((d) => Math.max(d.totalIn, d.totalOut)),
    0
  );

  // Dynamic maximum scale with headroom
  const maxY = maxDataVal > 0 ? Math.ceil(maxDataVal * 1.25) : 2000000;

  // Format Y-axis label nicely
  const formatYAxisLabel = (val: number) => {
    if (val === 0) return 'Rp 0';
    if (val >= 1000000) {
      const millions = val / 1000000;
      return millions % 1 === 0 ? `${millions} jt` : `${millions.toFixed(1)} jt`;
    }
    if (val >= 1000) {
      return `${Math.round(val / 1000)} rb`;
    }
    return val.toString();
  };

  // Dimensions for responsive SVG viewport
  const width = 660;
  const height = 260;
  const paddingLeft = 60;
  const paddingRight = 28;
  const paddingTop = 32;
  const paddingBottom = 38;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const numSlots = chartData.length;
  const slotBandWidth = numSlots > 0 ? innerWidth / numSlots : innerWidth;
  const getX = (i: number) =>
    numSlots === 1
      ? paddingLeft + innerWidth / 2
      : paddingLeft + slotBandWidth * (i + 0.5);

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxY));
    return paddingTop + innerHeight - (clamped / maxY) * innerHeight;
  };

  // Coordinate points for line chart
  const inPoints = chartData.map((d, i) => ({ x: getX(i), y: getY(d.totalIn) }));
  const outPoints = chartData.map((d, i) => ({ x: getX(i), y: getY(d.totalOut) }));

  // Create smooth curved SVG path string
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    return pts.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  };

  const inLinePath = createSmoothPath(inPoints);
  const outLinePath = createSmoothPath(outPoints);

  // Gradient area closed paths for line chart
  const bottomY = paddingTop + innerHeight;
  const inAreaPath =
    inPoints.length > 0
      ? `${inLinePath} L ${inPoints[inPoints.length - 1].x} ${bottomY} L ${inPoints[0].x} ${bottomY} Z`
      : '';
  const outAreaPath =
    outPoints.length > 0
      ? `${outLinePath} L ${outPoints[outPoints.length - 1].x} ${bottomY} L ${outPoints[0].x} ${bottomY} Z`
      : '';

  // Quick Seed Sample Data helper for instant demonstration
  const handleSeedSampleData = () => {
    const today = new Date().toISOString().split('T')[0];
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 15).toISOString().split('T')[0];
    const twoMonthsAgoDate = new Date(currentYear, currentMonth - 2, 20).toISOString().split('T')[0];

    addTransaksi({
      tanggal: twoMonthsAgoDate,
      keterangan: 'Dana Hibah Kemahasiswaan & Kas Awal',
      jenis: 'Pemasukan',
      kategori: 'Dana Kemahasiswaan',
      nominal: 3500000,
      penanggungJawab: state.currentUser.name || 'Bendahara',
      statusVerifikasi: 'Terverifikasi',
    });

    addTransaksi({
      tanggal: prevMonthDate,
      keterangan: 'Iuran Wajib Kas Anggota Organisasi',
      jenis: 'Pemasukan',
      kategori: 'Kas Anggota',
      nominal: 1800000,
      penanggungJawab: state.currentUser.name || 'Bendahara',
      statusVerifikasi: 'Terverifikasi',
    });

    addTransaksi({
      tanggal: prevMonthDate,
      keterangan: 'Pengadaan ATK & Perlengkapan Kesekretariatan',
      jenis: 'Pengeluaran',
      kategori: 'Perlengkapan',
      nominal: 650000,
      penanggungJawab: state.currentUser.name || 'Sekretaris',
      statusVerifikasi: 'Terverifikasi',
    });

    addTransaksi({
      tanggal: today,
      keterangan: 'Sponsorship Kegiatan Kampus & Donatur',
      jenis: 'Pemasukan',
      kategori: 'Sponsorship',
      nominal: 2400000,
      penanggungJawab: state.currentUser.name || 'Bendahara',
      statusVerifikasi: 'Terverifikasi',
    });

    addTransaksi({
      tanggal: today,
      keterangan: 'Konsumsi Rapat Pleno Koordinasi Pengurus',
      jenis: 'Pengeluaran',
      kategori: 'Konsumsi',
      nominal: 420000,
      penanggungJawab: state.currentUser.name || 'Bendahara',
      statusVerifikasi: 'Terverifikasi',
    });

    showToast(
      'Simulasi Kas Berhasil Dibuat',
      '5 transaksi kas telah dicatat. Grafik kini menampilkan tren keuangan aktif!',
      'success'
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between relative overflow-visible">
      {/* Top Header: Title, Live Summary Pills, Period & Type Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 sm:mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BarChart2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">
                Grafik Arus Kas Keuangan
              </h3>
              <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                Visualisasi pemasukan, pengeluaran & cashflow organisasi secara real-time
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Chart Type Toggle & Period Selector */}
        <div className="flex items-center gap-2">
          {/* Chart Type Toggle (Line vs Bar) */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setChartType('line')}
              title="Grafik Garis (Line Chart)"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'line'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Grafik Batang (Bar Chart)"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Period Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>{period}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 z-30 text-xs">
                {(['3 Bulan Terakhir', '6 Bulan Terakhir', '1 Tahun'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setPeriod(opt);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 transition-colors flex items-center justify-between ${
                      period === opt
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    {period === opt && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time KPI Summary Badges for Selected Period */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 mb-3 text-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            <span>Pemasukan Periode</span>
          </div>
          <p className="font-extrabold text-blue-600 dark:text-blue-400 text-xs sm:text-sm mt-0.5 truncate">
            {formatRupiah(periodTotalIn)}
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Pengeluaran Periode</span>
          </div>
          <p className="font-extrabold text-amber-600 dark:text-amber-400 text-xs sm:text-sm mt-0.5 truncate">
            {formatRupiah(periodTotalOut)}
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>Saldo Akhir</span>
          </div>
          <p
            className={`font-extrabold text-xs sm:text-sm mt-0.5 truncate ${
              periodNet >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatRupiah(periodNet)}
          </p>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full overflow-visible select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Linear gradients for area fill */}
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-axis labels */}
          {[1, 0.75, 0.5, 0.25, 0].map((ratio) => {
            const val = maxY * ratio;
            const y = paddingTop + innerHeight - ratio * innerHeight;
            return (
              <g key={ratio}>
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono font-medium"
                >
                  {formatYAxisLabel(val)}
                </text>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800/80"
                  strokeWidth="1.2"
                  strokeDasharray={ratio === 0 ? 'none' : '3 3'}
                />
              </g>
            );
          })}

          {/* Month labels along X axis */}
          {chartData.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredIdx === i;
            return (
              <g key={d.key}>
                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[10.5px] sm:text-[11px] transition-colors font-semibold ${
                    isHovered
                      ? 'fill-blue-600 dark:fill-blue-400 font-bold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {d.label}
                </text>

                {/* Vertical hover crosshair guide line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={bottomY}
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                )}
              </g>
            );
          })}

          {/* MODE 1: LINE CHART */}
          {chartType === 'line' && (
            <>
              {/* Soft area under lines */}
              {inAreaPath && <path d={inAreaPath} fill="url(#blueGradient)" />}
              {outAreaPath && <path d={outAreaPath} fill="url(#amberGradient)" />}

              {/* Blue line: Pemasukan */}
              {inLinePath && (
                <path
                  d={inLinePath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Orange line: Pengeluaran */}
              {outLinePath && (
                <path
                  d={outLinePath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Dots - Pemasukan */}
              {inPoints.map((pt, i) => (
                <circle
                  key={`in-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIdx === i ? 6.5 : 4.5}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
                />
              ))}

              {/* Interactive Dots - Pengeluaran */}
              {outPoints.map((pt, i) => (
                <circle
                  key={`out-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIdx === i ? 6.5 : 4.5}
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
                />
              ))}
            </>
          )}

          {/* MODE 2: BAR CHART (Comparative Side-by-Side Bars) */}
          {chartType === 'bar' && (
            <>
              {chartData.map((d, i) => {
                const centerX = getX(i);
                const barWidth = Math.max(7, Math.min(20, slotBandWidth * 0.3));
                const gap = 3;

                const inBarH = (d.totalIn / maxY) * innerHeight;
                const outBarH = (d.totalOut / maxY) * innerHeight;

                const inX = centerX - barWidth - gap / 2;
                const outX = centerX + gap / 2;

                const inY = bottomY - Math.max(3, inBarH);
                const outY = bottomY - Math.max(3, outBarH);

                const isHovered = hoveredIdx === i;

                return (
                  <g
                    key={`bars-${d.key}`}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
                    className="cursor-pointer"
                  >
                    {/* Hover zone background */}
                    <rect
                      x={centerX - slotBandWidth / 2}
                      y={paddingTop}
                      width={slotBandWidth}
                      height={innerHeight}
                      fill="transparent"
                    />

                    {/* Blue bar: Pemasukan */}
                    <rect
                      x={inX}
                      y={inY}
                      width={barWidth}
                      height={Math.max(3, inBarH)}
                      rx={3}
                      fill="#2563eb"
                      opacity={isHovered ? 1 : 0.85}
                      className="transition-all"
                    />

                    {/* Amber bar: Pengeluaran */}
                    <rect
                      x={outX}
                      y={outY}
                      width={barWidth}
                      height={Math.max(3, outBarH)}
                      rx={3}
                      fill="#f59e0b"
                      opacity={isHovered ? 1 : 0.85}
                      className="transition-all"
                    />
                  </g>
                );
              })}
            </>
          )}

          {/* Invisible interactive vertical touch columns for easy hover & mobile tap */}
          {chartData.map((_, i) => {
            const x = getX(i);
            return (
              <rect
                key={`touch-${i}`}
                x={x - slotBandWidth / 2}
                y={paddingTop}
                width={slotBandWidth}
                height={innerHeight + 24}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
              />
            );
          })}
        </svg>

        {/* Empty state hint banner when no transactions are recorded yet */}
        {!hasTransactions && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-[1.5px] flex flex-col items-center justify-center p-5 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-2 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Grafik Keuangan Siap Digunakan
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm">
              Grafik arus kas akan otomatis terplot sesuai tanggal pemasukan dan pengeluaran yang Anda catat.
            </p>
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setActiveModal('input-keuangan')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Input Transaksi Sekarang
              </button>
              <button
                onClick={handleSeedSampleData}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Muat Contoh Kas Organisasi
              </button>
            </div>
          </div>
        )}

        {/* Smart Edge-Aware Tooltip Overlay (Never Clipped at Left, Right, or Top) */}
        {hoveredIdx !== null && chartData[hoveredIdx] && (() => {
          const xPercent = (getX(hoveredIdx) / width) * 100;
          const minPtY = Math.min(inPoints[hoveredIdx]?.y ?? height, outPoints[hoveredIdx]?.y ?? height);
          const topPercent = (minPtY / height) * 100;
          const isNearLeft = xPercent < 28;
          const isNearRight = xPercent > 72;
          const isNearTop = topPercent < 42;

          const clampedLeft = isNearLeft
            ? `${Math.max(2, xPercent - 4)}%`
            : isNearRight
            ? `${Math.min(98, xPercent + 4)}%`
            : `${xPercent}%`;

          const clampedTop = isNearTop
            ? `${Math.min(68, topPercent + 8)}%`
            : `${Math.max(12, topPercent - 6)}%`;

          const translateX = isNearLeft ? '0%' : isNearRight ? '-100%' : '-50%';
          const translateY = isNearTop ? '0%' : '-100%';

          return (
            <div
              className="absolute z-30 pointer-events-none bg-slate-900/95 dark:bg-slate-950/95 text-white rounded-2xl px-3.5 py-2.5 shadow-2xl border border-slate-700 backdrop-blur-md transition-all duration-100"
              style={{
                left: clampedLeft,
                top: clampedTop,
                transform: `translate(${translateX}, ${translateY})`,
              }}
            >
              <p className="font-bold text-center text-xs text-slate-200 pb-1.5 border-b border-slate-700/80">
                {chartData[hoveredIdx].fullLabel}
              </p>
              <div className="space-y-1 mt-1.5 min-w-[155px]">
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-1.5 text-blue-300">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                    <span>Pemasukan:</span>
                  </div>
                  <span className="font-bold text-white font-mono">
                    {formatRupiah(chartData[hoveredIdx].totalIn)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pengeluaran:</span>
                  </div>
                  <span className="font-bold text-white font-mono">
                    {formatRupiah(chartData[hoveredIdx].totalOut)}
                  </span>
                </div>

                <div className="pt-1 mt-1 border-t border-slate-800 flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-slate-400 font-medium">Saldo Akhir:</span>
                  <span
                    className={`font-extrabold font-mono ${
                      chartData[hoveredIdx].net >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {chartData[hoveredIdx].net >= 0 ? '+' : ''}
                    {formatRupiah(chartData[hoveredIdx].net)}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Selected / Active Month Detail Strip (Always visible for edge/mobile clarity) */}
      {hasTransactions && chartData.length > 0 && (() => {
        const activeSlot =
          hoveredIdx !== null && chartData[hoveredIdx]
            ? chartData[hoveredIdx]
            : chartData[chartData.length - 1];
        return (
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {hoveredIdx !== null ? 'Detail Bulan:' : 'Bulan Terakhir:'}{' '}
              <span className="text-slate-900 dark:text-white font-bold">{activeSlot.fullLabel}</span>
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Masuk: {formatRupiah(activeSlot.totalIn)}
              </span>
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Keluar: {formatRupiah(activeSlot.totalOut)}
              </span>
              <span
                className={`font-bold ${
                  activeSlot.net >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                Saldo: {activeSlot.net >= 0 ? '+' : ''}
                {formatRupiah(activeSlot.net)}
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
