import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, title?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toastMethods = {
    success: (msg: string, title?: string) => addToast('success', msg, title || 'Success'),
    error: (msg: string, title?: string) => addToast('error', msg, title || 'Error'),
    warning: (msg: string, title?: string) => addToast('warning', msg, title || 'Notice'),
    info: (msg: string, title?: string) => addToast('info', msg, title || 'Information'),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}

      {/* Floating Toast Container */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';
          const isInfo = t.type === 'info';

          return (
            <div
              key={t.id}
              className={`
                pointer-events-auto rounded p-3.5 border shadow-2xl flex items-start gap-3 transition-all duration-200
                bg-asphalt-950 text-white border-concrete-300/40
                ${isSuccess ? 'border-emerald-500/50 shadow-emerald-950/20' : ''}
                ${isError ? 'border-red-500/50 shadow-red-950/20' : ''}
                ${isWarning ? 'border-amber-500/50 shadow-amber-950/20' : ''}
              `}
              role="alert"
            >
              {/* Tactical Status Pill Icon */}
              <div className="shrink-0 mt-0.5">
                {isSuccess && (
                  <div className="w-5 h-5 rounded bg-signal-emerald text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}
                {isError && (
                  <div className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center">
                    <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}
                {isWarning && (
                  <div className="w-5 h-5 rounded bg-signal-amber text-asphalt-950 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}
                {isInfo && (
                  <div className="w-5 h-5 rounded bg-concrete-700 text-white flex items-center justify-center">
                    <Info className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pr-1">
                {t.title && (
                  <div className="font-mono text-xs font-bold text-white tracking-wider uppercase mb-0.5">
                    {t.title}
                  </div>
                )}
                <div className="text-xs text-asphalt-200 leading-relaxed break-words font-sans">
                  {t.message}
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-asphalt-400 hover:text-white p-1 rounded hover:bg-asphalt-800 transition shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};

