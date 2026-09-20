# Windup

Windup is a letter-based journaling platform where users can write private thoughts, keep letters in a personal jar, seal letters for the future, or release one anonymous paper plane into the public sky each day.

The app is designed to feel personal and reflective instead of loud and social. Users can write as much as they want, but public sharing is limited so every released letter feels intentional.

Windup includes Mimi, an optional AI writing companion that can help users begin a letter, reflect on what they wrote, or find the feeling behind their thoughts. Mimi only reads a draft when the user chooses an AI action.

## Project Goal

The goal is to build a beginner-friendly online platform with a sentimental writing experience.

Instead of posting like a normal social media app, users write letters. A letter can stay private in My Jar, be sealed until a future date, or be folded into an anonymous paper plane and released into The Sky.

## Core Metaphor

Windup uses two main visual ideas:

- **Jar:** private storage for letters, drafts, sealed letters, and kept thoughts
- **Paper plane:** a public anonymous letter released into The Sky

The user can write freely, then choose what happens to the letter:

```txt
Keep in My Jar
Seal for Later
Release to The Sky
```

## Core Features

- Write personal letters instead of normal blog posts
- Keep private letters in My Jar
- Seal letters until a future date
- Release one anonymous public letter per day
- Browse public anonymous letters in The Sky
- View personal public letters in Sent Planes
- Choose a mood before or after writing
- Ask Mimi for writing prompts
- Ask Mimi for a gentle reflection
- Keep AI usage optional and transparent

## MVP Scope

The first version should stay small and realistic. The MVP should include:

- Email authentication
- Letter editor
- My Jar page
- Sealed letters view inside My Jar
- The Sky public reading page
- Sent Planes page
- Mood picker
- Privacy selector
- One public release per user per day
- Public letters loaded in small batches
- Basic Mimi prompt generation
- Basic Mimi reflection
- Supabase database with row-level security
- Vercel deployment

Features like email reminders, end-to-end encryption, advanced moderation, and monthly recaps can be added after the MVP works.

## Usage Limits

The limits are meant to protect the free-tier tools and keep the app intentional.

```txt
Private writing: unlimited
Public release: 1 paper plane per day
Public reading: 10 letters per load
Mimi AI actions: 3 per user per day
```

If a user reaches the public release limit, the letter should not be deleted. It should be saved in My Jar, and the user can release another letter the next day.

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **Authentication:** Supabase Auth
- **AI Provider:** Groq
- **Hosting:** Vercel
- **IDE:** Visual Studio Code
- **Version Control:** Git and GitHub

## Architecture Style

This project uses a Next.js App Router architecture with route groups, reusable UI components, API route handlers, and Supabase-backed persistence.

The route groups organize pages without changing the URL.

Example:

```txt
app/(auth)/login/page.tsx
```

The URL is still:

```txt
/login
```

## Project Structure

```txt
windup/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_ROUTES.md
│   └── MIMI_AI_COMPANION.md
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── LoginPage.tsx
│   │   │   └── page.tsx
│   │   └── signup/
│   │       ├── SignupPage.tsx
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── DashboardLayout.tsx
│   │   ├── layout.tsx
│   │   ├── fold/
│   │   │   ├── FoldPage.tsx
│   │   │   └── page.tsx
│   │   ├── jar/
│   │   │   ├── MyJarPage.tsx
│   │   │   └── page.tsx
│   │   ├── letters/
│   │   │   └── [id]/
│   │   │       ├── ViewLetterPage.tsx
│   │   │       └── page.tsx
│   │   ├── sky/
│   │   │   ├── TheSkyPage.tsx
│   │   │   └── page.tsx
│   │   ├── sent-planes/
│   │   │   ├── SentPlanesPage.tsx
│   │   │   └── page.tsx
│   │   └── settings/
│   │       ├── AccountSettingsPage.tsx
│   │       └── page.tsx
│   │
│   ├── api/
│   │   ├── ai/
│   │   │   ├── prompt/
│   │   │   │   └── route.ts
│   │   │   └── reflect/
│   │   │       └── route.ts
│   │   └── letters/
│   │       ├── release/
│   │       │   └── route.ts
│   │       └── seal/
│   │           └── route.ts
│   │
│   ├── LandingPage.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── MimiPanel.tsx
│   ├── LetterCard.tsx
│   ├── MoodPicker.tsx
│   ├── PaperPlaneCard.tsx
│   ├── PrivacySelector.tsx
│   ├── RecipientSelector.tsx
│   └── SealDatePicker.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── ai/
│   │   ├── groq.ts
│   │   └── prompts.ts
│   └── utils.ts
│
├── types/
│   ├── database.ts
│   └── letter.ts
│
├── supabase/
│   ├── schema.sql
│   └── policies.sql
│
├── .env.local
├── middleware.ts
└── package.json
```

