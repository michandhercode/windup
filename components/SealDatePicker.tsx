'use client';

import { useState } from 'react';
import { Lock, Calendar, Clock, AlertCircle, X } from 'lucide-react';

interface SealDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sealUntilISO: string) => void;
}

export default function SealDatePicker({ isOpen, onClose, onConfirm }: SealDatePickerProps) {
  // Default date set to tomorrow
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('12:00');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Validate date and time before sealing
  const handleConfirm = () => {
    if (!date) {
      setError('Please select a date.');
      return;
    }

    const selectedDateTime = new Date(`${date}T${time || '12:00'}`);
    if (selectedDateTime <= new Date()) {
      setError('Selected date and time must be in the future.');
      return;
    }

    setError('');
    onConfirm(selectedDateTime.toISOString());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/20 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/60 dark:border-amber-900/40 shadow-xl p-5 space-y-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100">Seal Time Capsule</h3>
              <p className="text-[11px] text-stone-400">Select unlock date and time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Date and Time Inputs */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-500" /> Date
            </label>
            <input 
              type="date" 
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setDate(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3 py-2 rounded-xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 text-xs font-medium text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" /> Time
            </label>
            <input 
              type="time" 
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3 py-2 rounded-xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 text-xs font-medium text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Confirm & Seal</span>
          </button>
        </div>

      </div>
    </div>
  );
}