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

// Água usa os horários do water_config; os restantes têm uma hora representativa.
export const PREDEFINED_HABITS: SeedHabit[] = [
  { slug: "agua", nome: "Água", schedule: "daily", isCounter: true, unidade: "ml", pontosPorConclusao: 20, icon: "droplet", reminderTimes: [] },
  { slug: "sono", nome: "Dormir cedo", schedule: "daily", isCounter: false, unidade: null, pontosPorConclusao: 15, icon: "moon", reminderTimes: ["22:30"] },
  { slug: "movimento", nome: "Movimento", schedule: "weekdays", isCounter: false, unidade: null, pontosPorConclusao: 10, icon: "run", reminderTimes: ["07:00"] },
  { slug: "pequeno-almoco", nome: "Primeira refeição", schedule: "weekdays", isCounter: false, unidade: null, pontosPorConclusao: 10, icon: "coffee", reminderTimes: ["06:30"] },
  { slug: "pausa-olhos", nome: "Pausa para os olhos", schedule: "weekdays", isCounter: false, unidade: null, pontosPorConclusao: 10, icon: "eye", reminderTimes: ["15:00"] },
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
