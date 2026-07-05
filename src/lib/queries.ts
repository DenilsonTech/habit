"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cupsFromGoal, generateReminderTimes } from "@/lib/seed";

export interface StateHabit {
  id: string;
  slug: string;
  nome: string;
  schedule: string;
  isCounter: boolean;
  metaValor: number | null;
  unidade: string | null;
  icon: string;
  pontos: number;
  horas: string[];
}

export interface AppState {
  onboarded: boolean;
  today: string;
  profile: { idade: number; acordar: string; sair: string; chegar: string };
  habits: StateHabit[];
  water: {
    goalMl: number;
    cupMl: number;
    reminderTimes: string[];
    lembretesAtivos: boolean;
    currentMl: number;
  } | null;
  logs: Record<string, { concluido: boolean; valor: number | null }>;
  streaks: Record<string, { atual: number; maior: number }>;
  pontos: number;
  diaStreak: number; // dias seguidos com ≥1 conclusão (streak global)
}

export interface CreateHabitInput {
  nome: string;
  descricao?: string;
  icon?: string;
  tipo: string;
  dias: string[];
  lembrete: boolean;
  horarios: string[];
}

const stateKey = (deviceId: string | null) => ["state", deviceId] as const;

// Ordena por hora do lembrete (mais cedo primeiro); sem hora vai para o fim.
// Espelha a ordenação do servidor (app-state.ts) para o insert otimista.
const firstHora = (h: StateHabit) =>
  h.horas.length ? [...h.horas].sort()[0] : "99:99";
const sortHabitsByHora = (habits: StateHabit[]) =>
  [...habits].sort((a, b) => firstHora(a).localeCompare(firstHora(b)));

async function fetchState(deviceId: string): Promise<AppState> {
  const res = await fetch(`/api/state?deviceId=${deviceId}`);
  if (!res.ok) throw new Error("Falha ao carregar o estado.");
  return res.json();
}

export function useAppState(deviceId: string | null) {
  return useQuery({
    queryKey: stateKey(deviceId),
    queryFn: () => fetchState(deviceId as string),
    enabled: !!deviceId,
  });
}

// Regista água/hábito com atualização otimista + reconciliação em background.
export function useLogHabit(deviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      habitId: string;
      concluido?: boolean;
      valor?: number;
    }) => {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId, ...vars }),
      });
      if (!res.ok) throw new Error("Falha ao registar.");
      return res.json();
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: stateKey(deviceId) });
      const prev = qc.getQueryData<AppState>(stateKey(deviceId));
      if (prev) {
        const next = structuredClone(prev);
        const habit = next.habits.find((h) => h.id === vars.habitId);
        if (vars.valor !== undefined) {
          const concluido = habit?.metaValor != null && vars.valor >= habit.metaValor;
          next.logs[vars.habitId] = { concluido: !!concluido, valor: vars.valor };
          if (next.water && habit?.slug === "agua") {
            next.water.currentMl = vars.valor;
          }
        } else {
          next.logs[vars.habitId] = {
            concluido: !!vars.concluido,
            valor: next.logs[vars.habitId]?.valor ?? null,
          };
        }
        qc.setQueryData(stateKey(deviceId), next);
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(stateKey(deviceId), ctx.prev);
    },
    // Aplica os pontos/streak autoritativos da resposta (realtime, sem refetch)
    // e marca o progresso para refazer (a agregação do histórico muda).
    onSuccess: (data, vars) => {
      qc.setQueryData<AppState>(stateKey(deviceId), (cur) =>
        cur
          ? {
              ...cur,
              pontos: data.pontos,
              diaStreak: data.diaStreak ?? cur.diaStreak,
              streaks: { ...cur.streaks, [vars.habitId]: data.streak },
            }
          : cur,
      );
      qc.invalidateQueries({ queryKey: ["progress", deviceId] });
    },
  });
}

export interface ProgressData {
  pontuacao: number;
  conclusoes: number;
  sequencia: number;
  melhorDia: string;
  weekly: { label: string; value: number }[];
  performance: { nome: string; pct: number }[];
  heatmap: number[];
  startDate: string;
}

