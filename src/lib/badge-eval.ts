import { prisma } from "@/lib/prisma";
import { maputoDateString } from "@/lib/time";
import { computeStreak } from "@/lib/streak";
import { BADGES, type BadgeStats } from "@/lib/badges";

// Calcula as estatísticas do device para avaliar conquistas.
export async function computeBadgeStats(deviceId: string): Promise<BadgeStats> {
  const [totalConclusoes, diasConcluidos, agua, habitosCriados] =
    await Promise.all([
      prisma.dailyLog.count({ where: { deviceId, concluido: true } }),
      prisma.dailyLog.findMany({
        where: { deviceId, concluido: true },
        select: { logDate: true },
        distinct: ["logDate"],
      }),
      prisma.habit.findFirst({ where: { deviceId, slug: "agua" } }),
      prisma.habit.count({ where: { deviceId, slug: { not: "agua" } } }),
    ]);

  const diasAtivos = new Set(
    diasConcluidos.map((l) => l.logDate.toISOString().slice(0, 10)),
  );
  const diaStreak = computeStreak([], diasAtivos, maputoDateString());

  const aguaDias = agua
    ? await prisma.dailyLog.count({
        where: { deviceId, habitId: agua.id, concluido: true },
      })
    : 0;

  return { totalConclusoes, diaStreak, aguaDias, habitosCriados };
}

// Avalia o catálogo, insere as conquistas novas (idempotente pela @@unique) e
// devolve as chaves acabadas de desbloquear (para a celebração no cliente).
export async function evaluateBadges(deviceId: string): Promise<string[]> {
  const stats = await computeBadgeStats(deviceId);
  const merecidas = BADGES.filter((b) => b.desbloqueado(stats)).map(
    (b) => b.chave,
  );
  if (merecidas.length === 0) return [];

  const existentes = new Set(
    (
      await prisma.conquista.findMany({
        where: { deviceId, chave: { in: merecidas } },
        select: { chave: true },
      })
    ).map((c) => c.chave),
  );
  const novas = merecidas.filter((c) => !existentes.has(c));
  if (novas.length === 0) return [];

  await prisma.conquista.createMany({
    data: novas.map((chave) => ({ deviceId, chave })),
    skipDuplicates: true,
  });
  return novas;
}
