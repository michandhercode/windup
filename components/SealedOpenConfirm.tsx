'use client';

import { MailOpen } from 'lucide-react';
import AlertModal from '@/components/AlertModal';

interface SealedOpenConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirmation shown before a sealed letter is opened. */
export default function SealedOpenConfirm({ isOpen, onClose, onConfirm }: SealedOpenConfirmProps) {
  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      title="Open Sealed Letter?"
      subtitle="Your time capsule is ready"
      icon={MailOpen}
      variant="warning"
      confirmLabel="Open Letter"
      confirmIcon={MailOpen}
      onConfirm={onConfirm}
      description="This letter has reached its unlock date. Are you ready to read it?"
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
        <p className="leading-relaxed font-medium">
          Once confirmed, this time capsule will be unlocked and moved directly to your Kept jar.
        </p>
      </div>
    </AlertModal>
  );
}