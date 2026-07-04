# PRD — App de Hábitos Diários Saudáveis (MVP)

## 1. Contexto e Objetivo

App pessoal (PWA) para ajudar a construir e manter hábitos diários saudáveis, adaptado a uma rotina de trabalho específica e exigente.

**Perfil do utilizador (rotina real que define o produto):**
- Desenvolvedor de software, 23 anos
- Acorda ~5h
- Sai de casa às 6h
- Trabalha de 2ª a 6ª, das ~7h/8h às 17h
- Chega a casa entre 20h–21h (deslocação longa)
- Problema central: **hidratação** — no inverno a sensação de sede reduz, e frequentemente só bebe água ao sentir sede ou depois de comer, resultando em baixa ingestão diária

**Objetivo do produto:** app simples, sem fricção, sem login, que ajude a criar consistência em 5 hábitos-base, com foco especial e granular na água (que precisa de acompanhamento ao longo do dia, não um simples "feito/não feito").

**Não-objetivos do MVP:** múltiplos utilizadores com contas, rede social/partilha, personalização avançada de hábitos além do essencial, analytics de terceiros, monetização.

---

## 2. Princípios de Design do Produto

1. **Sem autenticação.** Identidade = `device_id` anónimo (UUID) gerado no primeiro acesso e guardado em `localStorage`. Todos os dados no backend são associados a este ID. Não há password, não há email.
2. **Onboarding mínimo.** Idade + descrição livre da rotina (texto), interpretada por um **parser local baseado em regras** (não IA externa — decisão tomada para não depender de internet/API key nesse passo e manter previsibilidade).
3. **Água é um hábito diferente dos outros.** Não é boolean, é um contador acumulado ao longo do dia, com lembretes ancorados a momentos fixos da rotina (não notificações genéricas).
4. **Poucos hábitos, bem cumpridos** > muitos hábitos abandonados. MVP fixo em 5 hábitos-base + possibilidade de adicionar hábitos customizados (ver secção 6.4).
5. **Gamificação leve**: pontos, streaks, badges simples. Nada de leaderboard (utilizador único).

---

## 3. Escopo do MVP

### Incluído
- Onboarding local (idade + rotina em texto livre → parsing por regras)
- 5 hábitos pré-definidos + criação de hábitos custom
- Tracking diário com distinção `dias úteis` vs `todos os dias`
- Água como contador acumulado com lembretes horários
- Push notifications reais (funcionam com a app fechada)
- Gamificação: pontos, streaks por hábito, badges por marcos
- Ecrã de progresso (histórico, gráficos simples, streaks)
- PWA instalável, funcional offline para leitura/registo (sync quando volta a haver rede)

### Fora do MVP (backlog futuro)
- Login/múltiplos dispositivos sincronizados por conta
- Notificações inteligentes adaptativas (ex: ajustar horário de lembrete com base no histórico)
- IA real no onboarding
- Exportação de dados / relatórios PDF
- Modo social / partilha de progresso

---

## 4. Arquitetura Técnica

### 4.1 Stack
- **Next.js (App Router)** — fullstack num único projeto. Frontend em `src/app/**`, backend em `src/app/api/**` (Route Handlers).
- **Deploy: Vercel** (plano Hobby/gratuito)
- **Base de dados: Neon Postgres** (serverless, integra bem com Vercel)
- **Push: Web Push API com VAPID** (`web-push` npm package)
- **Agendamento dos lembretes: GitHub Actions** (scheduled workflow, cron a cada 5 min) — porque o Vercel Cron no plano Hobby só permite 1 execução/dia, o que é insuficiente para lembretes espalhados ao longo do dia. O GitHub Actions faz de "despertador externo" gratuito, chamando uma rota protegida do Next.js.
  - **Repositório GitHub: público.** Isto torna os minutos do Actions ilimitados e grátis, permitindo a frequência de 5 min sem preocupação de custo. Não há risco de segurança em ser público: nenhum segredo (`CRON_SECRET`, `VAPID_PRIVATE_KEY`, connection string da Postgres) fica no código — todos ficam em GitHub Secrets / variáveis de ambiente da Vercel.
  - **Precisão esperada:** janela de atraso de ~5 minutos em relação ao horário exato configurado, mais um atraso ocasional e imprevisível do próprio GitHub Actions em picos de carga da plataforma (fora do nosso controlo, acontece mesmo em crons mais frequentes). Não há garantia de "exatamente 1 minuto antes" sem um scheduler pago dedicado — mas na prática deve ficar sempre próximo do horário definido.
- **PWA**: `manifest.json` + `service worker` (escrito manualmente, sem `next-pwa`, por compatibilidade com Next.js recente)

