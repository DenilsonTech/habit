import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dateToTime, timeToDate } from "@/lib/db-time";
import { cupsFromGoal, generateReminderTimes } from "@/lib/seed";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

function serialize(cfg: {
  goalMl: number;
  cupMl: number;
  reminderTimes: Date[];
  lembretesAtivos: boolean;
}) {
  return {
    goalMl: cfg.goalMl,
    cupMl: cfg.cupMl,
    cups: cupsFromGoal(cfg.goalMl, cfg.cupMl),
    reminderTimes: cfg.reminderTimes.map(dateToTime),
    lembretesAtivos: cfg.lembretesAtivos,
  };
}

// GET /api/water-config?deviceId=... — config de água do device.
export async function GET(request: Request) {
  const deviceId = new URL(request.url).searchParams.get("deviceId");
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId em falta." }, { status: 400 });
  }
  const cfg = await prisma.waterConfig.findUnique({ where: { deviceId } });
  if (!cfg) {
    return NextResponse.json({ error: "Configuração não encontrada." }, { status: 404 });
  }
  return NextResponse.json(serialize(cfg));
}

// PATCH /api/water-config — atualiza meta (regenera horários, 1 por copo),
// horários manuais e/ou o toggle de lembretes.
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const deviceId: unknown = body?.deviceId;
  if (typeof deviceId !== "string") {
    return NextResponse.json({ error: "deviceId em falta." }, { status: 400 });
  }

  const cfg = await prisma.waterConfig.findUnique({ where: { deviceId } });
  if (!cfg) {
    return NextResponse.json({ error: "Configuração não encontrada." }, { status: 404 });
  }

  const data: {
    goalMl?: number;
    reminderTimes?: Date[];
    lembretesAtivos?: boolean;
  } = {};

  // Mudança de meta -> regenera os horários (um por copo) a partir da rotina.
  if (typeof body.goalMl === "number") {
    const goalMl = Math.round(body.goalMl);
    if (goalMl < cfg.cupMl || goalMl > 6000) {
      return NextResponse.json({ error: "Meta inválida." }, { status: 400 });
    }
    data.goalMl = goalMl;
    const profile = await prisma.profile.findUnique({ where: { deviceId } });
    const acordar = profile ? dateToTime(profile.acordar) : "07:00";
    const chegar = profile ? dateToTime(profile.chegar) : "21:00";
    data.reminderTimes = generateReminderTimes(
      acordar,
      chegar,
      cupsFromGoal(goalMl, cfg.cupMl),
    ).map(timeToDate);
  } else if (Array.isArray(body.reminderTimes)) {
    const times: string[] = body.reminderTimes;
    if (!times.every((t) => typeof t === "string" && HHMM.test(t))) {
      return NextResponse.json({ error: "Horário inválido." }, { status: 400 });
    }
    data.reminderTimes = times.map(timeToDate);
  }

  if (typeof body.lembretesAtivos === "boolean") {
    data.lembretesAtivos = body.lembretesAtivos;
  }

  const updated = await prisma.waterConfig.update({ where: { deviceId }, data });
  return NextResponse.json(serialize(updated));
}
