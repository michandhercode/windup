# Windup - Development Roadmap

Status: aligned with the implemented codebase (October 2026).

## Current status

Windup is a working application, past the planning stage. All eight original phases have an implementation, with the deviations noted below. The product is ready for a small private beta once the high-priority items in "Next steps" are addressed, especially the sealed-letter protection and the missing SQL definitions.

The items under "Next steps" are **proposals** derived from reading the code. They are not commitments, and their order can change.

## What is implemented

Verified by reading the code, not only the earlier plan.

### Foundation

- Next.js 16 (App Router) project with TypeScript, Tailwind CSS 4, and ESLint.
- Landing page with a stop-motion background, sign in and sign up buttons, and a live plane counter.
- Dashboard shell with Navbar (responsive menu, theme toggle, profile menu, Mail button), toasts, and a shared loading state.
- Light and dark themes with day and night artwork. Light is the default.
- Reusable components: `MoodPicker`, `LetterCard`, `ViewLetterModal`, `AlertModal`, `Toast`, `SealDatePicker`, `SealedOpenConfirm`, `SignInPrompt`, `MimiPanel`, `MailButton`, `FieldError`, `AuthSync`.
- `.gitignore` that excludes environment files and secrets.
- `AGENTS.md` and `CLAUDE.md` with coding-agent guidance for Next.js 16.

### Accounts and security

- Email and password sign up and sign in with Supabase Auth, with validation and friendly error messages.
- Email confirmation flow through `/auth/callback`, including open-redirect protection.
- Branded authentication emails through the Supabase Send Email hook and Brevo, with signed-request verification.
- Session refresh in `proxy.ts`, cached server-side user lookup, and RLS on all user data.
- Display name stored in Supabase user metadata; account-switch protection that purges cached data for the previous account.
- Guest mode: read-only browsing of The Sky, with sign-in prompts for any write.

### Private letters (My Jar)

- Fold page with title, body, mood, word and character counters, animated save, and draft editing.
- Drafts, kept letters, and sealed letters, with shelf filters and counts.
- Optimistic delete, release, and unseal with rollback and error dialogs.
- Letter reader modal shared by the Jar, The Sky, and Sent Planes.

### Seal for Later

- Date and time picker, locked card display, and "ready to open" state.
- Unseal confirmation, with the letter moving to the Kept shelf.
- Mail button that lists ready capsules against a live clock.
- Daily reminder email through a Vercel Cron job, with claim-then-send logic so nobody is emailed twice.

### The Sky and Sent Planes

- Public plane feed through a safe database view that omits the author.
- Floating plane layout with unread and read markers, own-plane markers, and random catches of 7 planes.
- Like ("Resonated") with one like per account, shared totals, and live updates in Sent Planes through Realtime.
- Per-account read marks stored in the database (the SQL for these is missing from the repository; see the next steps).
- Sent Planes with total sent, total resonated, today's release count, Keep in Jar, and Recall.
- Database-enforced daily limit of 3 planes through a trigger, with a friendly message.
- Sample planes for an empty sky.

### Mimi

- Chat panel on the Fold page with a battery meter and avatar that follows the energy level.
- `/api/chat` with Gemini through the Vercel AI SDK, a configurable model fallback chain, and a letter-writing-muse system prompt.
- Database-enforced daily energy of 10 messages, with exact energy returned to the browser.
- Per-account conversation memory in the browser (latest 40 messages).

### Settings and data

- Display name editing, read-only email, JSON data export of every owned letter.
- Terms of Service and Privacy Policy dialogs (text needs updating), and a disabled support form.

## Deviations from the original plan

| Original plan | What happened |
| --- | --- |
| Groq for Mimi | Google Gemini through the Vercel AI SDK |
| Three Mimi actions (start, reflect, title) | One free-form Mimi chat |
| 3 Mimi actions per day | 10 Mimi messages per day |
| 1 plane per day | 3 planes per day |
| `profiles`, `letters`, `ai_requests`, `ai_reflections`, `reports` tables | One `thoughts` table plus `thought_likes`, `daily_usage`, `sealed_letter_notifications` |
| REST routes for release, seal, unpublish, open | Server actions plus a database trigger |
| Cursor-paginated Sky, "Catch More" loads the next batch | 100 newest planes loaded, "Catch More Planes" reshuffles locally |
| Report button and `reports` table | Not built |
| Sealed letters opened by status change when the date arrives | Unsealing moves a letter to Kept after confirmation; the `opened` status is no longer used by the interface |
| No likes in the MVP | Likes ("Resonated") shipped, with live counts for owners |
| Email reminders postponed | Shipped as a daily cron job |
| Ten moods | Six moods |

## Next steps (proposed)

### Priority 1: correctness and safety

