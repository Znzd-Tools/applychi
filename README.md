# ApplyChi — Job Application Tracker

A minimal, dark-mode-first job application tracker built with Next.js, Supabase, and Tailwind CSS.

## Stack

- **Next.js 16** (App Router, Server Actions)
- **TypeScript** (strict)
- **Supabase** (Auth + PostgreSQL)
- **Tailwind CSS v4**
- **Shadcn/ui** + Lucide React

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_job_applications.sql` via the SQL Editor
3. Copy your project URL and anon key

### 2. Environment

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Email/password auth (`/login`, `/signup`)
- Protected dashboard with route guards
- Kanban board on desktop (6 status columns)
- Filter chips on mobile
- Drawer (mobile) / Dialog (desktop) for add/edit
- Full CRUD via Server Actions with RLS

## Project Structure

```
src/
├── app/                    # Routes
├── components/ui/          # Shadcn components
├── features/
│   ├── auth/               # Auth forms & actions
│   └── applications/       # Tracker logic & UI
└── lib/                    # Supabase clients, utils
```
