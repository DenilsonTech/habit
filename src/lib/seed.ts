import type { HabitSchedule } from "@/lib/types";
import { hhmmToMinutes, minutesToHhmm } from "@/lib/time";

// Hábitos pré-definidos semeados no onboarding (PRD 6.1) + defaults de perfil/água.

export interface SeedHabit {
  slug: string;
  nome: string;
  schedule: HabitSchedule;
  isCounter: boolean;
  unidade: string | null;
  pontosPorConclusao: number;
  icon: string;
  reminderTimes: string[];
}

// Único hábito default: água (usa os horários do water_config). Todos os
// restantes são criados pelo utilizador — arranca com timeline vazia.
export const PREDEFINED_HABITS: SeedHabit[] = [
  { slug: "agua", nome: "Água", schedule: "daily", isCounter: true, unidade: "ml", pontosPorConclusao: 20, icon: "droplet", reminderTimes: [] },
];

// Rotina default (perfil do PRD) — editável no Perfil.
export const DEFAULT_PROFILE = { acordar: "05:00", sair: "06:00", chegar: "20:30" };
export const DEFAULT_GOAL_ML = 2000;
export const DEFAULT_CUP_ML = 250;

// Distribui ~count lembretes de água uniformemente entre acordar e chegar.
export function generateReminderTimes(
  acordar: string,
  chegar: string,
  count = 7,
): string[] {
  const start = hhmmToMinutes(acordar);
  let end = hhmmToMinutes(chegar);
  if (end <= start) end = start + 60;
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) =>
    minutesToHhmm(Math.round(start + step * i)),
  );
}
