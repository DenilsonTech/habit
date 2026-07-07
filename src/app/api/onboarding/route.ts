import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_CUP_ML,
  DEFAULT_GOAL_ML,
  DEFAULT_PROFILE,
  PREDEFINED_HABITS,
  cupsFromGoal,
  generateReminderTimes,
} from "@/lib/seed";
import { timeToDate } from "@/lib/db-time";
import { getAppState } from "@/lib/app-state";

// Cria device + perfil + seed dos 5 hábitos + water_config + pontuação.
// Idempotente: reexecutar não duplica hábitos.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const deviceId: unknown = body.deviceId;
  const idade: unknown = body.idade;
  const acordar = typeof body.acordar === "string" ? body.acordar : DEFAULT_PROFILE.acordar;
  const sair = typeof body.sair === "string" ? body.sair : DEFAULT_PROFILE.sair;
  const chegar = typeof body.chegar === "string" ? body.chegar : DEFAULT_PROFILE.chegar;
  const goalMl = typeof body.goalMl === "number" ? body.goalMl : DEFAULT_GOAL_ML;
  const cupMl = typeof body.cupMl === "number" ? body.cupMl : DEFAULT_CUP_ML;

  if (typeof deviceId !== "string" || deviceId.length < 10) {
    return NextResponse.json({ error: "deviceId em falta." }, { status: 400 });
  }
  if (typeof idade !== "number" || idade < 1 || idade > 120) {
    return NextResponse.json({ error: "Idade inválida." }, { status: 400 });
  }

  await prisma.device.upsert({
    where: { id: deviceId },
    create: { id: deviceId },
    update: {},
  });

  await prisma.profile.upsert({
    where: { deviceId },
    create: {
      deviceId,
      idade,
      acordar: timeToDate(acordar),
      sair: timeToDate(sair),
      chegar: timeToDate(chegar),
    },
    update: {
      idade,
      acordar: timeToDate(acordar),
      sair: timeToDate(sair),
      chegar: timeToDate(chegar),
    },
  });

  const reminderTimes = generateReminderTimes(
    acordar,
    chegar,
    cupsFromGoal(goalMl, cupMl),
  ).map(timeToDate);
  await prisma.waterConfig.upsert({
    where: { deviceId },
    create: { deviceId, goalMl, cupMl, reminderTimes },
    update: { goalMl, cupMl, reminderTimes },
  });

  await prisma.pontuacao.upsert({
    where: { deviceId },
    create: { deviceId, pontosTotais: 0 },
    update: {},
  });

  // Semeia os hábitos só se ainda não existirem (idempotência).
  const existing = await prisma.habit.count({ where: { deviceId } });
  if (existing === 0) {
    for (const h of PREDEFINED_HABITS) {
      const habit = await prisma.habit.create({
        data: {
          deviceId,
          slug: h.slug,
          nome: h.nome,
          dias: h.dias,
          isCounter: h.isCounter,
          unidade: h.unidade,
          metaValor: h.isCounter ? goalMl : null,
          pontosPorConclusao: h.pontosPorConclusao,
          icon: h.icon,
          reminderTimes: h.reminderTimes.map(timeToDate),
        },
      });
      await prisma.streak.create({ data: { deviceId, habitId: habit.id } });
    }
  }

  return NextResponse.json({ ok: true, state: await getAppState(deviceId) });
}
