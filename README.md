# applykit

Next.js App Router + TypeScript + Tailwind + shadcn/ui starter for tracking job applications and resume versions.

## Setup

```bash
cp .env.example .env
pnpm install
pnpm prisma:generate
pnpm prisma:migrate --name init
pnpm prisma:seed
pnpm dev
```

## Routes

- `/tracker` - applications overview
- `/resume` - resume versions overview
- `/api/applications` - CRUD APIs for applications
- `/api/events` - CRUD APIs for events
