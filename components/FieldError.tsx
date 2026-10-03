import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
  /** Referenced by the input's `aria-describedby`. */
  id: string;
  message?: string;
}

/** Inline validation message shown directly under a form field. */
export default function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" />
      <span>{message}</span>
    </p>
  );
}

/** Shared text-input styling for the auth forms; `hasError` swaps the border/focus colors to rose. */
export const getAuthInputClass = (hasError: boolean, paddingClass: string): string =>
  `w-full ${paddingClass} py-3 rounded-2xl border bg-amber-50/30 dark:bg-slate-800/50 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:outline-hidden transition-all disabled:opacity-50 ${
    hasError
      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-400/50 focus:border-rose-500'
      : 'border-amber-200/80 dark:border-slate-700 focus:ring-rose-400/50 focus:border-rose-400'
  }`;