### 4.2 Diagrama de fluxo (alto nível)

```
[Browser/PWA] ──(1) regista device_id + subscription push──> [Next.js API /api/push/subscribe] ──> [Neon Postgres]

[GitHub Actions cron */15 * * * *] ──(2) POST c/ CRON_SECRET──> [Next.js API /api/cron/check-reminders]
        │
        └──> lê todas as subscriptions + configs de água/hábitos da Postgres
        └──> para cada device, verifica se algum horário de lembrete cai na janela dos últimos 15 min
        └──> dispara Web Push (via biblioteca `web-push`) para os devices elegíveis

[Browser/PWA] ──(3) recebe push mesmo com app fechada──> Service Worker mostra notificação
[Browser/PWA] ──(4) regista progresso (água, hábitos)──> [Next.js API /api/state] ──> [Neon Postgres]
```

### 4.3 Porque este desenho e não outro
- Next.js sozinho é suficiente como backend — não há necessidade de um servidor separado (Express, etc.). As Route Handlers correm em serverless functions da Vercel.
- Sem GitHub Actions, os lembretes de água ficariam limitados a 1x/dia no plano gratuito — inaceitável dado o objetivo principal do produto.
- Sem device_id anónimo, seria necessário login — rejeitado explicitamente para manter o MVP com zero fricção de entrada.

---

## 5. Modelo de Dados (Postgres / Neon)

```sql
-- Identidade anónima do dispositivo
CREATE TABLE devices (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Perfil resultante do onboarding
CREATE TABLE profiles (
  device_id UUID PRIMARY KEY REFERENCES devices(id) ON DELETE CASCADE,
  idade INT NOT NULL,
  acordar TIME NOT NULL,       -- ex: 05:00
  sair TIME NOT NULL,          -- ex: 06:00
  chegar TIME NOT NULL,        -- ex: 20:30
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hábitos ativos por dispositivo (5 pré-definidos + custom)
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,                 -- 'agua', 'sono', 'movimento', 'pequeno-almoco', 'pausa-olhos', ou custom-<uuid>
  nome TEXT NOT NULL,
  descricao TEXT,
  schedule TEXT NOT NULL CHECK (schedule IN ('daily','weekdays')),
  is_counter BOOLEAN NOT NULL DEFAULT false,   -- true só para 'agua' (ou outros contadores custom)
  meta_valor INT,                              -- ex: meta de copos/ml, null se não for contador
  pontos_por_conclusao INT NOT NULL DEFAULT 10,
  icon TEXT NOT NULL DEFAULT 'circle',
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configuração específica de água (lembretes horários)
CREATE TABLE water_config (
  device_id UUID PRIMARY KEY REFERENCES devices(id) ON DELETE CASCADE,
  goal_ml INT NOT NULL DEFAULT 2000,
  cup_ml INT NOT NULL DEFAULT 250,
  reminder_times TIME[] NOT NULL   -- ex: {05:15, 07:30, 10:00, 12:30, 15:30, 18:00, 20:30}
);

-- Registo diário por hábito
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  concluido BOOLEAN NOT NULL DEFAULT false,
  valor INT,                        -- usado por hábitos-contador (ex: ml de água bebida)
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (device_id, habit_id, log_date)
);

-- Streaks por hábito (cache calculado, evita recomputar sempre)
CREATE TABLE streaks (
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  atual INT NOT NULL DEFAULT 0,
  maior INT NOT NULL DEFAULT 0,
  ultima_data DATE,
  PRIMARY KEY (device_id, habit_id)
);

-- Pontuação total (cache)
CREATE TABLE pontuacao (
  device_id UUID PRIMARY KEY REFERENCES devices(id) ON DELETE CASCADE,
  pontos_totais INT NOT NULL DEFAULT 0
);

-- Subscriptions de push (Web Push API)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evita reenviar o mesmo lembrete na mesma janela de 15 min
CREATE TABLE reminder_dispatch_log (
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  dispatch_date DATE NOT NULL,
  reminder_time TIME NOT NULL,
  enviado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id, habit_id, dispatch_date, reminder_time)
);
```

**Índices recomendados:** `daily_logs(device_id, log_date)`, `push_subscriptions(device_id)`.

---

## 6. Hábitos

### 6.1 Hábitos pré-definidos (seed no onboarding)

| Slug | Nome | Schedule | Tipo | Pontos |
|---|---|---|---|---|
| `agua` | Água | daily | contador (ml) | 20 |
| `sono` | Dormir cedo | daily | boolean | 15 |
| `movimento` | Movimento | weekdays | boolean | 10 |
| `pequeno-almoco` | Primeira refeição | weekdays | boolean | 10 |
| `pausa-olhos` | Pausa para os olhos | weekdays | boolean | 10 |

