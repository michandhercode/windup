/**
 * Shown instantly while a dashboard page loads its data on the server, so switching tabs responds
 * right away (the Navbar stays put) instead of freezing until the data arrives.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60dvh] items-center justify-center"
    >
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-400/70 dark:bg-sky-300/60" />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-400/70 [animation-delay:150ms] dark:bg-sky-300/60" />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-400/70 [animation-delay:300ms] dark:bg-sky-300/60" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}