1. **Enforce sealing on the server.** Today the lock is interface-only: the Jar query returns sealed text, and unsealing does not check the date. Return sealed content only after `seal_until` has passed (a view or function), and validate unsealing in a database function. Add a test that an early unseal is refused.
2. **Add the missing SQL to `supabase/`.** Define `get_user_quota()`, `read_thought_ids()`, `mark_thought_read()`, and the `user_thought_reads` table (with RLS and no policies), so a fresh database matches the application. Keep `get_daily_quota()` as a fallback or retire it deliberately.
3. **Fix the in-app Privacy Policy and Terms.** The text says letters live only in the browser. It should describe Supabase storage, the Mimi data flow to Google Gemini, email delivery through Brevo, and the anonymity rules.
4. **Update `README.md`.** Replace Groq with Gemini, add the full environment variable list (`GEMINI_API_KEY`, `GEMINI_MODELS`, `BREVO_*`, `CRON_SECRET`, `SEND_EMAIL_HOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`), the SQL run order, and the Supabase Auth hook and Realtime setup. List the documentation files, including the API, Mimi, and roadmap documents.
5. **Add a reporting workflow.** A `reports` table, a Report action in the plane reader, duplicate prevention, and a manual review process. A public anonymous space needs it before wider release.

### Priority 2: product completeness

6. **Password reset and email change screens.** The email hook already sends recovery and email-change messages, but no page requests them.
7. **Enable the support form** (for example by writing to a table or sending an email to a support inbox), or remove the dialog.
8. **Server pagination for The Sky.** Replace the 100-plane load with cursor pagination and keep "Catch More Planes" as a presentation layer.
9. **Edit kept letters** and **seal an existing kept letter**, which the interface does not offer today.
10. **Refund policy for releases.** Decide whether moving a plane back to the Jar should return the day's release, and implement it in one place (the trigger).
11. **Rate limit sign-in related requests and the chat route** beyond the daily quotas.
12. **Account deletion** and a clearer "delete all my data" path alongside the JSON export.

### Priority 3: Mimi

13. Optional, explicit **"share this letter with Mimi"** for a reflection, with a clear notice before sending.
14. Optional structured actions (reflection with a possible theme and a question, three title suggestions).
15. Save a chosen Mimi suggestion with a letter.
16. Decide whether a provider failure should return the day's energy unit.
17. Add a visible notice that Mimi messages are processed by an AI provider.

### Priority 4: quality and maintenance

18. **Automated tests:** server actions, the status mapping in `lib/thoughts.ts`, the quota parsers in `lib/quota.ts`, and SQL tests for the quota trigger, likes, and RLS (two-account isolation).
19. **Remove dead code:** `PrivacySelector`, `PaperPlaneCard`, `useUserEmail`, the retired letter context in `app/providers.tsx`, the unused `@getbrevo/brevo` dependency, and the empty placeholder files (`lib/ai/groq.ts`, `lib/utils.ts`, `lib/supabase/*.ts`, `types/database.ts`, `supabase/policies.sql`). Rename the package from `temp-windup`.
20. **Align editor and server limits** (1,000 words and 100 characters in the editor, 10,000 and 120 on the server) or document them as intentional.
21. **Accessibility pass:** keyboard operation of the floating planes, focus management in dialogs, and color contrast in dark mode.
22. **User timezone setting** for the daily day boundary (change `quota_timezone()` or compute per user).
23. **Observability:** structured logging for the cron job, chat route, and quota failures.

## Release readiness checklist

Use this before inviting testers.

- [ ] Run `schema.sql`, `likes.sql`, `quotas.sql`, `email_notifications.sql` on a clean Supabase project, plus the read-mark SQL once it exists.
- [ ] Two-account test: Account B cannot read Account A's private or sealed letters or see who wrote a plane.
- [ ] A fourth release in one day is refused with the friendly message and the letter is not lost.
- [ ] A sealed letter cannot be read or unsealed early, even by calling the server directly (after Priority 1, item 1).
- [ ] The reminder email arrives once, contains no letter text, and the link opens My Jar.
- [ ] Mimi stops after 10 messages and does not recover by clearing browser storage.
- [ ] No secret key appears in the repository or in browser code.
- [ ] Privacy Policy, Terms, and README match the real behavior.
- [ ] The Supabase Auth redirect URLs, Send Email hook, Realtime publication, Vercel environment variables, and cron secret are configured.

## What to postpone until after beta

- Custom domain.
- End-to-end encryption or an encrypted private vault.
- Comments, following, and direct messages.
- Notifications beyond sealed-letter reminders.
- Monthly emotional summaries or any AI analysis across letters.
- Payments or subscriptions.
- A separate ML or Python service.
- Search by mood or theme, and PDF export (reasonable later features once the above is stable).