export function useProgress(deviceId: string | null, days: number) {
  return useQuery({
    queryKey: ["progress", deviceId, days],
    queryFn: async (): Promise<ProgressData> => {
      const res = await fetch(
        `/api/progress?deviceId=${deviceId}&days=${days}`,
      );
      if (!res.ok) throw new Error("Falha ao carregar o progresso.");
      return res.json();
    },
    enabled: !!deviceId,
    placeholderData: (prev) => prev,
  });
}

// Cria um hábito custom; invalida o estado para a home refletir logo.
export function useCreateHabit(deviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: CreateHabitInput) => {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId, ...vars }),
      });
      if (!res.ok) throw new Error("Falha ao criar o hábito.");
      return res.json();
    },
    // Insere o hábito devolvido direto no cache (sem refetch -> sem delay).
    onSuccess: (data) => {
      const habit = data?.habit as StateHabit | undefined;
      if (habit) {
        qc.setQueryData<AppState>(stateKey(deviceId), (cur) =>
          cur
            ? {
                ...cur,
                habits: sortHabitsByHora([...cur.habits, habit]),
                streaks: { ...cur.streaks, [habit.id]: { atual: 0, maior: 0 } },
              }
            : cur,
        );
      } else {
        qc.invalidateQueries({ queryKey: stateKey(deviceId) });
      }
      qc.invalidateQueries({ queryKey: ["progress", deviceId] });
    },
  });
}

// Remove (soft-delete: ativo=false) um hábito, otimista. Histórico/pontos mantêm-se.
export function useRemoveHabit(deviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (habitId: string) => {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId, ativo: false }),
      });
      if (!res.ok) throw new Error("Falha ao remover o hábito.");
      return res.json();
    },
    onMutate: async (habitId) => {
      await qc.cancelQueries({ queryKey: stateKey(deviceId) });
      const prev = qc.getQueryData<AppState>(stateKey(deviceId));
      if (prev) {
        qc.setQueryData<AppState>(stateKey(deviceId), {
          ...prev,
          habits: prev.habits.filter((h) => h.id !== habitId),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(stateKey(deviceId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: stateKey(deviceId) });
      qc.invalidateQueries({ queryKey: ["progress", deviceId] });
    },
  });
}

export interface SaveWaterConfigInput {
  goalMl?: number;
  reminderTimes?: string[];
  lembretesAtivos?: boolean;
}

// Guarda a config de água (meta/horários/toggle) de forma otimista. Ao mudar a
// meta, os horários regeneram-se (um por copo); a resposta traz-nos os finais.
export function useSaveWaterConfig(deviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: SaveWaterConfigInput) => {
      const res = await fetch("/api/water-config", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId, ...vars }),
      });
      if (!res.ok) throw new Error("Não foi possível guardar.");
      return res.json() as Promise<{
        goalMl: number;
        cupMl: number;
        reminderTimes: string[];
        lembretesAtivos: boolean;
      }>;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: stateKey(deviceId) });
      const prev = qc.getQueryData<AppState>(stateKey(deviceId));
      if (prev?.water) {
        const next = structuredClone(prev);
        if (next.water) {
          if (vars.lembretesAtivos !== undefined) {
            next.water.lembretesAtivos = vars.lembretesAtivos;
          }
          if (vars.reminderTimes) next.water.reminderTimes = vars.reminderTimes;
          if (vars.goalMl !== undefined) {
            next.water.goalMl = vars.goalMl;
            // Regenera já os horários (um por copo) para feedback imediato.
            next.water.reminderTimes = generateReminderTimes(
              next.profile.acordar,
              next.profile.chegar,
              cupsFromGoal(vars.goalMl, next.water.cupMl),
            );
          }
        }
        qc.setQueryData(stateKey(deviceId), next);
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(stateKey(deviceId), ctx.prev);
    },
    onSuccess: (data) => {
      qc.setQueryData<AppState>(stateKey(deviceId), (cur) =>
        cur?.water
          ? {
              ...cur,
              water: {
                ...cur.water,
                goalMl: data.goalMl,
                cupMl: data.cupMl,
                reminderTimes: data.reminderTimes,
                lembretesAtivos: data.lembretesAtivos,
              },
            }
          : cur,
      );
    },
  });
}
