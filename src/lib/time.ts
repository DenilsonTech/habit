// Toda a app raciocina no fuso do utilizador: Africa/Maputo (CAT, UTC+2, sem
// horário de verão). O GitHub Actions e a Vercel correm em UTC — estas funções
// fazem a ponte entre um instante absoluto (Date) e a hora "de parede" em Maputo.

export const APP_TIMEZONE = "Africa/Maputo";

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export interface MaputoParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
}

/** Decompõe um instante nas suas partes de data/hora no fuso de Maputo. */
export function maputoParts(date: Date = new Date()): MaputoParts {
  const map = new Map<string, string>(
    partsFormatter.formatToParts(date).map((p) => [p.type, p.value]),
  );
  const n = (type: string) => Number(map.get(type));
  let hour = n("hour");
  if (hour === 24) hour = 0; // alguns motores devolvem "24" à meia-noite
  return {
    year: n("year"),
    month: n("month"),
    day: n("day"),
    hour,
    minute: n("minute"),
    second: n("second"),
  };
}

/** Data atual em Maputo no formato 'YYYY-MM-DD' (usada como log_date). */
export function maputoDateString(date: Date = new Date()): string {
  const p = maputoParts(date);
  const mm = String(p.month).padStart(2, "0");
  const dd = String(p.day).padStart(2, "0");
  return `${p.year}-${mm}-${dd}`;
}

/** Minutos desde a meia-noite em Maputo (0–1439). Base do matching de lembretes. */
export function maputoMinutesOfDay(date: Date = new Date()): number {
  const p = maputoParts(date);
  return p.hour * 60 + p.minute;
}

/** O dia da semana em Maputo é dia útil (2ª–6ª)? */
export function isWeekdayInMaputo(date: Date = new Date()): boolean {
  const p = maputoParts(date);
  // getUTCDay sobre a data-calendário de Maputo dá o dia da semana correto (0=Dom).
  const dow = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
  return dow >= 1 && dow <= 5;
}

/** 'HH:MM' -> minutos desde a meia-noite. */
export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** minutos desde a meia-noite -> 'HH:MM'. */
export function minutesToHhmm(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const hh = String(Math.floor(norm / 60)).padStart(2, "0");
  const mm = String(norm % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}
