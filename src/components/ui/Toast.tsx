import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Icon, type IconName } from './Icon';

/**
 * Toasts — the in-app half of the notification architecture.
 * These are what the patient and staff actually see today; SMS/WhatsApp/push
 * are integration points that report their real (unconfigured) status.
 */

export type ToastTone = 'neutral' | 'success' | 'warn' | 'danger' | 'info';

export interface Toast {
  id: string;
  title: string;
  body?: string;
  tone: ToastTone;
  icon?: IconName;
  duration: number;
}

interface ToastApi {
  push: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONES: Record<ToastTone, { bar: string; icon: string; iconDefault: IconName }> = {
  neutral: { bar: 'bg-stone-500', icon: 'text-stone-500', iconDefault: 'info' },
  success: { bar: 'bg-sage-600', icon: 'text-sage-600', iconDefault: 'checkCircle' },
  warn: { bar: 'bg-clay-500', icon: 'text-clay-700', iconDefault: 'alert' },
  danger: { bar: 'bg-[#A8433C]', icon: 'text-[#8E3730]', iconDefault: 'xCircle' },
  info: { bar: 'bg-navy-600', icon: 'text-navy-600', iconDefault: 'bell' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback<ToastApi['push']>(
    (toast) => {
      const id = `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const duration = toast.duration ?? 5000;
      const next: Toast = { duration, ...toast, id };
      setToasts((list) => [next, ...list].slice(0, 4));
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
    },
    [],
  );

  const api = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <div
              className="pointer-events-none fixed inset-x-0 bottom-0 z-[95] flex flex-col items-center gap-2 px-4 pb-safe sm:inset-x-auto sm:end-4 sm:bottom-4 sm:items-end sm:px-0"
              role="region"
              aria-live="polite"
              aria-label="Notifications"
            >
              {toasts.map((toast) => {
                const tone = TONES[toast.tone];
                return (
                  <div
                    key={toast.id}
                    className="pointer-events-auto flex w-full max-w-sm animate-slide-in overflow-hidden rounded-lg border border-shell-300 bg-white shadow-lift"
                  >
                    <span className={`w-1 shrink-0 ${tone.bar}`} aria-hidden="true" />
                    <div className="flex flex-1 items-start gap-3 px-3.5 py-3">
                      <span className={`mt-0.5 shrink-0 ${tone.icon}`}>
                        <Icon name={toast.icon ?? tone.iconDefault} size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.8125rem] font-semibold text-navy-900">{toast.title}</p>
                        {toast.body ? (
                          <p className="mt-0.5 text-[0.75rem] leading-relaxed text-stone-600">
                            {toast.body}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => dismiss(toast.id)}
                        aria-label="Close"
                        className="-me-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded text-stone-400 transition-colors hover:bg-shell-200 hover:text-navy-800"
                      >
                        <Icon name="x" size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
