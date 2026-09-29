# Windup

> Write what you need to say. Keep it if it is only yours. Fold it if you are ready. Release it when it belongs to the sky.

Windup is a sentimental, letter-based journaling platform. Built for personal reflection rather than social interaction, users can keep private thoughts in a personal jar, seal letters for the future, or fold one anonymous paper plane into the public sky each day.

---

## Key Features

- **My Jar:** A private, reflective space to store personal drafts, kept entries, and sealed letters.
- **The Sky:** A quiet public space to read anonymous paper planes released by others (limited to 1 release per day per user).
- **Sent Planes:** Track, view, or unpublish your own anonymous public letters.
- **Mimi (AI Writing Companion):** An optional, gentle AI assistant powered by Groq to help generate writing prompts or offer empathetic reflections.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (Row Level Security enabled)
- **AI Integration:** Groq API
- **Hosting:** Vercel

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/michandhercode/windup.git
cd windup
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory and configure your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## Documentation

Detailed documentation and architectural specs are located in the `/docs` folder:

- Product Requirements (PRD)
- Architecture & Folder Structure
- Database Schema