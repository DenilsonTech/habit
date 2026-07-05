# GAMIFICAÇÃO.md — Plano (badges, feedback, streaks, multietapas, timer)

Plano de trabalho para tornar a app mais divertida e recompensadora. **Isto é o
plano; a implementação faz-se por fases, à medida que dermos luz verde.** Segue
os princípios do `CLAUDE.md`/`DESIGN.md`: dark, **um único acento (verde vital)**,
Hugeicons, shadcn, mobile-first, tudo **otimista/realtime** (TanStack), sem libs
de estado novas, sem over-engineering.

> **Decisões tomadas (2026-07):**
> - **Ícones/animação:** por agora **animamos os Hugeicons com Framer Motion**
>   (flame pulsa, badge zoom+brilho, check com *spring*). Os ícones *animados* do
>   Iconsax são pagos/licenciados e não extraíveis do site; ficam para later se
>   houver assets Lottie + licença (a animação de movimento é ortogonal ao asset).
> - As 6 decisões em aberto ficam nas **recomendações** (verde on-brand nos badges,
>   "dia ativo" = ≥1 conclusão, multietapas com nome, timer de foco, bónus pequeno,
>   marcos por mensagem).
> - **Fase 1 — feita** (água incremental + micro-feedback). Restantes por fazer.

---

## 0. Estado atual (para referência)

- **Habit**: `isCounter`, `metaValor`, `unidade`, `pontosPorConclusao`, `schedule`
  (`daily`/`weekdays`), `reminderTimes[]`, `lembrete`.
- **DailyLog** (1 por hábito/dia): `concluido`, `valor` (int, só usado por contadores como a água).
- **Streak** (já é **por hábito**): `atual`, `maior`, `ultimaData`. `computeStreak`
  ignora fins de semana em hábitos `weekdays` e não quebra por "hoje ainda não feito".
- **Pontuacao**: `pontosTotais` = soma de `pontosPorConclusao` de todos os logs concluídos.
- **Feedback hoje**: só existe o drawer **"Conseguiu!"** quando **todos** os hábitos do dia estão feitos.
- **Add drawer**: já **recolhe** `tipo` (simples), `etapas` e `minutos`
  (ver `detalhes-step.tsx`), mas o `criar()` só envia `{nome, descricao, icon, tipo, dias, lembrete, horarios}`
  e o `POST /api/habits` **ignora o `tipo`** — cria tudo como binário. Ou seja, há
  UI meia-feita à espera de ser ligada.

---

## 1. Água → progresso incremental 🟢 (rápido, sem modelo)

**Problema:** o "PROGRESSO DE HOJE" só sobe quando bebes **todos** os copos, porque
a água só conta como `concluido` ao atingir a meta.

**Proposta:** o progresso do dia passa a ser a **média das frações de conclusão**:
- Hábito binário → `0` ou `1`.
- Hábito contador (água) → `min(valor / metaValor, 1)`.

Assim, cada copo empurra a percentagem para cima (ex.: 3/8 copos = a água contribui 0.375).

**Onde:** cálculo do `todayPct` na home + a barra do `DailyProgressCard`.
Sem alteração de modelo. Os copos em si já enchem um a um — só falta o número/anel do topo acompanhar.

**Decisão:** o `celebration "Conseguiu!"` continua a disparar só aos 100%.

---

## 2. Micro-incentivos por tarefa 🟢 (rápido, sem modelo)

**Problema:** concluir **uma** tarefa (de 5) não dá nenhum retorno — só há festa quando fazes tudo.

**Proposta — feedback a cada conclusão** (não precisa de serem todas):
- **Toast de pontos**: "+10 ✨" a subir junto ao hábito marcado (verde).
- **Animação do check**: o círculo enche com *spring* + pequeno *burst* de partículas verdes (Framer Motion).
- **Mensagens progressivas** conforme o nº feito hoje: `1` → "Começaste bem 💪", `~metade` → "A meio!", penúltimo → "Falta pouco!", `100%` → drawer "Conseguiu!".
- **Feedback de streak** (ver §3): se ao concluir a streak do hábito subir, mostra "🔥 3 dias seguidos!".
- **Háptica** (`navigator.vibrate`) onde suportado (Android). iOS PWA não vibra — degrada em silêncio.

