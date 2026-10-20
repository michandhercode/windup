# Windup

> Write what you need to say. Keep it if it is only yours. Fold it if you are ready. Release it when it belongs to the sky.

Windup is a cozy, minimalist, letter-based journaling web app. It is built for personal reflection rather than social interaction. You write a letter in the Fold page, then decide where it goes: keep it privately in your jar, seal it as a time capsule for your future self, or release it anonymously into the public sky as a paper plane. An optional AI companion named Mimi helps you find the first words.

---

## Key Features

### Writing and private space

- **Fold (the writing page):** Write a letter with an optional title (up to 100 characters), a body (up to 1,000 words), and an optional mood. Choose Private (Jar) or Anonymous Public (Sky) before saving. Save as a draft, fold and keep, seal, or release. Drafts can be reopened and edited.
- **My Jar (private vault):** A shelf of your private letters, organized as All Entries, Drafts, Kept, and Sealed, each with a live count. Release a kept letter to the sky, unseal a ready time capsule, view, or delete.
- **Moods:** Six moods (Neutral, Peaceful, Reflective, Nostalgic, Heavy, Hopeful), each with its own icon and color theme on cards and in the letter reader.
- **Seal for Later (time capsules):** Pick a future date and time. The letter shows as locked in the jar until then. When it unlocks, a Mail button in the header lights up, and you can unseal the letter, which moves it to your Kept shelf.

### The public sky

- **The Sky:** A quiet public space where released letters drift as anonymous paper planes over a day or night sky. Open a plane to read it. Unread planes pulse green, read planes are dimmed with a check mark, and your own planes carry your name tag. "Catch More Planes" reshuffles the sky.
- **Resonate (likes):** Signed-in readers can like a plane. One like per account per plane, with real shared totals. Nobody can see who liked what.
- **Sent Planes:** A record of the planes you have released, with total sent, total resonated, and today's release count. Live like counts update without reloading. Move a plane back to your jar or recall (delete) it.
- **Daily release limit:** Up to 3 planes per account per day, enforced by a database trigger so it cannot be bypassed from the browser.
- **Anonymity:** The public feed reads a database view that never includes the author's id, name, or email.

### Mimi, the AI writing companion

- **A letter-writing muse, not a general chatbot.** Mimi acknowledges what you share, offers an opening line or a small prompt, and gently steers you toward putting it in a letter. She never writes the whole letter for you.
- **Powered by Google Gemini through the Vercel AI SDK**, with an automatic model fallback chain that you can configure.
- **Battery-based energy:** Each account has 10 messages per day. A battery meter shows the energy left, and Mimi's avatar changes with it: full battery at 6 to 10 energy, mid battery at 2 to 5, low battery at 0 to 1. At zero she rests until tomorrow.
- **Persistent chat history:** Your conversation is saved in your browser per account (the latest 40 messages), so it survives leaving and returning to the Fold page. It is erased on sign out or when another account signs in.
- **Private by design:** Mimi responds only when you send her a message. Your letter is never sent to her automatically.
- **Server-enforced limit:** The daily energy is counted in the database, so clearing browser storage or switching devices does not restore it.

### Accounts, guest mode, and email

- **Authentication:** Email and password with Supabase Auth, a single-word display name, inline validation, and friendly error messages.
- **Guest mode:** Visitors who are not signed in can browse the landing page and read every plane in The Sky. Liking, writing, sealing, and releasing open a friendly sign-in prompt. My Jar, Sent Planes, and Settings require an account.
- **Branded emails through Brevo:** A Supabase "Send Email" Auth Hook sends every authentication email (sign-up confirmation, magic link, invite, password recovery, email change, re-authentication) using Windup's own templates.
- **Sealed-letter reminders:** A daily Vercel Cron job emails you when a sealed letter's unlock date arrives. The email contains only a reminder and a link, never the letter text.
- **Settings:** Change your display name, view your read-only email, export all your letters as a JSON backup, and read the terms and privacy information.

### Design

- Warm paper cards, mood-tinted letters, papercraft artwork, and a soft sky.
- Light mode by default with a saved light and dark toggle, plus day and night backgrounds.
- A stop-motion landing page background that respects reduced-motion preferences.
- Responsive layouts for phone, tablet, and desktop.

