# applykit

Next.js App Router + TypeScript + Tailwind + shadcn/ui starter for tracking job applications and resume versions.

## Setup (Postgres)

```bash
cp .env.example .env
# add your Postgres DATABASE_URL to .env
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run prisma:seed
npm run dev
```

## Database scripts

- `npm run db:generate` - generate Prisma Client
- `npm run db:migrate` - create/apply local development migration
- `npm run db:deploy` - apply checked-in migrations in non-dev environments

## Deploy to Vercel

1. Create a Postgres database (Neon works well for demos) and copy the connection string.
2. In Vercel project settings, add `DATABASE_URL` with that Postgres connection string.
3. Ensure Prisma Client is generated during install (`postinstall` already runs `prisma generate`).
4. In Vercel Build Command, run migrations before build:

```bash
npm run db:deploy && npm run build
```

This applies schema migrations safely in production and then builds the Next.js app.

## Routes

- `/tracker` - applications overview (CRM-style table + drawer details)
- `/resume` - resume versions overview
- `/api/applications` - CRUD APIs for applications
- `/api/events` - CRUD APIs for events
