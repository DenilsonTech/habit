import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dateOnly } from "@/lib/db-time";
import { maputoDateString } from "@/lib/time";
import { computeStreak } from "@/lib/streak";

// Regista/atualiza a conclusão de um hábito num dia e recalcula streak + pontos.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { deviceId, habitId } = body;
  if (typeof deviceId !== "string" || typeof habitId !== "string") {
    return NextResponse.json(
      { error: "deviceId/habitId em falta." },
      { status: 400 },
    );
  }

  const habit = await prisma.habit.findFirst({ where: { id: habitId, deviceId } });
  if (!habit) {
    return NextResponse.json({ error: "Hábito não encontrado." }, { status: 404 });
  }

  const dateStr = typeof body.date === "string" ? body.date : maputoDateString();
  const logDate = dateOnly(dateStr);

  let concluido: boolean;
  let valor: number | null = null;
  if (habit.isCounter) {
    valor = Math.max(0, Number(body.valor ?? 0));
    concluido = habit.metaValor != null && valor >= habit.metaValor;
  } else {
    concluido = Boolean(body.concluido);
  }

  await prisma.dailyLog.upsert({
    where: { deviceId_habitId_logDate: { deviceId, habitId, logDate } },
    create: { deviceId, habitId, logDate, concluido, valor },
    update: { concluido, valor },
  });

  // Recalcula a streak deste hábito.
  const concluidoLogs = await prisma.dailyLog.findMany({
    where: { deviceId, habitId, concluido: true },
    select: { logDate: true },
  });
  const dates = new Set(
    concluidoLogs.map((l) => l.logDate.toISOString().slice(0, 10)),
  );
  const atual = computeStreak(habit.schedule, dates, maputoDateString());
  const prev = await prisma.streak.findUnique({
    where: { deviceId_habitId: { deviceId, habitId } },
  });
  const maior = Math.max(prev?.maior ?? 0, atual);
  await prisma.streak.upsert({
    where: { deviceId_habitId: { deviceId, habitId } },
    create: { deviceId, habitId, atual, maior, ultimaData: logDate },
    update: { atual, maior, ultimaData: logDate },
  });

  // Recalcula os pontos totais (soma dos pontos de cada log concluído).
  const todosConcluidos = await prisma.dailyLog.findMany({
    where: { deviceId, concluido: true },
    select: { habit: { select: { pontosPorConclusao: true } } },
  });
  const pontos = todosConcluidos.reduce(
    (sum, l) => sum + l.habit.pontosPorConclusao,
    0,
  );
  await prisma.pontuacao.upsert({
    where: { deviceId },
    create: { deviceId, pontosTotais: pontos },
    update: { pontosTotais: pontos },
  });

  return NextResponse.json({
    ok: true,
    concluido,
    valor,
    streak: { atual, maior },
    pontos,
  });
}
