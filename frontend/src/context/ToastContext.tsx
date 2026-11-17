import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.duration ?? 4000;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef(Date.now());

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 200);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    if (duration <= 0) return;

    if (!isPaused) {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, remainingTimeRef.current);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, duration, handleDismiss]);

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';
  const isInfo = toast.type === 'info';

  const progressBarColor = isSuccess
    ? 'bg-signal-emerald'
    : isError
    ? 'bg-signal-rose'
    : isWarning
    ? 'bg-signal-amber'
    : 'bg-asphalt-900';

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`
        relative overflow-hidden pointer-events-auto rounded-lg px-3 py-2 border shadow-tactile-card backdrop-blur-md flex gap-2.5 transition-all duration-200 max-w-sm
        bg-white/95 text-asphalt-900 border-concrete-300
        ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}
        ${isSuccess ? 'border-l-[3px] border-l-signal-emerald' : ''}
        ${isError ? 'border-l-[3px] border-l-signal-rose' : ''}
        ${isWarning ? 'border-l-[3px] border-l-signal-amber' : ''}
        ${isInfo ? 'border-l-[3px] border-l-asphalt-900' : ''}
        ${toast.title ? 'items-start' : 'items-center'}
      `}
      role="alert"
    >
      {/* Minimal Status Icon */}
      <div className="shrink-0">
        {isSuccess && (
          <div className="w-5 h-5 rounded-full bg-emerald-50 text-signal-emerald flex items-center justify-center border border-emerald-200/60">
            <Check className="w-3 h-3 stroke-[2.5]" />
          </div>
        )}
        {isError && (
          <div className="w-5 h-5 rounded-full bg-rose-50 text-signal-rose flex items-center justify-center border border-rose-200/60">
            <AlertCircle className="w-3 h-3 stroke-[2.5]" />
          </div>
        )}
        {isWarning && (
          <div className="w-5 h-5 rounded-full bg-amber-50 text-signal-amber flex items-center justify-center border border-amber-200/60 font-bold">
            <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
          </div>
        )}
        {isInfo && (
          <div className="w-5 h-5 rounded-full bg-concrete-100 text-asphalt-700 flex items-center justify-center border border-concrete-200">
            <Info className="w-3 h-3 stroke-[2.5]" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 pr-0.5">
        {toast.title && (
          <div className="text-xs font-semibold text-asphalt-900 leading-tight">
            {toast.title}
          </div>
        )}
        <div className={`text-xs text-asphalt-800 font-medium leading-snug break-words ${toast.title ? 'mt-0.5' : ''}`}>
          {toast.message}
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="text-concrete-400 hover:text-asphalt-800 hover:bg-concrete-200/60 p-1 rounded transition-colors shrink-0 cursor-pointer"
        title="Dismiss"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress Timer Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-concrete-100 overflow-hidden">
          <div
            className={`h-full ${progressBarColor}`}
            style={{
              animation: `toastProgress ${duration}ms linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, title?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title, duration }]);
  }, []);

  const toastMethods = {
    success: (msg: string, title?: string, duration?: number) => addToast('success', msg, title, duration),
    error: (msg: string, title?: string, duration?: number) => addToast('error', msg, title, duration),
    warning: (msg: string, title?: string, duration?: number) => addToast('warning', msg, title, duration),
    info: (msg: string, title?: string, duration?: number) => addToast('info', msg, title, duration),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}

      {/* Floating Toast Container */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none select-none items-end max-w-sm w-full"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
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
