import { prisma } from "@/lib/prisma";
import { dateOnly, dateToTime } from "@/lib/db-time";
import { hhmmToMinutes, maputoDateString } from "@/lib/time";
import { computeStreak } from "@/lib/streak";

// Constrói o estado completo do device para hoje (Maputo). Partilhado por
// /api/state e /api/onboarding (para priming do cache sem refetch).
export async function getAppState(deviceId: string) {
  const profile = await prisma.profile.findUnique({ where: { deviceId } });
  if (!profile) return { onboarded: false as const };

  const today = maputoDateString();
  const [habits, waterConfig, pontuacao, logs, streaks, diasConcluidos, conquistas] =
    await Promise.all([
      prisma.habit.findMany({
        where: { deviceId, ativo: true },
        orderBy: { criadoEm: "asc" },
      }),
      prisma.waterConfig.findUnique({ where: { deviceId } }),
      prisma.pontuacao.findUnique({ where: { deviceId } }),
      prisma.dailyLog.findMany({ where: { deviceId, logDate: dateOnly(today) } }),
      prisma.streak.findMany({ where: { deviceId } }),
      // Dias distintos com ≥1 conclusão -> streak global de dias ativos.
      prisma.dailyLog.findMany({
        where: { deviceId, concluido: true },
        select: { logDate: true },
        distinct: ["logDate"],
      }),
      prisma.conquista.findMany({ where: { deviceId }, select: { chave: true } }),
    ]);

  const diasAtivos = new Set(
    diasConcluidos.map((l) => l.logDate.toISOString().slice(0, 10)),
  );
  const diaStreak = computeStreak("daily", diasAtivos, today);

  const aguaHabit = habits.find((h) => h.slug === "agua");
  const aguaLog = aguaHabit
    ? logs.find((l) => l.habitId === aguaHabit.id)
    : undefined;

  // Ordena por hora do lembrete (o mais cedo primeiro); sem hora vai para o fim.
  // Empate resolvido pela ordem de criação (o findMany já vem por criadoEm asc).
  const firstMinute = (times: Date[]) =>
    times.length
      ? Math.min(...times.map((t) => hhmmToMinutes(dateToTime(t))))
      : Number.POSITIVE_INFINITY;
  const sortedHabits = [...habits].sort(
    (a, b) => firstMinute(a.reminderTimes) - firstMinute(b.reminderTimes),
  );

  return {
    onboarded: true as const,
    today,
    profile: {
      idade: profile.idade,
      acordar: dateToTime(profile.acordar),
      sair: dateToTime(profile.sair),
      chegar: dateToTime(profile.chegar),
    },
    habits: sortedHabits.map((h) => ({
      id: h.id,
      slug: h.slug,
      nome: h.nome,
      schedule: h.schedule,
      isCounter: h.isCounter,
      metaValor: h.metaValor,
      unidade: h.unidade,
      icon: h.icon,
      pontos: h.pontosPorConclusao,
      horas: h.reminderTimes.map(dateToTime),
    })),
    water: waterConfig
      ? {
          goalMl: waterConfig.goalMl,
          cupMl: waterConfig.cupMl,
          reminderTimes: waterConfig.reminderTimes.map(dateToTime),
          lembretesAtivos: waterConfig.lembretesAtivos,
          currentMl: aguaLog?.valor ?? 0,
        }
      : null,
    logs: Object.fromEntries(
      logs.map((l) => [l.habitId, { concluido: l.concluido, valor: l.valor }]),
    ),
    streaks: Object.fromEntries(
      streaks.map((s) => [s.habitId, { atual: s.atual, maior: s.maior }]),
    ),
    pontos: pontuacao?.pontosTotais ?? 0,
    diaStreak,
    conquistas: conquistas.map((c) => c.chave),
  };
}
