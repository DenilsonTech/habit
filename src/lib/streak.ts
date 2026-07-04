import type { HabitSchedule } from "@/lib/types";

// Cálculo de streak (PRD 6.3). Dias aplicáveis dependem do schedule: um hábito
// `weekdays` não quebra ao fim-de-semana (esses dias são ignorados). O dia de
// hoje ainda por fazer não quebra a streak — só um dia passado em falta é que quebra.

function isWeekdayStr(date: string): boolean {
  const [y, m, d] = date.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dow >= 1 && dow <= 5;
}

function prevDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

export function computeStreak(
  schedule: HabitSchedule,
  concluido: Set<string>,
  today: string,
): number {
  let atual = 0;
  let cursor = today;
  for (let i = 0; i < 400; i++) {
    const applicable = schedule === "daily" || isWeekdayStr(cursor);
    if (applicable) {
      if (concluido.has(cursor)) {
        atual++;
      } else if (cursor !== today) {
        break; // dia passado aplicável em falta -> quebra
      }
      // hoje ainda por fazer: não quebra, continua
    }
    cursor = prevDay(cursor);
  }
  return atual;
}
