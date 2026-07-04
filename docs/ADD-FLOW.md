# ADD-FLOW.md — "Novo hábito" (drawer multi-step)

> **Estado: DOCUMENTADO, não implementado.** Especificação do fluxo de adicionar
> hábito, a refinar antes de construir. Nada disto está em código ainda.
> Ler junto de `PRD-habitos-app.md`, `DESIGN.md` e `CLAUDE.md`.

---

## 1. Comportamento geral

- O botão **＋** da bottom nav **não navega para uma página** (`/add`). Abre um
  **Drawer sobre a página toda** (bottom sheet que sobe e ocupa ~toda a altura).
  → A rota placeholder `/add` atual será **removida/substituída** por este drawer
  quando implementarmos.
- **Componente: shadcn `Drawer`** (baseado em Vaul). Instalar com
  `pnpm dlx shadcn@latest add drawer` na altura de construir.
- É um **drawer multi-step** (3 passos), não um simples formulário.
- **Header do drawer:**
  - Título centrado **"Novo hábito"** (ou **"Definir horário"** no passo 3).
  - **✕** (fechar) no canto superior direito.
  - **‹** (voltar) no canto superior esquerdo — a partir do passo 2/3.
- **Ação primária:** botão pill claro flutuante no fundo:
  **"Criar personalizada"** / **"Continuar"** / **"Criar hábito"** conforme o passo.
- **Transição entre passos:** slide (reutilizar a abordagem Framer Motion do
  onboarding, para consistência), sem gesto de dedo.
- Cores/estilo: seguir `DESIGN.md` (dark, accent Vital Green `#22C55E`, cantos
  muito arredondados, sombras suaves) e **Hugeicons stroke rounded**, sem emojis.

---

## 2. Passo 1 — Escolher (sugestões)

- **Categorias** em cards, scroll horizontal (ícone Hugeicons + label):
  **Saúde**, **Foco**, **Calma**, … (há mais à direita).
- **Lista de hábitos sugeridos** (por categoria), cada linha é um card com o nome
  e um **＋** à direita para adicionar direto (quick-add com defaults). Exemplos
  vistos: "Fazer a cama", "Lavar loiça imediatamente", "Limpar 10 minutos",
  "Preparar coisas para amanhã", "Limpar pó da mesa"…
- Botão flutuante **"Criar personalizada"** (ícone de lápis) → abre o passo 2.

## 3. Passo 2 — Detalhes do hábito (personalizado)

- **Preview** (card em mosaico) no topo, a mostrar o nome e o tamanho escolhido —
  pré-visualização de como o card aparece na home.
- **Nome do hábito** — input (ex: "Beber água de manhã").
- **Descrição** — input opcional.
- **Tamanho do mosaico** — segmented **S / M / L / XL** (define o tamanho do card
  na grelha/mosaico da home).
- **Tipo** — segmented:
  - **Simples** — "Apenas feito ou não" (boolean).
  - **Multi-etapas** — "Múltiplas etapas num hábito" → mostra **stepper − N +**
    para o número de etapas.
  - **Temporizador** — hábito com duração/timer.
- Botão **"Continuar"** → passo 3.

## 4. Passo 3 — Definir horário

- Subtítulo: *"Com que frequência vais fazer isto? Adiciona lembretes para manter
  a consistência."*
- **Dias** — seletor de dias da semana em círculos toggláveis: **Se Te Qa Qi Se
  Sá Do**.
- **Horários** — dentro de um card:
  - Toggle **"Lembrete"** (shadcn `Switch`).
  - Uma ou mais **horas** (ícone relógio + hora, ex: `13:00`); cada hora extra tem
    **✕** para remover.
  - Botão **"Adicionar"** para acrescentar outra hora.
- Botão **"Criar hábito"** → cria e fecha o drawer.

---

## 5. Componentes shadcn / libs a usar (quando construir)

- **`Drawer`** (Vaul) — o contentor multi-step.
- **`Input`**, **`Textarea`**, **`Label`** — nome/descrição.
- **`ToggleGroup`** — tamanho do mosaico, tipo, dias da semana.
- **`Switch`** — toggle de lembrete.
- **`Button`** — ações pill.
- **Framer Motion** — transição de passos (já instalado).
- **Hugeicons** (stroke rounded) — categorias, relógio, lápis, ✕, ‹.

---

## 6. ⚠️ Implicações no modelo de dados (decidir antes de implementar)

Este fluxo **vai além do PRD/schema atuais**. Para o suportar, `habits` (e afins)
precisaria de mudanças que devemos discutir:

- **`tipo`**: hoje o modelo é `is_counter` boolean (boolean vs contador). As
  referências têm **Simples / Multi-etapas / Temporizador** → provável enum novo.
- **`etapas`** (int): para o tipo Multi-etapas.
- **`tamanho_mosaico`** (S/M/L/XL): **novo** — implica layout em **mosaico/bento**
  na home (hoje temos timeline).
- **Dias da semana por hábito**: hoje só existe `schedule` = `daily` | `weekdays`.
  As referências deixam escolher dias individuais → passaria a um conjunto de dias.
- **Lembretes por hábito**: hoje só a água tem `reminder_times`. Aqui qualquer
  hábito pode ter toggle de lembrete + várias horas.
- **Categorias + hábitos sugeridos**: **novo** — precisamos de um catálogo/seed.

> Estas são expansões significativas ao PRD. **Não alterar o schema já** — decidir
> o que entra no MVP quando formos implementar o Add.

---

## 7. Nota sobre a Home (não implementar agora)

- A home deve passar a ter um **card de "daily progress"** no topo — estilo
  *"DEFINIR MISSÃO / PONTUAÇÃO DE HOJE 0% / ÚLTIMOS 30 DIAS 0%"* — **apenas esse
  card** (rever os stat tiles atuais).
- As referências mostram os hábitos como um **mosaico/bento** de cards de tamanhos
  variáveis (ligado ao "Tamanho do mosaico" do passo 2), em vez da timeline atual.
- **A refinar depois** — a home atual (v1) fica como está por agora.

---

## 8. Estado / próximos passos

- [x] Fluxo documentado (este ficheiro).
- [ ] Decidir as mudanças de schema/PRD (secção 6).
- [ ] Implementar o drawer shadcn multi-step.
- [ ] Substituir a rota `/add` pelo drawer aberto a partir da nav.
- [ ] Rever a home (card de daily progress + mosaico).
