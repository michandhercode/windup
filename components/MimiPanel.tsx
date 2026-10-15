'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Loader2, Moon, Send } from 'lucide-react';
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
  useLocalStorageItem,
} from '@/lib/hooks/useLocalStorage';
import { createClient } from '@/utils/supabase/client';
import { useNow } from '@/lib/hooks/useNow';
import { toDateKey } from '@/lib/daily-release';

interface MimiPanelProps {
  /** Mimi's API route requires a Supabase session, so guests see a sign-in note instead of the chat input. */
  isAuthenticated: boolean;
}

const MIMI_IMAGE_SRC = '/mimi/mimi_agent.webp';

/** Max characters per message to Mimi (keeps token use low and replies focused). */
const MAX_INPUT_LENGTH = 400;
/** The character counter appears once the message reaches this share of the limit. */
const COUNTER_SHOW_RATIO = 0.8;
/** The counter turns amber at this share of the limit. */
const COUNTER_WARN_RATIO = 0.9;

/** How many messages a person can send to Mimi per calendar day. */
const MAX_DAILY_MIMI_MESSAGES = 10;

/**
 * localStorage keys. They are scoped per account (`<prefix>:<user id>`), so two accounts on the same browser
 * each keep their own battery, and logging out and back in does not hand out a fresh 10 messages.
 */
const MIMI_DATE_KEY_PREFIX = 'windup_mimi_date'; // value: "YYYY-MM-DD" (local time)
const MIMI_COUNT_KEY_PREFIX = 'windup_mimi_count'; // value: number

/** Old, account-less keys. They were shared by every account on the device, so they are discarded. */
const LEGACY_MIMI_KEYS = ['windup_mimi_date', 'windup_mimi_count'] as const;

/** Placeholder used only to read storage while no user is known (nothing is ever written under it). */
const NO_USER_ID = 'anonymous';

const mimiKeysFor = (userId: string) => ({
  date: `${MIMI_DATE_KEY_PREFIX}:${userId}`,
  count: `${MIMI_COUNT_KEY_PREFIX}:${userId}`,
});

const REST_MESSAGE = "Mimi is resting for today. Her battery will be full again tomorrow, so come back then to write more together.";

// Created once at module level so the transport (and the chat) is stable across re-renders.
const chatTransport = new DefaultChatTransport({ api: '/api/chat' });

const parseCount = (raw: string | null): number => {
  const value = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

/** Pure: messages used today. A stored date from another day means a fresh day, so 0. */
const getUsedToday = (storedDate: string | null, storedCount: string | null, todayKey: string): number =>
  storedDate === todayKey ? parseCount(storedCount) : 0;

/**
 * The signed-in account's id, taken from the Supabase session (read locally, no network round trip).
 * `undefined` = still checking, `null` = nobody is signed in. Follows sign-in, sign-out and account switches.
 */
function useAuthUserId(): string | null | undefined {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const { data } = createClient().auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return userId;
}

/** Event handlers only: counts one message for this account if Mimi still has energy today. Returns false when she is resting. */
function tryConsumeMimiMessage(userId: string): boolean {
  const keys = mimiKeysFor(userId);
  const todayKey = toDateKey(new Date());
  const used = getUsedToday(getLocalStorageItem(keys.date), getLocalStorageItem(keys.count), todayKey);
  if (used >= MAX_DAILY_MIMI_MESSAGES) return false;
  setLocalStorageItem(keys.date, todayKey);
  setLocalStorageItem(keys.count, String(used + 1));
  return true;
}

/** Hydration-safe usage for rendering (server snapshot is empty storage, date comes from useNow). */
function useMimiUsage(userId: string | null | undefined) {
  const now = useNow();
  const keys = mimiKeysFor(userId ?? NO_USER_ID);
  const storedDate = useLocalStorageItem(keys.date);
  const storedCount = useLocalStorageItem(keys.count);
  const used = Math.min(getUsedToday(storedDate, storedCount, toDateKey(new Date(now))), MAX_DAILY_MIMI_MESSAGES);
  return {
    used,
    remaining: MAX_DAILY_MIMI_MESSAGES - used,
    isResting: used >= MAX_DAILY_MIMI_MESSAGES,
  };
}

/** Cute battery: one segment per message, draining as the day's messages are used. */
function MimiBattery({ remaining }: { remaining: number }) {
  const fillColor =
    remaining > 5 ? 'bg-emerald-500' : remaining > 2 ? 'bg-amber-400' : 'bg-rose-400';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        role="img"
        aria-label={`Mimi's energy: ${remaining} of ${MAX_DAILY_MIMI_MESSAGES} messages left today`}
        className="flex items-center"
      >
        <div className="flex gap-0.5 rounded-lg border-2 border-current/30 p-0.5">
          {Array.from({ length: MAX_DAILY_MIMI_MESSAGES }, (_, i) => (
            <span
              key={i}
              className={`h-3.5 w-2 rounded-xs transition-colors duration-300 ${
                i < remaining ? fillColor : 'bg-current/10'
              }`}
            />
          ))}
        </div>
        {/* Battery nub */}
        <span className="ml-0.5 h-2.5 w-1 rounded-r-sm bg-current/30" />
      </div>
      <p className="text-[10px] font-semibold tracking-wide opacity-70">
        {remaining === 0 ? 'Resting' : `Energy ${remaining}/${MAX_DAILY_MIMI_MESSAGES}`}
      </p>
    </div>
  );
}

export default function MimiPanel({ isAuthenticated }: MimiPanelProps) {
  const userId = useAuthUserId();

  // One-time cleanup of the old shared keys, so a previous account's count can never leak into this one.
  useEffect(() => {
    LEGACY_MIMI_KEYS.forEach(removeLocalStorageItem);
  }, []);

  // `key` remounts the chat when the account changes, so one account's conversation is never shown to the next.
  return <MimiChat key={userId ?? 'guest'} userId={userId} isAuthenticated={isAuthenticated} />;
}

