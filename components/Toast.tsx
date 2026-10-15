'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const MAX_VISIBLE_TOASTS = 3;
const DURATION_MS: Record<ToastVariant, number> = { success: 4000, info: 4000, error: 6000 };

// Colors match the inline banners already used across the app (emerald / rose / sky).
const VARIANT_STYLES: Record<ToastVariant, { box: string; icon: string; Icon: typeof Info }> = {
  success: {
    box: 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
    icon: 'text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  error: {
    box: 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100',
    icon: 'text-rose-600 dark:text-rose-400',
    Icon: AlertCircle,
  },
  info: {
    box: 'bg-sky-50 dark:bg-sky-950/90 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-100',
    icon: 'text-sky-600 dark:text-sky-400',
    Icon: Info,
  },
};

// Outside a provider the calls are harmless no-ops, so a component using toasts can never crash a page.
const noop = () => {};
const ToastContext = createContext<ToastApi>({ success: noop, error: noop, info: noop });

/** `const toast = useToast(); toast.success('Saved!')` */
export const useToast = () => useContext(ToastContext);

/**
 * Lives in the dashboard layout, so a toast raised just before a navigation (e.g. "Letter folded" followed by
 * a redirect to the Jar) stays on screen on the next page.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => {
        // A double click should not stack identical toasts
        if (prev.some((t) => t.variant === variant && t.message === message)) return prev;
        const next = [...prev, { id, variant, message }];
        // Keep the screen calm: only the newest few stay
        next.slice(0, Math.max(0, next.length - MAX_VISIBLE_TOASTS)).forEach((old) => {
          const timer = timers.current.get(old.id);
          if (timer) clearTimeout(timer);
          timers.current.delete(old.id);
        });
        return next.slice(-MAX_VISIBLE_TOASTS);
      });
      timers.current.set(id, setTimeout(() => dismiss(id), DURATION_MS[variant]));
    },
    [dismiss]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('error', message),
      info: (message) => show('info', message),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {toasts.map(({ id, variant, message }) => {
          const { box, icon, Icon } = VARIANT_STYLES[variant];
          return (
            <div
              key={id}
              role={variant === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-2xl border p-3.5 text-xs font-semibold shadow-lg backdrop-blur-xs animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none ${box}`}
            >
              <Icon className={`mt-px h-4 w-4 shrink-0 ${icon}`} aria-hidden="true" />
              <span className="min-w-0 flex-1 break-words leading-relaxed">{message}</span>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Dismiss notification"
                className="-m-1 shrink-0 cursor-pointer rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}