Sem alteração de modelo. Novo componente `PointsToast` + animações. Os pontos já são atribuídos no backend.

---

## 3. Streaks à mostra + streak global de dias 🟡 (modelo mínimo/opcional)

**Problema:** "quando faço uma tarefa não há nada" — as streaks existem na BD mas quase não aparecem.

**Proposta:**
1. **Streak por hábito** (já temos): mostrar `🔥N` na linha do hábito quando `atual ≥ 2`.
2. **Streak global de dias** — o motivador principal, e **não exige fazer tudo**: nº de
   **dias seguidos "ativos"**. Fica no topo (junto ao 🔥 do card).
3. **Ao concluir**, se a streak (do hábito ou global) subir → mensagem de reforço.

**"Dia ativo" = ?** → *decisão em aberto* (ver fundo). Recomendação: **≥1 conclusão nesse dia** (mais generoso e motivador).

**Modelo:** o streak global pode ser **calculado on-read** a partir dos `daily_logs`
(reutilizando a lógica do `computeStreak` sobre "dias com ≥1 conclusão"), evitando escrever mais.
Alternativa: guardar `diaStreakAtual`/`diaStreakMaior` em `Pontuacao` (mais rápido de ler). Recomendo **calcular on-read** primeiro.

---

## 4. Conquistas / Badges 🔴 (modelo novo)

O grande bloco de gamificação.

**Modelo de dados (novo):**
```prisma
model Conquista {
  id             String   @id @default(uuid()) @db.Uuid
  deviceId       String   @map("device_id") @db.Uuid
  chave          String   // ex: "streak-7", "agua-perfeita", "madrugador"
  desbloqueadoEm DateTime @default(now()) @map("desbloqueado_em") @db.Timestamptz(6)
  device Device @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  @@unique([deviceId, chave])
  @@map("conquistas")
}
```

**Definições em código** (`src/lib/badges.ts`): catálogo estático — cada badge tem
`chave`, `nome`, `descricao`, `icon` (Hugeicons), `tier` e um **predicado** que recebe
as estatísticas do device e diz se está desbloqueado.

**Avaliação:** no `POST /api/logs` (a seguir a recalcular pontos/streak), corre-se o
catálogo; os que passam e ainda não existem em `conquistas` são **inseridos** e
**devolvidos** ao cliente como `novasConquistas` → dispara um drawer de desbloqueio.
Idempotente pela `@@unique`.

**UI:** `Perfil → Conquistas` — grelha de cartões. Bloqueado = contorno esmaecido +
ícone cinza; desbloqueado = verde preenchido + data. Desbloquear = drawer com o
badge a dar zoom + brilho (Framer Motion).

**Catálogo inicial (proposta):**

| Categoria | Exemplos |
|---|---|
| Primeiros passos | 1ª conclusão · 1º hábito criado · 1º dia 100% |
| Streaks | 3 / 7 / 30 / 100 dias seguidos (global) |
| Água | 1 dia de meta batida · 7 dias de água · "hidratado" (30 dias) |
| Volume | 50 / 250 / 1000 conclusões totais |
| Consistência | Semana perfeita (7/7 dias ativos) · Mês perfeito |
| Hora | Madrugador (conclusão antes das 07h) · Coruja (depois das 22h) |

**Pontos/níveis:** badges podem dar **pontos-bónus**; opcionalmente um sistema de
**níveis** (Nível N a partir do total de pontos, com barra). → *decisão em aberto*.

---

## 5. Atividades multietapas 🔴 (modelo novo)

Ex.: "Rotina da manhã" = lavar dentes → arrumar cama → beber água.

**Modelo:**
```prisma
enum HabitTipo { SIMPLES CONTADOR MULTIETAPAS TIMER }
// Habit:
tipo   HabitTipo @default(SIMPLES)
passos String[]  @default([])   // rótulos dos passos (só multietapas)
// (isCounter passa a derivar-se de tipo == CONTADOR; migramos os dados de teste)
```
Para o **estado por dia** (quais passos feitos) o `valor:int` não chega. Adicionamos
um campo flexível reutilizável também pelo timer:
```prisma
// DailyLog:
detalhe Json?   // multietapas: { passosFeitos: number[] } | timer: { segundos, aRodarDesde }
```

