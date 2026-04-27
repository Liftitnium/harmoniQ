# HarmoniQ — AI-Powered Guitar Practice Coach

Personalized guitar practice roadmaps powered by AI, with real tabs from Songsterr, adaptive weekly plans, and progress tracking.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Auth & Database:** Supabase (PostgreSQL + Auth)
- **AI:** Google Gemini 2.0 Flash
- **Tabs:** Songsterr (free public API)
- **Deployment:** Vercel

## Quick Start (Local Development)

1. **Clone the repo:**

```bash
git clone https://github.com/Liftitnium/harmoniQ.git
cd harmoniQ/harmoniq
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the migration: go to **SQL Editor** in the Supabase dashboard, paste the contents of `supabase/migrations/001_full_schema.sql`, and run it
   - Go to **Authentication > URL Configuration** and add `http://localhost:3000/auth/callback` to Redirect URLs
   - (Optional) Enable Google OAuth under **Authentication > Providers**

4. **Set up Gemini:**
   - Get a free API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)

5. **Configure environment:**

```bash
cp .env.local.example .env.local
```

Fill in your Supabase URL, anon key, and Gemini API key.

6. **Run the dev server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com/new)
3. Set **Root Directory** to `harmoniq`
4. Add environment variables (same as `.env.local.example`)
5. Deploy

**After deploying:**

- Add your Vercel URL + `/auth/callback` to Supabase **Authentication > URL Configuration > Redirect URLs**
- Add `https://*-your-project.vercel.app/auth/callback` for preview deploys

## Project Structure

```
harmoniq/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes (roadmap generation, Songsterr proxy, etc.)
│   │   ├── auth/         # OAuth callback handler
│   │   ├── login/        # Auth pages
│   │   ├── signup/
│   │   ├── onboarding/   # Survey flow
│   │   ├── roadmap/      # Main practice surface
│   │   ├── profile/      # User profile & badges
│   │   ├── sheet-music/  # Songsterr tab browser
│   │   └── ...
│   ├── components/       # Reusable React components
│   ├── context/          # React context providers (theme, notifications)
│   └── lib/              # Utilities (Supabase client, Gemini, env validation)
├── public/               # Static assets
├── supabase/             # Database migrations
├── .env.local.example    # Environment variable template
├── vercel.json           # Vercel deployment config
└── package.json
```

## Environment Variables

| Variable | Public? | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `GEMINI_API_KEY` | **No** | Google Gemini API key (server-side only) |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app's public URL (for OAuth redirects) |

## License

MIT
