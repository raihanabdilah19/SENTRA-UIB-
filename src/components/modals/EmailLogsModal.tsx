import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getEmailLogs, sendSimulatedEmail, EmailLog } from '../../services/notificationService';

export const EmailLogsModal: React.FC = () => {
  const { activeModal, setActiveModal, showToast, state } = useApp();
  const [logs, setLogs] = useState<EmailLog[]>(() => getEmailLogs());
  const [testEmail, setTestEmail] = useState(state.integrations.notificationEmail || 'raihanabdilah19@gmail.com');
  const [testSubject, setTestSubject] = useState('Pemberitahuan Agenda Penting: Evaluasi Kabinet');

  if (activeModal !== 'email-logs') return null;

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = sendSimulatedEmail(
      testEmail,
      testSubject,
      `Halo Pengurus,\n\nIni adalah pengujian otomatis pengiriman email notifikasi dari SENTRA UIB.\n\nSistem bekerja secara optimal.\n\nWaktu: ${new Date().toLocaleString('id-ID')}`
    );
    setLogs((prev) => [newLog, ...prev]);
    showToast('Email Notifikasi Terkirim', `Terkirim ke ${testEmail}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#0a1738] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/40 border border-blue-400/30 flex items-center justify-center text-blue-200">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Log Notifikasi Email Otomatis</h3>
              <p className="text-xs text-blue-200/80">Riwayat pengiriman surat digital dan pembaruan penting</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Test Sender Box */}
          <form onSubmit={handleSendTest} className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 space-y-3">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold">
              <Send className="w-4 h-4 text-blue-600" />
              <span>Kirim Email Percobaan Otomatis</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Alamat email penerima"
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
              />
              <input
                type="text"
                required
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
                placeholder="Subjek email"
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" /> Kirimkan Notifikasi Email Sekarang
            </button>
          </form>

          {/* Email Logs List */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm flex items-center justify-between">
              <span>Riwayat Pengiriman Otomatis</span>
              <span className="text-slate-400 font-normal text-xs">{logs.length} pesan tercatat</span>
            </h4>
            <div className="space-y-2.5">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {log.subject}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> {log.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    <span>Kepada: <strong className="text-slate-700 dark:text-slate-300">{log.recipient}</strong></span>
                    <span>{log.sentAt}</span>
                  </div>
                  <pre className="text-[11px] font-sans text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl whitespace-pre-wrap leading-relaxed">
                    {log.body}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