interface MimiChatProps extends MimiPanelProps {
  /** `undefined` while the session is still being checked, `null` when signed out. */
  userId: string | null | undefined;
}

function MimiChat({ isAuthenticated, userId }: MimiChatProps) {
  const { messages, sendMessage, status, error } = useChat({ transport: chatTransport });
  const [input, setInput] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const { remaining, isResting } = useMimiUsage(userId);

  const isBusy = status === 'submitted' || status === 'streaming';

  const inputLength = input.length;
  const showCounter = inputLength >= MAX_INPUT_LENGTH * COUNTER_SHOW_RATIO;
  const counterColor =
    inputLength >= MAX_INPUT_LENGTH
      ? 'text-rose-600 dark:text-rose-400 font-semibold'
      : inputLength >= MAX_INPUT_LENGTH * COUNTER_WARN_RATIO
      ? 'text-amber-600 dark:text-amber-400'
      : 'opacity-60';

  // Keep the newest message in view by scrolling the chat log itself (never the page).
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status, error]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || text.length > MAX_INPUT_LENGTH || isBusy || isResting) return;
    // The battery belongs to an account, so wait until we know which one is signed in.
    if (!userId) return;
    // Fresh read of today's count right before sending, so the 10-message limit cannot be skipped.
    if (!tryConsumeMimiMessage(userId)) return;
    sendMessage({ text });
    setInput('');
  };

  return (
    <div
      className="w-full min-w-0 rounded-3xl border p-4 sm:p-5 space-y-4 shadow-xs transition-colors duration-200"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        color: 'var(--text-main)',
      }}
    >
      <div className="flex items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
        <h2 className="text-xs font-bold tracking-wider uppercase opacity-80">Ask Mimi</h2>
        <span className="shrink-0 text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 px-2.5 py-0.5 rounded-full font-bold">
          Companion
        </span>
      </div>

      {/* Intro: centered avatar, description directly below it, then the energy battery */}
      <div className="flex flex-col items-center gap-3 text-center">
        <img
          src={MIMI_IMAGE_SRC}
          alt="Mimi companion"
          className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 object-contain drop-shadow-md select-none"
          draggable={false}
        />
        <p className="max-w-xs text-[11px] leading-relaxed opacity-75 break-words">
          Your quiet papercraft companion to help you reflect, write letters, and sort through your thoughts.
        </p>
        <MimiBattery remaining={remaining} />
      </div>

      <div className="w-full min-w-0 space-y-4">
        {/* Chat log: fixed max height, scrolls internally (scrollbar hidden, wheel/trackpad/touch still work) */}
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          className="w-full min-w-0 overflow-y-auto overscroll-contain scroll-smooth space-y-2.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ maxHeight: '18rem' }}
        >
          <div className="max-w-[90%] p-3 rounded-2xl rounded-tl-sm bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs leading-relaxed text-emerald-900 dark:text-emerald-200 break-words">
            Hello, I&apos;m Mimi. Tell me what&apos;s on your mind, and I&apos;ll help you turn it into a letter.
          </div>

          {messages.map((message) => {
            const text = message.parts
              .map((part) => (part.type === 'text' ? part.text : ''))
              .join('');
            if (!text) return null;
            const isUser = message.role === 'user';
            return (
              <div key={message.id} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    isUser
                      ? 'max-w-[90%] p-3 rounded-2xl rounded-tr-sm bg-stone-500/10 border text-xs leading-relaxed whitespace-pre-wrap break-words'
                      : 'max-w-[90%] p-3 rounded-2xl rounded-tl-sm bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs leading-relaxed text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap break-words'
                  }
                  style={isUser ? { borderColor: 'var(--card-border)' } : undefined}
                >
                  {text}
                </div>
              </div>
            );
          })}

          {status === 'submitted' && (
            <div className="flex items-center gap-1.5 text-[11px] opacity-70">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Mimi is thinking...
            </div>
          )}

          {error && (
            <div className="space-y-1">
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                Mimi is taking a short pause. Your letter is still safe here; please try again in a moment.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-[10px] font-mono opacity-60 break-words">Dev details: {error.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        {!isAuthenticated ? (
          <p className="text-[11px] leading-relaxed opacity-70">
            Sign in to chat with Mimi. Your letters stay private and are never sent to Mimi unless you share them here.
          </p>
        ) : isResting ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 p-3 text-[11px] leading-relaxed text-amber-900 dark:text-amber-200"
          >
            <Moon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-400" aria-hidden="true" />
            <span>{REST_MESSAGE}</span>
          </div>
        ) : (
          <div className="space-y-1">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={MAX_INPUT_LENGTH}
                placeholder="Tell Mimi what's on your mind..."
                aria-label="Message Mimi"
                className="min-w-0 flex-1 rounded-full border bg-transparent px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-400/50"
                style={{ borderColor: 'var(--card-border)' }}
              />
              <button
                type="submit"
                disabled={isBusy || !input.trim()}
                aria-label="Send message to Mimi"
                className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Subtle character counter: only shown when the message gets close to the limit */}
            {showCounter && (
              <p className={`pr-12 text-right text-[10px] font-mono ${counterColor}`} aria-live="polite">
                {inputLength} / {MAX_INPUT_LENGTH}
              </p>
            )}
          </div>
        )}

        <p className="text-[10px] leading-relaxed opacity-60">
          Mimi is an AI companion. She responds only when you ask.
        </p>
      </div>
    </div>
  );
}