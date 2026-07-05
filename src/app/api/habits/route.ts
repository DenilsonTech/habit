import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dateToTime, timeToDate } from "@/lib/db-time";
import { evaluateBadges } from "@/lib/badge-eval";

// Cria um hábito custom a partir do drawer do Add.
// Mapeamento para o schema atual (mosaico/multi-etapas/temporizador ficam para
// a expansão futura do modelo — ver ADD-FLOW.md):
//  - dias -> schedule (weekdays se só dias úteis; caso contrário daily)
//  - tipo -> boolean por agora (só a água é contador)
//  - horarios -> reminderTimes (se lembrete ligado)
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { deviceId } = body;
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const descricao =
    typeof body.descricao === "string" && body.descricao.trim() !== ""
      ? body.descricao.trim()
      : null;
  const dias: string[] = Array.isArray(body.dias) ? body.dias : [];
  const lembrete = Boolean(body.lembrete);
  const horarios: string[] = Array.isArray(body.horarios) ? body.horarios : [];
  const icon =
    typeof body.icon === "string" && body.icon ? body.icon : "circle";

  if (typeof deviceId !== "string") {
    return NextResponse.json({ error: "deviceId em falta." }, { status: 400 });
  }
  if (nome === "") {
    return NextResponse.json({ error: "Nome em falta." }, { status: 400 });
  }

  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) {
    return NextResponse.json({ error: "Dispositivo desconhecido." }, { status: 404 });
  }

  const temFimDeSemana = dias.includes("sab") || dias.includes("dom");
  const schedule = dias.length > 0 && !temFimDeSemana ? "weekdays" : "daily";

  const habit = await prisma.habit.create({
    data: {
      deviceId,
      slug: `custom-${crypto.randomUUID()}`,
      nome,
      descricao,
      schedule,
      isCounter: false,
      unidade: null,
      metaValor: null,
      pontosPorConclusao: 10,
      icon,
      reminderTimes: lembrete ? horarios.map(timeToDate) : [],
      lembrete,
    },
  });
  await prisma.streak.create({ data: { deviceId, habitId: habit.id } });

  const novasConquistas = await evaluateBadges(deviceId);

  return NextResponse.json({
    ok: true,
    novasConquistas,
    habit: {
      id: habit.id,
      slug: habit.slug,
      nome: habit.nome,
      schedule: habit.schedule,
      isCounter: habit.isCounter,
      metaValor: habit.metaValor,
      unidade: habit.unidade,
      icon: habit.icon,
      pontos: habit.pontosPorConclusao,
      horas: habit.reminderTimes.map(dateToTime),
    },
  });
}