---

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, `proxy.ts`, Server Components, Server Actions) |
| UI | React 19, TypeScript, Tailwind CSS 4, lucide-react, next-themes |
| Database and auth | Supabase (Postgres, Row Level Security, RPC functions, Realtime, Auth) via `@supabase/ssr` and `@supabase/supabase-js` |
| AI | Google Gemini through the Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/google`) |
| Email | Brevo transactional email API |
| Hosting and scheduling | Vercel, including Vercel Cron |
| Linting | ESLint 9 with `eslint-config-next` |

---

## Getting Started

### Prerequisites

- Node.js and npm.
- A [Supabase](https://supabase.com) project.
- A Google Gemini API key (from Google AI Studio).
- A [Brevo](https://www.brevo.com) account with a verified sender address (needed for emails).
- A Vercel account for deployment (optional for local development).

### 1. Clone and install

```bash
git clone https://github.com/michandhercode/windup.git
cd windup
npm install
```

### 2. Environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Mimi (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key
# Optional: comma-separated model fallback chain, tried in order
# GEMINI_MODELS=model-one,model-two,model-three

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=verified_sender@example.com
# Optional, defaults to "Windup"
# BREVO_SENDER_NAME=Windup

# Site URL used for links inside emails
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Secrets for server-to-server calls
CRON_SECRET=a_long_random_string
SEND_EMAIL_HOOK_SECRET=the_secret_shown_when_you_create_the_supabase_hook
```

| Variable | Required | Where it is used |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Browser and server Supabase clients, email hook, cron job |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser and server Supabase clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes for reminders | Scheduled reminder route only. It bypasses Row Level Security, so keep it secret. |
| `GEMINI_API_KEY` | Yes for Mimi | `/api/chat`. Without it Mimi returns a configuration error. |
| `GEMINI_MODELS` | No | Overrides the default Gemini model fallback chain in `/api/chat`. |
| `BREVO_API_KEY` | Yes for email | Sending authentication and reminder emails |
| `BREVO_SENDER_EMAIL` | Yes for email | Sender address, which must be verified in Brevo |
| `BREVO_SENDER_NAME` | No | Sender display name, defaults to "Windup" |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Base URL for links in emails. Falls back to the Vercel URL, then `http://localhost:3000`. |
| `CRON_SECRET` | Yes for reminders | The reminder route requires `Authorization: Bearer <CRON_SECRET>` |
| `SEND_EMAIL_HOOK_SECRET` | Yes for custom auth emails | Verifies that requests to `/api/auth/send-email` come from Supabase |

Vercel also provides `VERCEL_PROJECT_PRODUCTION_URL` and `VERCEL_URL` automatically, which are used as fallbacks for the site URL. Never commit `.env.local`; it is already ignored by Git. The browser only ever receives the two `NEXT_PUBLIC_` Supabase values.

### 3. Set up Supabase

Open the Supabase SQL editor and run these files from the `supabase/` folder, in this order:

1. `schema.sql` - the `thoughts` table, constraints, indexes, Row Level Security, and the safe `public_thoughts` view used by The Sky.
2. `likes.sql` - likes ("Resonated"), the like-count trigger, and the Realtime publication for live counts.
3. `quotas.sql` - daily quotas (3 planes and 10 Mimi messages) and the release-limit trigger.
4. `email_notifications.sql` - the table and function behind sealed-letter reminder emails.

All four are safe to re-run. `diagnose_thoughts.sql` is a read-only diagnostic you can run if releasing or opening letters fails. If the app says a function is missing right after running a file, refresh the API cache with `notify pgrst, 'reload schema';`.

Note: the app also calls `get_user_quota()`, `read_thought_ids()`, and `mark_thought_read()` (and uses a `user_thought_reads` table for read marks), which are not yet defined in the repository's SQL files. Without them the app still works, falling back to `get_daily_quota()` for quotas and showing planes as unread, but you should add them to your database for the full experience. See `docs/3_DATABASE_SCHEMA.md`.

Then configure Supabase Auth:

- Add your local and deployed URLs to the Auth redirect URLs. The email confirmation link lands on `/auth/callback`.
- Under Authentication, Hooks, enable the **Send Email** hook with an HTTPS URL of `https://<your-site>/api/auth/send-email`, and copy the generated secret into `SEND_EMAIL_HOOK_SECRET`. For local testing of this hook you will need a public tunnel URL.
- Make sure the `supabase_realtime` publication includes `public.thoughts` (`likes.sql` does this when the publication exists).