### 6.2 Água — regras especiais
- Meta diária configurável (default 2000ml), incremento por "copo" configurável (default 250ml)
- UI: botões rápidos de incremento (+1 copo / +custom) na Home
- Lembretes calculados automaticamente a partir do perfil (`acordar`, `sair`, `chegar`) no onboarding, distribuídos em ~6-7 pontos ao longo do dia acordado, mas **editáveis manualmente** no ecrã de Perfil
- Conclusão do hábito = atingir a meta do dia (não precisa de ser exato, ≥ meta conta como concluído para streak/pontos)

### 6.3 Cálculo de streaks
- Streak incrementa quando o hábito é concluído em dias consecutivos aplicáveis ao seu `schedule` (ex: hábito `weekdays` não quebra streak num sábado/domingo, esses dias são ignorados no cálculo)
- Streak quebra se um dia aplicável passa sem conclusão
- Atualização do streak acontece server-side, no mesmo pedido que grava o `daily_log` (recalcula `atual`/`maior` e escreve em `streaks`)

### 6.4 Adicionar hábito customizado (ecrã "Add")
Formulário simples:
- Nome (texto)
- Descrição (opcional)
- Tipo: boolean (feito/não feito) ou contador (com meta numérica e unidade livre, ex: "páginas", "minutos")
- Schedule: todos os dias / dias úteis
- Pontos por conclusão (default 10, editável)

Ao guardar → `POST /api/habits` cria registo em `habits` associado ao `device_id`. Passa a aparecer na Home a partir do dia seguinte (ou imediatamente, se ainda for hoje e o hábito for aplicável ao dia da semana atual).

---

## 7. Onboarding — Parser Local de Rotina

**Input:** idade (número) + texto livre, ex: *"acordo às 5h, trabalho de dev, saio de casa às 6h e chego a casa entre 20h e 21h"*

**Processo (sem chamada externa, tudo client-side ou numa function pura no backend):**
1. Extração de horários via regex (padrões `\d{1,2}h\d{0,2}`, `\d{1,2}:\d{2}`, palavras-chave: "acordo", "levanto", "saio", "chego", "volto")
2. Mapeamento das palavras-chave encontradas para os 3 campos do perfil: `acordar`, `sair`, `chegar`
3. Se um campo não for detetado, o utilizador é levado a preenchê-lo manualmente num pequeno formulário de fallback (nunca bloquear o onboarding por falha do parser)
4. Com os 3 horários, gera-se automaticamente:
   - `reminder_times` da água (distribuídos entre `acordar` e `chegar`)
   - Confirmação visual: "Percebi isto — confirma ou ajusta" antes de gravar

**Nota de transparência para o utilizador:** este parser é determinístico (regras), não é um modelo de IA generativa — decisão tomada para o app funcionar sem depender de internet nesse passo.

---

## 8. Gamificação

- **Pontos por hábito concluído** (ver tabela 6.1), somados a `pontuacao.pontos_totais`
- **Streaks** por hábito (secção 6.3), mostrados com ícone de "fogo" e contagem
- **Badges** por marcos de streak (ex: 3, 7, 14, 30, 60, 100 dias) — calculados no cliente a partir do valor de `streaks.maior`, sem tabela dedicada no MVP (derivado, não armazenado)
- Sem comparação social — é um jogo do utilizador contra o seu próprio histórico

---

## 9. Push Notifications — Implementação Detalhada

### 9.1 Setup inicial
- Gerar par de chaves VAPID (`web-push generate-vapid-keys`), guardar `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` como env vars na Vercel
- Chave pública exposta ao frontend via `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

### 9.2 Fluxo de subscrição (cliente)
1. Utilizador aceita permissão de notificações (`Notification.requestPermission()`)
2. Service worker regista-se (`navigator.serviceWorker.register('/sw.js')`)
3. `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })`
4. Subscription (endpoint, p256dh, auth) enviada para `POST /api/push/subscribe` junto com `device_id`
5. Backend faz upsert em `push_subscriptions`

### 9.3 Disparo dos lembretes
- **Trigger externo:** GitHub Actions (repositório público), workflow com `schedule: cron: '*/5 * * * *'`, faz `POST` autenticado (header `Authorization: Bearer ${{ secrets.CRON_SECRET }}`) para `https://<app>.vercel.app/api/cron/check-reminders`
- **Rota `/api/cron/check-reminders`:**
  1. Valida `CRON_SECRET`
  2. Calcula janela de tempo atual (ex: agora ± 2,5 min, para cobrir o intervalo entre execuções)
  3. Query: para cada `device` com `water_config.reminder_times` (ou outros hábitos com lembrete, se expandido no futuro) que caia dentro da janela, e que ainda não tenha entrada em `reminder_dispatch_log` para essa data/horário
  4. Para cada match: busca `push_subscriptions` do device, envia notificação via `web-push`, regista em `reminder_dispatch_log`
  5. Payload da notificação: título curto ("Hora de beber água 💧"), corpo com progresso do dia (ex: "Já bebeste 750ml de 2000ml")

