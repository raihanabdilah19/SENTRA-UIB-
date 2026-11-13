import React, { useRef, useState } from 'react';
import { X, Printer, Download, FileSpreadsheet, Loader2, FileDown } from 'lucide-react';
import { TransaksiKeuanganItem } from '../../types';
import { exportKeuanganToExcel, formatRupiah } from '../../services/storage';
import { exportElementToPdfA4 } from '../../services/pdfExport';
import { useApp } from '../../context/AppContext';

interface PrintA4KeuanganModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransaksiKeuanganItem[];
}

export const PrintA4KeuanganModal: React.FC<PrintA4KeuanganModalProps> = ({
  isOpen,
  onClose,
  transactions,
}) => {
  const { showToast } = useApp();
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    try {
      setIsExportingPdf(true);
      const filename = `Laporan_Kas_Keuangan_A4_${new Date().toISOString().split('T')[0]}.pdf`;
      await exportElementToPdfA4(printAreaRef.current, {
        orientation: 'landscape',
        filename,
      });
      showToast('PDF Berhasil Diunduh', `File ${filename} berhasil disimpan dalam format A4 siap cetak.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal Unduh PDF', 'Terjadi kesalahan saat memproses PDF, membuka dialog cetak sistem.', 'error');
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadExcel = () => {
    const filename = `Laporan_Keuangan_Kas_A4_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportKeuanganToExcel(transactions, filename);
    showToast('Excel Berhasil Diunduh', `Spreadsheet ${filename} berhasil diunduh dalam format A4.`, 'success');
  };

  const totalPemasukan = transactions
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalPengeluaran = transactions
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const latestSaldo = transactions.length > 0 ? transactions[0].saldoSetelah : 0;

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="print:hidden px-6 py-4 bg-[#0a1738] text-white flex items-center justify-between shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Format Cetak & Spreadsheet A4 Buku Kas Keuangan
              </h3>
              <p className="text-xs text-blue-200/80">
                Pemasukan, Pengeluaran & Saldo Akhir rapi standar kertas A4 (Lanskap) siap unduh PDF / cetak
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Unduh file Excel (.xlsx) dengan tata letak A4"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Unduh Excel (.xlsx)</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              title="Unduh dokumen langsung dalam format file PDF A4"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Unduh PDF A4</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Buka dialog cetak browser / printer fisik"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Cetak / Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
          {/* Printable A4 Paper Preview */}
          <div
            id="printable-a4-area"
            ref={printAreaRef}
            className="w-full max-w-4xl bg-white text-slate-900 p-8 sm:p-10 shadow-lg border border-slate-300 rounded-sm font-sans text-xs print:p-0 print:shadow-none print:border-none print:w-full print:max-w-none"
            style={{ minHeight: '210mm' }}
          >
            {/* Kop Resmi Universitas Islam Bogor */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/aistudio/B443C882-D294-49A8-AAE7-73DBA70A68D5_d8b6524b.jpg"
                  alt="Logo UIB"
                  className="w-16 h-16 object-contain shrink-0"
                />
                <div>
                  <h1 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                    UNIVERSITAS ISLAM BOGOR
                  </h1>
                  <h2 className="text-sm font-bold text-slate-800">
                    SENTRA UIB - SISTEM ELEKTRONIK ADMINISTRASI ORGANISASI
                  </h2>
                  <p className="text-[11px] text-slate-600 italic">
                    "Tertib Administrasi, Progresif Berorganisasi"
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded-md bg-slate-100 border border-slate-300 text-slate-800 uppercase">
                  Format Standar A4
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Dicetak: {printDate}</p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 underline decoration-1 underline-offset-4">
                BUKU KAS KEUANGAN ORGANISASI
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Rekapitulasi Arus Kas: Pemasukan, Pengeluaran, dan Saldo Akhir
              </p>
            </div>

            {/* Ringkasan Kas Banner */}
            <div className="grid grid-cols-3 gap-3 my-4 p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Total Pemasukan</p>
                <p className="text-sm font-extrabold text-emerald-600 mt-0.5">
                  +{formatRupiah(totalPemasukan)}
                </p>
              </div>
              <div className="border-x border-slate-300">
                <p className="text-[10px] uppercase font-bold text-slate-500">Total Pengeluaran</p>
                <p className="text-sm font-extrabold text-amber-600 mt-0.5">
                  -{formatRupiah(totalPengeluaran)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Saldo Akhir</p>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {formatRupiah(latestSaldo)}
                </p>
              </div>
            </div>

            {/* Table: Pemasukan, Pengeluaran, Saldo Akhir */}
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left border-collapse border border-slate-900 text-[10.5px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900 text-center">
                    <th className="py-2 px-2 border-r border-slate-900 w-8">No</th>
                    <th className="py-2 px-2.5 border-r border-slate-900 whitespace-nowrap w-24">
                      Tanggal
                    </th>
                    <th className="py-2 px-3 border-r border-slate-900 text-left">
                      Uraian / Keterangan Transaksi
                    </th>
                    <th className="py-2 px-2.5 border-r border-slate-900 text-left w-24">
                      Kategori
                    </th>
                    <th className="py-2 px-2.5 border-r border-slate-900 text-right w-28 text-emerald-800">
                      Pemasukan (Rp)
                    </th>
                    <th className="py-2 px-2.5 border-r border-slate-900 text-right w-28 text-amber-800">
                      Pengeluaran (Rp)
                    </th>
                    <th className="py-2 px-2.5 border-r border-slate-900 text-right w-30 font-bold">
                      Saldo Akhir (Rp)
                    </th>
                    <th className="py-2 px-2.5 border-slate-900 text-left w-24">
                      PJ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                        Belum ada catatan transaksi keuangan.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((trx, idx) => (
                      <tr
                        key={trx.id}
                        className={`border-b border-slate-300 ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}
                      >
                        <td className="py-1.5 px-2 border-r border-slate-900 text-center font-semibold">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2.5 border-r border-slate-900 whitespace-nowrap">
                          {trx.tanggal}
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-900 font-medium">
                          {trx.keterangan}
                        </td>
                        <td className="py-1.5 px-2.5 border-r border-slate-900">
                          {trx.kategori}
                        </td>
                        <td className="py-1.5 px-2.5 border-r border-slate-900 text-right font-semibold text-emerald-700">
                          {trx.jenis === 'Pemasukan' ? formatRupiah(trx.nominal) : '-'}
                        </td>
                        <td className="py-1.5 px-2.5 border-r border-slate-900 text-right font-semibold text-amber-700">
                          {trx.jenis === 'Pengeluaran' ? formatRupiah(trx.nominal) : '-'}
                        </td>
                        <td className="py-1.5 px-2.5 border-r border-slate-900 text-right font-bold font-mono">
                          {formatRupiah(trx.saldoSetelah)}
                        </td>
                        <td className="py-1.5 px-2.5">
                          {trx.penanggungJawab}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t border-slate-900">
                    <td colSpan={4} className="py-2 px-3 border-r border-slate-900 text-center uppercase tracking-wide">
                      TOTAL REKAPITULASI
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-900 text-right text-emerald-800">
                      {formatRupiah(totalPemasukan)}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-900 text-right text-amber-800">
                      {formatRupiah(totalPengeluaran)}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-900 text-right font-extrabold font-mono">
                      {formatRupiah(latestSaldo)}
                    </td>
                    <td className="py-2 px-2.5 text-center text-[10px] text-slate-500">
                      Valid
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signature Block */}
            <div className="mt-8 pt-4 flex justify-between items-start text-[11px] text-slate-900 page-break-inside-avoid">
              <div className="text-center w-48">
                <p>Mengetahui,</p>
                <p className="font-bold">Ketua Umum</p>
                <div className="h-16" />
                <p className="font-bold underline uppercase">( ........................................ )</p>
                <p className="text-[10px] text-slate-500">NIM. .............................</p>
              </div>

              <div className="text-center w-52">
                <p>Bogor, {printDate}</p>
                <p className="font-bold">Bendahara Umum</p>
                <div className="h-16" />
                <p className="font-bold underline uppercase">( ........................................ )</p>
                <p className="text-[10px] text-slate-500">NIM. .............................</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
