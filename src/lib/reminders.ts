import { prisma } from "@/lib/prisma";
import { isPushConfigured, webpush } from "@/lib/webpush";
import { hhmmToMinutes, maputoDateString, maputoMinutesOfDay } from "@/lib/time";
import { dateOnly, dateToTime } from "@/lib/db-time";

// Janela alinhada ao cron de 5 min.
const WINDOW_MIN = 5;

// Dispara os lembretes de água devidos na janela atual. Partilhado pela função
// agendada do Inngest e pelo endpoint HTTP (/api/cron/check-reminders).
export async function dispatchDueReminders(): Promise<{ sent: number }> {
  if (!isPushConfigured) return { sent: 0 };

  const nowMin = maputoMinutesOfDay();
  const today = maputoDateString();
  const todayDate = dateOnly(today);

  const configs = await prisma.waterConfig.findMany();
  let sent = 0;

  for (const cfg of configs) {
    const { deviceId } = cfg;
    if (!cfg.lembretesAtivos) continue;

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

  return { sent };
}
