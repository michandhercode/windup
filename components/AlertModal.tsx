'use client';

import { useEffect, type ComponentType, type ReactNode } from 'react';
import { X } from 'lucide-react';

export type AlertVariant = 'primary' | 'destructive' | 'warning' | 'info';

interface VariantStyle {
  iconWrap: string;
  confirmBtn: string;
}

const VARIANTS: Record<AlertVariant, VariantStyle> = {
  primary: {
    iconWrap: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300',
    confirmBtn: 'bg-sky-600 hover:bg-sky-700 text-white',
  },
  destructive: {
    iconWrap: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300',
    confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  warning: {
    iconWrap: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
    confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  info: {
    iconWrap: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    confirmBtn: 'bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
  },
};

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Short helper text under the title (optional). */
  subtitle?: string;
  /** Main message. Use `children` for richer content (notices, inputs, etc.). */
  description?: ReactNode;
  children?: ReactNode;
  icon: ComponentType<{ className?: string }>;
  variant?: AlertVariant;
  confirmLabel?: string;
  confirmIcon?: ComponentType<{ className?: string }>;
  cancelLabel?: string;
  /** Omit to render an acknowledgement-only dialog (single "close" button). */
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  /** Show the small X button in the header. */
  showClose?: boolean;
}

/**
 * Standardized popup for every action alert / confirmation in Windup.
 * Layout: backdrop -> card -> [icon + title] -> body -> [Cancel | Confirm].
 */
export default function AlertModal({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  children,
  icon: Icon,
  variant = 'primary',
  confirmLabel = 'Confirm',
  confirmIcon: ConfirmIcon,
  cancelLabel = 'Cancel',
  onConfirm,
  confirmDisabled = false,
  showClose = false,
}: AlertModalProps) {
  // ESC to close + body scroll lock while open
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const styles = VARIANTS[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-[92vw] max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150"
      >
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header: icon + title */}
        <div className="flex items-center gap-3 pr-6">
          <div className={`p-3 rounded-2xl shrink-0 ${styles.iconWrap}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 id="alert-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Body */}
        {description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
        )}
        {children}

        {/* Footer: Cancel (secondary) left, Confirm (primary/destructive) right */}
        <div className="flex items-center gap-2 pt-2">
          {onConfirm ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={confirmDisabled}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmBtn}`}
              >
                {ConfirmIcon && <ConfirmIcon className="w-3.5 h-3.5" />}
                {confirmLabel}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer ${styles.confirmBtn}`}
            >
              {cancelLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}