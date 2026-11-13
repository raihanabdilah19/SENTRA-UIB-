import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let colorClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-100 dark:border-emerald-700';
        let iconColor = 'text-emerald-500';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          colorClass = 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950/80 dark:text-red-100 dark:border-red-700';
          iconColor = 'text-red-500';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          colorClass = 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/80 dark:text-amber-100 dark:border-amber-700';
          iconColor = 'text-amber-500';
        } else if (toast.type === 'info') {
          Icon = Info;
          colorClass = 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-100 dark:border-blue-700';
          iconColor = 'text-blue-500';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border-l-4 flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 transition-all ${colorClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs">{toast.title}</h5>
              {toast.description && (
                <p className="text-[11px] opacity-90 mt-0.5 line-clamp-2">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
