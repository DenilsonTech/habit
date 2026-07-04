# DEPLOY.md — Deploy (Vercel) + lembretes (GitHub Actions)

## Pré-requisitos já prontos no código
- `postinstall: prisma generate` (a Vercel gera o cliente Prisma no build).
- `public/manifest.json` + ícones (192/512/maskable) + `apple-touch-icon` → instalável.
- Push: `public/sw.js`, `/api/push/subscribe`, `/api/push/test`.
- Lembretes: lógica em `src/lib/reminders.ts`, disparada por **Inngest** (função cron em `src/lib/inngest.ts`, servida em `/api/inngest`). Fallback HTTP: `/api/cron/check-reminders` (cron-job.org / GitHub Actions).

## 1. Repositório
- Cria um repo **público** (Actions ilimitados/grátis — ver PRD 4.1).
- Commit + push de tudo. O `.env` **não** vai (gitignored); os segredos definem-se na Vercel/GitHub.

## 2. Vercel
- Importa o repo. Framework: Next.js (deteta sozinho).
- **Environment Variables** (copiar os valores do teu `.env` local):
  - `DATABASE_URL` (Neon)
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - `CRON_SECRET`
  - `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` (ou deixa a integração Inngest↔Vercel defini-las)
- Deploy → guarda o URL (ex: `https://habitos.vercel.app`).
- (O schema já foi `prisma db push` para o Neon; não é preciso na Vercel. Só voltar a fazer `db push` local se mudares o schema.)

## 3. Lembretes automáticos — Inngest (recomendado)
- Cria conta em **inngest.com** → instala a **integração Inngest ↔ Vercel** (Vercel Marketplace). Ela define `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` na Vercel e regista a app.
- No deploy, o Inngest deteta a app em **`/api/inngest`** e a função **check-reminders** (cron `TZ=Africa/Maputo */5 * * * *`). No dashboard vês execuções, logs e retries.
- Sem a integração automática: no dashboard do Inngest faz **Sync** apontando a `https://<app>.vercel.app/api/inngest`.

### Alternativas (mesmo endpoint HTTP, sem Inngest)
`/api/cron/check-reminders` (POST, header `Authorization: Bearer <CRON_SECRET>`) continua a funcionar:
- **cron-job.org** (grátis): job POST a esse URL + header, a cada 5 min.
- **GitHub Actions** (`.github/workflows/reminders.yml`): secret `CRON_SECRET` + variable `APP_URL`. ⚠️ Requer a conta GitHub sem bloqueio de faturação.

## 4. Instalar no iPhone e testar notificações
- Abre o URL da Vercel no **Safari** → **Partilhar → Adicionar ao ecrã principal**.
- Abre a app **a partir do ícone** (tem de estar instalada — requisito do iOS).
- Faz o onboarding → **Perfil → Notificações → Permitir** → **Enviar notificação de teste**.
- ⚠️ Push no iOS: só funciona **instalada no ecrã principal** e em **iOS 16.4+**. No Android (Chrome) funciona também fora de instalada.
- Os lembretes reais chegam nos horários de água (o cron dispara ~a cada 5 min, com possível atraso do GitHub).

## Notas
- Ainda **sem offline** (o `sw.js` trata de push + instalabilidade; o cache offline é o passo seguinte).
