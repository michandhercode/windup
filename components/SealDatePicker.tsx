'use client';

import { useState } from 'react';
import { Lock, Calendar, Clock, AlertCircle } from 'lucide-react';
import AlertModal from '@/components/AlertModal';

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
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      title="Seal Time Capsule"
      subtitle="Select unlock date and time"
      icon={Lock}
      variant="warning"
      confirmLabel="Confirm & Seal"
      confirmIcon={Lock}
      onConfirm={handleConfirm}
    >
      {/* Error message */}
      {error && (
        <div className="bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-300 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Date and Time Inputs */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
        <div className="space-y-1 min-w-0">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-600" /> Date
          </label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              setDate(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
          />
        </div>

        <div className="space-y-1 min-w-0">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
          />
        </div>
      </div>
    </AlertModal>
  );
}