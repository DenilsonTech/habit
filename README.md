# Hábitos

PWA pessoal para criar e manter hábitos diários saudáveis, com foco na
hidratação. Sem login — identidade por `device_id` anónimo.

## Stack

- Next.js (App Router) · TypeScript · Tailwind · shadcn/ui
- Prisma + Neon Postgres
- TanStack Query (estado/otimista)
- Web Push (VAPID) + GitHub Actions (cron) para lembretes
- Deploy: Vercel

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

Precisa de um `.env` (ver `.env.example`).

## Documentação

- `docs/PRD-habitos-app.md` — produto
- `docs/DESIGN.md` — design system
- `docs/ADD-FLOW.md` — fluxo de adicionar hábito
- `docs/DEPLOY.md` — deploy + notificações
- `CLAUDE.md` / `AGENTS.md` — regras para o Claude Code
