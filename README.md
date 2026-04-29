# Black Med Collective Platform

Production-ready SaaS monorepo with:
- Next.js frontend
- Secure backend API (NestJS)
- PostgreSQL + Prisma
- Admin authentication (JWT + role-based access)
- Scalable architecture (Turbo + Docker + clear boundaries)

## Stack
- Frontend: Next.js 16 + React 19 (App Router, TypeScript)
- Backend: NestJS 11, Passport JWT, class-validator
- Database: PostgreSQL, Prisma ORM 7 with the direct Postgres adapter
- Monorepo: pnpm workspaces + Turborepo
- Infra: Docker Compose, multi-stage Dockerfiles

## Quick Start
```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm dev
```

## Apps
- `apps/web`: SaaS frontend + admin dashboard skeleton
- `apps/api`: Secure REST API + admin auth

## Env
Use `.env.example` as reference.
