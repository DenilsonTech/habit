import { aplicaNoDia } from "@/lib/dias";

// Cálculo de streak (PRD 6.3). Os dias aplicáveis dependem de `dias` do hábito
// (vazio = todos os dias): um dia não aplicável é ignorado, não quebra. O dia de
// hoje ainda por fazer também não quebra — só um dia passado aplicável em falta.

function prevDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

export function computeStreak(
  dias: string[],
  concluido: Set<string>,
  today: string,
): number {
  let atual = 0;
  let cursor = today;
  for (let i = 0; i < 400; i++) {
    if (aplicaNoDia(dias, cursor)) {
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
