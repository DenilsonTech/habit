import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dateOnly } from "@/lib/db-time";
import { maputoDateString } from "@/lib/time";

// Rótulos por dia da semana (0 = Domingo, getUTCDay).
const DOW = ["Do", "Se", "Te", "Qa", "Qi", "Sx", "Sá"];

function weekdayIndex(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
function addDaysStr(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

// Métricas agregadas do histórico para um período (dias).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  const days = Math.min(366, Math.max(1, Number(searchParams.get("days") ?? 30)));
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId em falta." }, { status: 400 });
  }

  const today = maputoDateString();
  const start = addDaysStr(today, -(days - 1));

  const [habits, logs, streaks] = await Promise.all([
    prisma.habit.findMany({ where: { deviceId, ativo: true } }),
    prisma.dailyLog.findMany({
      where: { deviceId, concluido: true, logDate: { gte: dateOnly(start) } },
      select: { habitId: true, logDate: true },
    }),
    prisma.streak.findMany({ where: { deviceId }, select: { atual: true } }),
  ]);

  const dates: string[] = [];
  for (let i = 0; i < days; i++) dates.push(addDaysStr(start, i));

  const doneByDate = new Map<string, Set<string>>();
  const doneByHabit = new Map<string, number>();
  const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];
  let conclusoes = 0;

  for (const l of logs) {
    const ds = l.logDate.toISOString().slice(0, 10);
    if (!doneByDate.has(ds)) doneByDate.set(ds, new Set());
    doneByDate.get(ds)!.add(l.habitId);
    doneByHabit.set(l.habitId, (doneByHabit.get(l.habitId) ?? 0) + 1);
    weeklyCounts[weekdayIndex(ds)]++;
    conclusoes++;
  }

  const total = habits.length;

  // Slots aplicáveis (para pontuação e desempenho): daily = todos os dias;
  // weekdays = só 2ª–6ª.
  const applicableByHabit = new Map<string, number>();
  let totalSlots = 0;
  for (const h of habits) {
    let ap = 0;
    for (const ds of dates) {
      const wd = weekdayIndex(ds);
      if (h.schedule === "daily" || (wd >= 1 && wd <= 5)) ap++;
    }
    applicableByHabit.set(h.id, ap);
    totalSlots += ap;
  }

  const pontuacao = totalSlots ? Math.round((conclusoes / totalSlots) * 100) : 0;

  const performance = habits.map((h) => {
    const ap = applicableByHabit.get(h.id) ?? 0;
    const done = Math.min(doneByHabit.get(h.id) ?? 0, ap || Infinity);
    return { nome: h.nome, pct: ap ? Math.round((done / ap) * 100) : 0 };
  });

  const order = [1, 2, 3, 4, 5, 6, 0]; // Se..Do
  const weekly = order.map((dow) => ({
    label: DOW[dow],
    value: weeklyCounts[dow],
  }));

  let bestDow = 1;
  let bestVal = -1;
  for (const dow of order) {
    if (weeklyCounts[dow] > bestVal) {
      bestVal = weeklyCounts[dow];
      bestDow = dow;
    }
  }
  const melhorDia = bestVal > 0 ? DOW[bestDow] : "—";

  const heatmap = dates.map((ds) => {
    const c = doneByDate.get(ds)?.size ?? 0;
    const ratio = total ? c / total : 0;
    if (ratio === 0) return 0;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  });

  const sequencia = streaks.length
    ? Math.max(...streaks.map((s) => s.atual))
    : 0;

  return NextResponse.json({
    pontuacao,
    conclusoes,
    sequencia,
    melhorDia,
    weekly,
    performance,
    heatmap,
    startDate: start,
  });
}