### 4. Set up Brevo

Create an API key, then verify the sender address or domain you will use. Set `BREVO_API_KEY` and `BREVO_SENDER_EMAIL`. Brevo's free plan allows 300 emails per day, and the reminder job sends at most 50 per run.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

---

## Deployment

1. Push the repository to GitHub and import it into Vercel.
2. Add all environment variables in the Vercel project settings.
3. Add the Vercel URL to the Supabase Auth redirect URLs and point the Send Email hook at the deployed `/api/auth/send-email` URL.
4. The `vercel.json` file registers a cron job that calls `/api/cron/sealed-reminders` daily at 01:00 UTC. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`, so `CRON_SECRET` must be set. You can also trigger it by hand with a `POST` request and the same header.

---

## How It Works

- **Server Actions** handle letters, planes, likes, read marks, and quota reads. Pages load data on the server for the signed-in account, and every query is also protected by Row Level Security.
- **Route handlers** exist for the Mimi chat (`POST /api/chat`), the Supabase email hook (`POST /api/auth/send-email`), the email confirmation callback (`GET /auth/callback`), and the daily reminder job (`/api/cron/sealed-reminders`).
- **Daily limits live in the database**, keyed by account, so they cannot be reset from the browser. Both reset at midnight UTC by default (one SQL function controls the timezone).
- **The Sky** loads the 100 newest released planes through a view that omits the author, then shows 7 at a time.
- **Account safety:** switching or ending an account wipes that account's cached data in the browser, so nothing carries over to the next person on the same device.

### Daily limits

| Limit | Value |
| --- | --- |
| Planes released per account per day | 3 |
| Mimi messages per account per day | 10 |
| Letter title | 100 characters in the editor (120 on the server) |
| Letter body | 1,000 words in the editor (10,000 characters on the server) |
| Mimi message | 400 characters |

---

## Project Structure

```text
app/
  (auth)/               Login and sign up pages
  (dashboard)/          Fold, My Jar, The Sky, Sent Planes, Settings
  actions/              Server actions (thoughts, quota)
  api/                  chat, auth/send-email, cron/sealed-reminders
  auth/callback/        Email confirmation landing point
components/             Navbar, MailButton, MimiPanel, LetterCard, modals, toasts, pickers
lib/                    Quota logic, email, AI prompt, mood, auth helpers, client stores
utils/supabase/         Browser, server, public, and session-refresh clients
supabase/               SQL files for the database
public/                 Backgrounds, logo and icons, Mimi artwork
docs/                   Product, architecture, database, API, Mimi, and roadmap documents
proxy.ts                Refreshes the Supabase session on each request
vercel.json             Daily cron schedule
```

---

## Privacy and Safety

- Row Level Security protects every table that holds user data.
- Public planes never expose the author. Likes are stored in a table that browsers cannot read.
- Secret keys are read only on the server. The service role key is used only by the scheduled reminder job.
- Emails never contain the text of a letter.
- Mimi receives only what you type into her chat, plus the recent conversation. Messages are processed by Google Gemini.
- Normal database storage is not end-to-end encryption.

---

## Known Limitations

- Sealed letters are hidden and blocked by the interface, but the lock is not yet enforced on the server.
- There is no reporting or moderation workflow for public planes yet.
- There are no password reset or email change screens, and the in-app support form is disabled.
- The in-app Privacy Policy text still needs to be updated to describe Supabase storage.
- There are no automated tests yet.

The proposed next steps are listed in `docs/ROADMAP.md`.

---

## Documentation

Detailed documentation lives in the `docs/` folder:

- `docs/1_PRD.md` - Product requirements and implemented behavior
- `docs/2_ARCHITECTURE.md` - Stack, project structure, flows, and security boundaries
- `docs/3_DATABASE_SCHEMA.md` - Tables, view, functions, triggers, and Row Level Security
- `docs/4_API_ROUTES.md` - Route handlers, server actions, and database calls
- `docs/5_MIMI_AI_COMPANION.md` - Mimi's behavior, limits, privacy, and model setup
- `docs/ROADMAP.md` - What is built and what comes next

---

## Note for Contributors and Coding Agents

This project uses a recent Next.js version with changes from older releases (for example, `proxy.ts` replaces `middleware.ts`). See `AGENTS.md` and read the guides in `node_modules/next/dist/docs/` before changing framework-level code.