**Semântica:** `concluido` quando todos os passos estão feitos. Progresso = `feitos / total`
(entra na média do §1). Micro-feedback (§2) a cada passo marcado.

**UI:** a linha do hábito expande numa **checklist**; tocar num passo alterna; anel/barra
mostra a fração. Otimista, como tudo.

**Add:** o drawer já tem `etapas` (número) — mas para uma checklist com sentido
precisamos dos **nomes** dos passos → *decisão em aberto* (passos com nome vs só contagem).
Recomendo **passos com nome** (editor de linhas no `DetalhesStep`).

---

## 6. Atividades com timer 🔴 (modelo novo — usa o mesmo `detalhe`)

Ex.: "Ler livro 20 min".

**Modelo:** `tipo = TIMER`, `metaValor = 20` (minutos), `unidade = "min"`. Estado por
dia em `DailyLog.detalhe = { segundos: number, aRodarDesde: string | null }`.

**Como conta (recomendado — "timer de foco"):**
- Botão **Iniciar/Pausar**. Enquanto corre, conta o tempo.
- **Pausa automática quando sais da app** (`visibilitychange`) — o service worker
  **não** consegue contar em segundo plano no iOS, por isso não fingimos que conta.
- Persiste o acumulado (`segundos`) com *debounce*; ao voltar, retoma.
- Ao atingir `metaValor` → **concluído** + pontos. Progresso = `segundos / (meta*60)`.

*Alternativa* (menos honesta): "relógio de parede desde o início" — conta mesmo com a
app fechada. Não recomendo para hábitos como ler. → *decisão em aberto*.

**UI:** anel a encher + tempo restante + Iniciar/Pausar. **Add:** já recolhe `minutos`.

---

## Resumo das alterações ao modelo (via `prisma db push`, sem migrations)

- **Habit**: `+ tipo HabitTipo`, `+ passos String[]` (isCounter derivado de tipo).
- **DailyLog**: `+ detalhe Json?` (estado de multietapas e timer).
- **Novo**: `Conquista` (+ relação em `Device`).
- **Pontuacao**: *opcional* `diaStreakAtual/Maior` (ou calcular on-read).
- **Novo enum**: `HabitTipo`.

Persistir a `CreateHabitInput`/`POST /api/habits` os campos que o Add já recolhe
(`tipo`, `etapas`→`passos`, `minutos`→`metaValor`).

---

## Faseamento (cada fase é entregável por si só)

1. **Fase 1 — Diversão imediata** *(sem modelo)*: água incremental (§1) + micro-feedback por conclusão (§2). Máximo impacto, mínimo risco.
2. **Fase 2 — Streaks à mostra** (§3): 🔥 por hábito + streak global de dias + reforço ao subir.
3. **Fase 3 — Conquistas** (§4): modelo `Conquista` + catálogo + avaliação no logs route + página + drawer de desbloqueio.
4. **Fase 4 — Multietapas** (§5): `tipo` + `passos` + `detalhe` + checklist + Add.
5. **Fase 5 — Timer** (§6): timer de foco + `detalhe` + UI + Add.

---

## Decisões em aberto (a tua opinião destrava a codificação)

1. **Cor dos badges** — tudo verde (bloqueado/desbloqueado) para manter o acento único, ou permitir **tiers com cor** (bronze/prata/ouro)? *Rec.: verde on-brand, tier indicado por rótulo/brilho subtil.*
2. **"Dia ativo" (streak global)** — ≥1 conclusão? ≥metade dos hábitos? bater a meta de água? *Rec.: ≥1 conclusão (mais motivador).*
3. **Multietapas** — passos **com nome** (checklist real) ou só "3 de 5"? *Rec.: com nome.*
4. **Timer** — conta só com a app **aberta** (pausa ao sair) ou **relógio de parede** desde o início? *Rec.: só aberta (foco).*
5. **Pontos/níveis** — badges dão pontos-bónus? Queres um sistema de **níveis**? *Rec.: bónus pequeno já; níveis numa fase later.*
6. **Marcos intermédios** — além dos 100%, queres celebrar marcos (ex.: 50% do dia)? *Rec.: mensagens progressivas sim, drawer só aos 100%.*
