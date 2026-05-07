# AfterMe

AfterMe is a warm reflection and commitment app for getting through the "I don't feel like it" moment.

## Setup

```bash
npm install
npm run dev
```

The app currently runs with local mock data by default, so it can be previewed before Supabase is configured.

## Environment

Create `.env.local` when you are ready to connect Supabase:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase

Apply migrations in order:

```bash
supabase db push
```

Migration order:

1. `supabase/migrations/001_afterme_schema.sql`

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Deploy

For Vercel, set the two Supabase environment variables, then deploy the Vite app with the default build command:

```bash
npm run build
```
