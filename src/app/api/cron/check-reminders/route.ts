import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPushConfigured, webpush } from "@/lib/webpush";
import { hhmmToMinutes, maputoDateString, maputoMinutesOfDay } from "@/lib/time";
import { dateOnly, dateToTime } from "@/lib/db-time";

// Janela alinhada ao cron de 5 min. Chamado pelo GitHub Actions com o CRON_SECRET.
const WINDOW_MIN = 5;

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  if (!isPushConfigured) {
    return NextResponse.json({ error: "VAPID não configurado." }, { status: 500 });
  }

  const nowMin = maputoMinutesOfDay();
  const today = maputoDateString();
  const todayDate = dateOnly(today);

  const configs = await prisma.waterConfig.findMany();
  let sent = 0;

  for (const cfg of configs) {
    const { deviceId } = cfg;

    // horários dentro da janela (últimos WINDOW_MIN minutos)
    const dueTimes = cfg.reminderTimes.filter((t) => {
      const m = hhmmToMinutes(dateToTime(t));
      return m > nowMin - WINDOW_MIN && m <= nowMin;
    });
    if (dueTimes.length === 0) continue;

    const agua = await prisma.habit.findFirst({
      where: { deviceId, slug: "agua", ativo: true },
    });
    if (!agua) continue;

    const subs = await prisma.pushSubscription.findMany({ where: { deviceId } });
    if (subs.length === 0) continue;

    const log = await prisma.dailyLog.findUnique({
      where: {
        deviceId_habitId_logDate: { deviceId, habitId: agua.id, logDate: todayDate },
      },
    });
    const currentMl = log?.valor ?? 0;
    const cups = Math.round(currentMl / cfg.cupMl);
    const goalCups = Math.round(cfg.goalMl / cfg.cupMl);

    for (const t of dueTimes) {
      // dedup: não reenviar o mesmo horário no mesmo dia
      const already = await prisma.reminderDispatchLog.findUnique({
        where: {
          deviceId_habitId_dispatchDate_reminderTime: {
            deviceId,
            habitId: agua.id,
            dispatchDate: todayDate,
            reminderTime: t,
          },
        },
      });
      if (already) continue;

      // regista já (evita reenvio mesmo que o envio falhe parcialmente)
      await prisma.reminderDispatchLog
        .create({
          data: {
            deviceId,
            habitId: agua.id,
            dispatchDate: todayDate,
            reminderTime: t,
          },
        })
        .catch(() => {});

      // meta já atingida -> não incomodar
      if (currentMl >= cfg.goalMl) continue;

      const payload = JSON.stringify({
        title: "Hora de beber água",
        body: `Já bebeste ${cups} de ${goalCups} copos hoje.`,
        data: { url: "/" },
      });

      for (const s of subs) {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
          );
          sent++;
        } catch (e: unknown) {
          const status = (e as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) {
            await prisma.pushSubscription
              .deleteMany({ where: { endpoint: s.endpoint } })
              .catch(() => {});
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
