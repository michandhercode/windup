'use client';

import { MailOpen, Mail } from 'lucide-react';
import AlertModal from '@/components/AlertModal';
import { useUserEmail } from '@/lib/hooks/useUserEmail';

interface SealedOpenConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirmation shown before a sealed letter is opened. Always shows the logged-in email + the email-notification notice. */
export default function SealedOpenConfirm({ isOpen, onClose, onConfirm }: SealedOpenConfirmProps) {
  const email = useUserEmail() ?? 'no email on file';

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
      <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0" />
          <span className="font-semibold">Logged in as:</span>
          <span className="min-w-0 break-all font-bold">{email}</span>
        </div>
        <p className="leading-relaxed">
          {`Once confirmed, this sealed letter will be opened and an email notification will be sent to your account (${email}).`}
        </p>
      </div>
    </AlertModal>
  );
}