### 9.4 Service Worker (`public/sw.js`)
- Evento `push`: parse do payload JSON, `self.registration.showNotification(title, { body, icon, badge, data })`
- Evento `notificationclick`: foca/abre a PWA na Home

### 9.5 Falhas e limpeza
- Se `web-push` devolver erro 410/404 (subscription expirada), remover a linha correspondente de `push_subscriptions`

---

## 10. Navegação e Ecrãs (Bottom Nav — 4 items)

```
┌─────────────────────────────────┐
│                                  │
│           (conteúdo)            │
│                                  │
├───────┬───────┬───────┬─────────┤
│ Home  │Progress│  Add  │ Profile │
└───────┴───────┴───────┴─────────┘
```

### 10.1 Home
- Lista dos hábitos aplicáveis ao dia de hoje (respeita `daily` vs `weekdays`)
- Água em destaque no topo: barra de progresso + botões de incremento rápido
- Restantes hábitos: toggle simples feito/não feito
- Pontos do dia e streak atual visíveis no topo

### 10.2 Progress
- Histórico por hábito (últimos 7/30 dias, visualização tipo grelha de contribuições)
- Streak atual e maior streak por hábito
- Pontos totais acumulados
- Gráfico simples de água (ml/dia, últimos 7 dias)

### 10.3 Add
- Formulário de criação de hábito customizado (secção 6.4)
- Lista dos hábitos existentes com opção de desativar (`ativo = false`, não apaga histórico)

### 10.4 Profile
- Dados do onboarding (idade, horários) — editáveis
- Configuração de água (meta, tamanho do copo, horários dos lembretes — editáveis manualmente)
- Gestão de permissão de notificações (ativar/desativar)
- Reset de dados (apaga tudo do `device_id` local e remoto)

---

## 11. API Routes (resumo)

| Rota | Método | Função |
|---|---|---|
| `/api/onboarding` | POST | Cria `device`, `profile`, seed dos 5 hábitos + `water_config` |
| `/api/state` | GET | Devolve estado completo do device (perfil, hábitos, logs recentes, streaks, pontos) |
| `/api/habits` | POST | Cria hábito customizado |
| `/api/habits/:id` | PATCH | Edita/desativa hábito |
| `/api/logs` | POST | Regista/atualiza conclusão de um hábito num dia (recalcula streak + pontos) |
| `/api/water-config` | PATCH | Atualiza meta, tamanho do copo, horários dos lembretes |
| `/api/push/subscribe` | POST | Regista subscription de push |
| `/api/push/subscribe` | DELETE | Remove subscription |
| `/api/cron/check-reminders` | POST | Chamado pelo GitHub Actions; dispara pushes elegíveis |

---

## 12. Segurança e Privacidade (considerações do MVP)

- Sem PII além da idade — não há nome, email, etc.
- `device_id` é o único identificador; se perdido (ex: limpar localStorage), o histórico fica órfão na base de dados (aceitável para MVP; reset manual disponível no Profile)
- `CRON_SECRET` protege a rota de disparo de notificações contra chamadas externas não autorizadas
- Sem cookies de tracking, sem analytics de terceiros no MVP

---

## 13. Fora de escopo — mas a considerar no futuro
- Login opcional para sincronizar entre dispositivos
- Ajuste dinâmico dos horários de lembrete com base em quando o utilizador costuma registar água (aprendizagem simples de padrão)
- Exportar histórico (CSV/PDF)
- Modo "fim de semana" com hábitos diferentes dos dias úteis (hoje só existe daily/weekdays)
- **Camada de dados com TanStack Query (React Query)** — substituir o padrão atual (`useState`/`useEffect` + `fetch` com skeleton) por TanStack Query, para uma sensação de tempo real: cache, `stale-while-revalidate`, **atualizações otimistas** e refetch em background, sem loaders longos. Aplica-se sobretudo ao onboarding e à home. Decisão explícita do utilizador — sobrepõe-se, para este fim, à regra do CLAUDE.md de evitar libs de estado (o TanStack gere *server state*, não é um Redux/Zustand). Complementa a PWA: o cache pode ser persistido para leitura offline.
- **Onboarding mais fluido** — melhorar transições e feedback aproveitando a camada acima (mostrar dados otimistas, sem esperar pela rede).
