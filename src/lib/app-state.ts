import { prisma } from "@/lib/prisma";
import { dateOnly, dateToTime } from "@/lib/db-time";
import { maputoDateString } from "@/lib/time";

// Constrói o estado completo do device para hoje (Maputo). Partilhado por
// /api/state e /api/onboarding (para priming do cache sem refetch).
export async function getAppState(deviceId: string) {
  const profile = await prisma.profile.findUnique({ where: { deviceId } });
  if (!profile) return { onboarded: false as const };

  const today = maputoDateString();
  const [habits, waterConfig, pontuacao, logs, streaks] = await Promise.all([
    prisma.habit.findMany({
      where: { deviceId, ativo: true },
      orderBy: { criadoEm: "asc" },
    }),
    prisma.waterConfig.findUnique({ where: { deviceId } }),
    prisma.pontuacao.findUnique({ where: { deviceId } }),
    prisma.dailyLog.findMany({ where: { deviceId, logDate: dateOnly(today) } }),
    prisma.streak.findMany({ where: { deviceId } }),
  ]);

  const aguaHabit = habits.find((h) => h.slug === "agua");
  const aguaLog = aguaHabit
    ? logs.find((l) => l.habitId === aguaHabit.id)
    : undefined;

  return {
    onboarded: true as const,
    today,
    profile: {
      idade: profile.idade,
      acordar: dateToTime(profile.acordar),
      sair: dateToTime(profile.sair),
      chegar: dateToTime(profile.chegar),
    },
    habits: habits.map((h) => ({
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
  };
}