## Main Dashboard Tabs

### Fold

The writing page. Users write a new letter here and decide what to do with it.

Main actions:

```txt
Keep in My Jar
Seal for Later
Release to The Sky
Ask Mimi
```

### My Jar

The user's private letter space. This replaces the need for a separate "My Diary" tab.

My Jar can use notebook-style filters:

```txt
All
Drafts
Kept
Sealed
Opened
```

### The Sky

The public anonymous reading space. Users can read public letters released by others.

The Sky should not load every public letter at once. It should load a small batch, such as 10 letters, then let the user catch more.

### Sent Planes

The user's own anonymous public letters.

Other people see these letters anonymously, but the owner can still manage them here.

Possible actions:

```txt
View
Unpublish
Move back to My Jar
```

### Settings

Account, privacy, AI preferences, and app settings.

## Public Letter Flow

When a user releases a letter publicly, the original letter should remain connected to the user's account but appear anonymously to others.

```txt
Write letter
Choose Release to The Sky
Check daily public release limit
Save letter as anonymous public
Show it in Sent Planes for the owner
Show it in The Sky for other users
```

If the user has already released one paper plane that day:

```txt
Save the letter in My Jar
Show a message that another letter can be released tomorrow
```

The letter should not be deleted just because the daily public release limit was reached.

## Public Reading Flow

The Sky should use small batches to avoid loading too much data.

```txt
Open The Sky
Load 10 public letters
Click Catch More
Load the next 10 public letters
```

Public reading should not call the AI model. Reading public letters should only use normal database reads.

## Mimi AI Companion

Mimi is the optional AI writing companion inside Windup.

Mimi should feel soft, simple, and supportive, but the app should still be clear that Mimi is AI.

Mimi can help with:

- Starting prompts
- Gentle reflection
- Mood-aware questions
- Rewriting a thought more clearly
- Suggesting a title

Mimi should not:

- Pretend to be human
- Diagnose the user
- Give medical or therapy advice
- Read private letters automatically
- Send a letter to AI without user action

## Mimi AI Behavior

Mimi's reflection should be based on:

- The current letter text
- The selected mood
- Optional context selected by the user

Mimi's output should usually include:

- A gentle reflection
- A possible theme
- One open-ended question

Example:

```txt
This letter seems to carry a mix of longing and uncertainty.

Possible theme: wanting closure without knowing where to place the feeling yet.

Question: What part of this thought do you wish someone understood without you explaining it?
```

## AI Actions

An AI action is any request sent to Groq through Mimi.

Examples:

```txt
Help me start = 1 AI action
Reflect with Mimi = 1 AI action
Suggest a title = 1 AI action
```

Normal writing, saving, editing, reading, and public posting do not count as AI actions.

## Environment Variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
```

The `GROQ_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` should only be used on the server side.

## Privacy Principles

- Private letters should not be visible to other users.
- Public letters should not reveal the author's real email or user ID.
- Mimi should only receive a letter draft when the user chooses an AI action.
- The app should clearly tell the user when a draft will be sent to Mimi.
- Database access should be protected using Supabase row-level security.
- Users should be able to unpublish public letters.

Important note: normal database storage is not the same as end-to-end encryption. If end-to-end privacy becomes a major feature, it should be added later as a separate encrypted vault feature.

## Suggested Database Tables

```txt
profiles
letters
ai_reflections
ai_requests
reports
```

### profiles

Stores public and account-related user profile data.

### letters

Stores letter content, mood, visibility, seal date, ownership, and public release state.

### ai_reflections

Stores optional Mimi reflection results if the user chooses to save them.

### ai_requests

Tracks Mimi usage for daily limits.

### reports

Stores reports for public anonymous letters.

## Letter Status and Visibility

Suggested status values:

```txt
draft
kept
sealed
opened
released
unpublished
```

Suggested visibility values:

```txt
private
anonymous_public
sealed
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app:

```txt
http://localhost:3000
```

## Deployment

The app can be deployed on Vercel.

Recommended deployment flow:

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Add environment variables in Vercel.
4. Connect Supabase project keys.
5. Deploy.

## Future Features

- Email reminder when a sealed letter opens
- End-to-end encrypted private vault
- Monthly emotional recap
- Search by mood or theme
- Soft public reactions
- Public letter reporting and moderation
- User-controlled Mimi memory
- Export letters as PDF
- Custom paper plane themes
- Scheduled release queue

## Development Philosophy

Build the app slowly and clearly.

The first goal is not to create a huge social platform. The first goal is to create a small, meaningful writing space that works well for one user, then for a few users, then for a public audience.

Windup should feel like a quiet ritual:

```txt
Write what you need to say.
Keep it if it is only yours.
Fold it if you are ready.
Release it when it belongs to the sky.
```
