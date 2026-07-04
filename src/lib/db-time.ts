// Conversões entre as strings da app e os DateTime que o Prisma usa para
// @db.Time / @db.Date. Trabalhamos sempre em UTC para evitar deslocações de fuso
// na serialização (a lógica de fuso do utilizador vive em time.ts).

/** 'HH:MM' -> DateTime para uma coluna @db.Time. */
export function timeToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, h, m, 0));
}

/** DateTime de uma coluna @db.Time -> 'HH:MM'. */
export function dateToTime(d: Date): string {
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** 'YYYY-MM-DD' -> DateTime para uma coluna @db.Date. */
export function dateOnly(yyyymmdd: string): Date {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
