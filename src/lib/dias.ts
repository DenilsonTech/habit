// Dias da semana em que um hábito se aplica. Guardados em habits.dias como as
// chaves usadas no Add. Puro (sem prisma/react) -> usável no cliente e servidor.
//
// Índice = getUTCDay (0=Dom ... 6=Sáb).
export const DIA_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;
export type DiaKey = (typeof DIA_KEYS)[number];

/** Chave do dia da semana de uma data 'YYYY-MM-DD'. */
export function diaKeyForDate(dateStr: string): DiaKey {
  const [y, m, d] = dateStr.split("-").map(Number);
  return DIA_KEYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** O hábito aplica-se nesta data? `dias` vazio = todos os dias. */
export function aplicaNoDia(dias: string[], dateStr: string): boolean {
  return dias.length === 0 || dias.includes(diaKeyForDate(dateStr));
}

/** Mantém só chaves válidas (ignora lixo do cliente). */
export function sanitizeDias(dias: unknown): string[] {
  if (!Array.isArray(dias)) return [];
  return DIA_KEYS.filter((k) => dias.includes(k));
}
