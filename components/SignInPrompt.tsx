'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Send, LogIn } from 'lucide-react';
import AlertModal from '@/components/AlertModal';

/** What the guest tried to do. Only changes the wording and icon of the prompt. */
export type SignInPromptReason = 'like' | 'release' | 'save';

const COPY: Record<SignInPromptReason, { title: string; description: string }> = {
  like: {
    title: 'Sign in to resonate',
    description:
      'Likes belong to your own account, so the author knows a real person felt their words. Sign in or create a free space to send a little warmth back.',
  },
  release: {
    title: 'Sign in to release a plane',
    description:
      'Paper planes are tied to your account, so your thoughts and daily planes stay yours alone. Sign in or create a free space to let your first one fly.',
  },
  save: {
    title: 'Sign in to keep your thoughts',
    description:
      'Your jar is private to your account. Sign in or create a free space to save drafts, seal letters and keep your thoughts safe.',
  },
};

interface SignInPromptProps {
  isOpen: boolean;
  onClose: () => void;
  reason: SignInPromptReason;
}

/**
 * Friendly "join us" dialog shown when a guest (read-only mode) tries to like a plane or write a thought.
 * Nothing is executed before this appears: the caller simply opens it instead of running the action.
 */
export default function SignInPrompt({ isOpen, onClose, reason }: SignInPromptProps) {
  const router = useRouter();
  const { title, description } = COPY[reason];

  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="You are browsing as a guest"
      description={description}
      icon={reason === 'like' ? Heart : Send}
      variant="primary"
      showClose
      cancelLabel="Maybe later"
      confirmLabel="Sign In"
      confirmIcon={LogIn}
      onConfirm={() => router.push('/login')}
    >
      <p className="text-xs text-slate-500 dark:text-slate-400">
        New here?{' '}
        <Link href="/signup" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline underline-offset-4">
          Create a free account
        </Link>
        . You can keep reading The Sky as a guest any time.
      </p>
    </AlertModal>
  );
}