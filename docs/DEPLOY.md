# DEPLOY.md — Deploy (Vercel) + lembretes (GitHub Actions)

## Pré-requisitos já prontos no código
- `postinstall: prisma generate` (a Vercel gera o cliente Prisma no build).
- `public/manifest.json` + ícones (192/512/maskable) + `apple-touch-icon` → instalável.
- Push: `public/sw.js`, `/api/push/subscribe`, `/api/push/test`, `/api/cron/check-reminders`.
- Workflow `.github/workflows/reminders.yml` (cron */5 → chama a rota).

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
- Deploy → guarda o URL (ex: `https://habitos.vercel.app`).
- (O schema já foi `prisma db push` para o Neon; não é preciso na Vercel. Só voltar a fazer `db push` local se mudares o schema.)

## 3. GitHub Actions (lembretes)
- No repo: **Settings → Secrets and variables → Actions**:
  - **Secret** `CRON_SECRET` = o mesmo valor da Vercel.
  - **Variable** `APP_URL` = o URL da Vercel (sem `/` no fim).
- O cron corre a partir do **branch default**. Podes testar já em **Actions → Lembretes de água → Run workflow** (workflow_dispatch).

## 4. Instalar no iPhone e testar notificações
- Abre o URL da Vercel no **Safari** → **Partilhar → Adicionar ao ecrã principal**.
- Abre a app **a partir do ícone** (tem de estar instalada — requisito do iOS).
- Faz o onboarding → **Perfil → Notificações → Permitir** → **Enviar notificação de teste**.
- ⚠️ Push no iOS: só funciona **instalada no ecrã principal** e em **iOS 16.4+**. No Android (Chrome) funciona também fora de instalada.
- Os lembretes reais chegam nos horários de água (o cron dispara ~a cada 5 min, com possível atraso do GitHub).

## Notas
- Ainda **sem offline** (o `sw.js` trata de push + instalabilidade; o cache offline é o passo seguinte).
