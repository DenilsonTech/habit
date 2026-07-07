import { prisma } from "@/lib/prisma";
import { isPushConfigured, webpush } from "@/lib/webpush";
import {
  hhmmToMinutes,
  maputoDateString,
  maputoMinutesOfDay,
} from "@/lib/time";
import { dateOnly, dateToTime } from "@/lib/db-time";
import { aplicaNoDia } from "@/lib/dias";

// Catch-up: envia lembretes cuja hora já passou há no máximo este tempo. Torna
// o dispatch robusto ao jitter/atrasos/saltos do cron (um run em falha é
// apanhado pelo seguinte) sem disparar um "burst" após um downtime longo.
const MAX_LATE_MIN = 30;

// Dispara os lembretes devidos (água + hábitos). Partilhado pela função agendada
// do Inngest e pelo endpoint HTTP (/api/cron/check-reminders). Idempotente: o
// reminderDispatchLog garante um envio por (device, hábito, hora, dia).
export async function dispatchDueReminders(): Promise<{ sent: number }> {
  if (!isPushConfigured) return { sent: 0 };

  const nowMin = maputoMinutesOfDay();
  const today = maputoDateString();
  const todayDate = dateOnly(today);

  // Só interessam devices com pelo menos uma subscrição de push.
  const subbed = new Set(
    (
      await prisma.pushSubscription.findMany({
        select: { deviceId: true },
        distinct: ["deviceId"],
      })
    ).map((s) => s.deviceId),
  );
  if (subbed.size === 0) return { sent: 0 };

  let sent = 0;

  // Hora (@db.Time) devida agora, com tolerância de catch-up.
  const isDue = (t: Date) => {
    const m = hhmmToMinutes(dateToTime(t));
    return m <= nowMin && m > nowMin - MAX_LATE_MIN;
  };

  // Reserva atomicamente o envio; devolve false se já foi feito (evita duplicados
  // mesmo com runs concorrentes — apanha a violação de unicidade).
  const claim = async (deviceId: string, habitId: string, reminderTime: Date) => {
    try {
      await prisma.reminderDispatchLog.create({
        data: { deviceId, habitId, dispatchDate: todayDate, reminderTime },
      });
      return true;
    } catch {
      return false;
    }
  };

  const push = async (deviceId: string, title: string, body: string) => {
    const subs = await prisma.pushSubscription.findMany({ where: { deviceId } });
    const payload = JSON.stringify({ title, body, data: { url: "/" } });
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
  };

  // ---- Água (horários vêm do water_config) ----
  const configs = await prisma.waterConfig.findMany({
    where: { lembretesAtivos: true },
  });
  for (const cfg of configs) {
    if (!subbed.has(cfg.deviceId)) continue;
    const due = cfg.reminderTimes.filter(isDue);
    if (due.length === 0) continue;

    const agua = await prisma.habit.findFirst({
      where: { deviceId: cfg.deviceId, slug: "agua", ativo: true },
    });
    if (!agua) continue;

    const log = await prisma.dailyLog.findUnique({
      where: {
        deviceId_habitId_logDate: {
          deviceId: cfg.deviceId,
          habitId: agua.id,
          logDate: todayDate,
        },
      },
    });
    const currentMl = log?.valor ?? 0;
    const cups = Math.round(currentMl / cfg.cupMl);
    const goalCups = Math.round(cfg.goalMl / cfg.cupMl);

    for (const t of due) {
      if (!(await claim(cfg.deviceId, agua.id, t))) continue;
      if (currentMl >= cfg.goalMl) continue; // meta atingida, não incomodar
      await push(
        cfg.deviceId,
        "Hora de beber água",
        `Já bebeste ${cups} de ${goalCups} copos hoje.`,
      );
    }
  }

  // ---- Hábitos (horários próprios; a água tem reminderTimes vazio -> ignorada) ----
  const habits = await prisma.habit.findMany({
    where: { ativo: true, lembrete: true },
  });
  for (const h of habits) {
    if (!subbed.has(h.deviceId)) continue;
    if (h.reminderTimes.length === 0) continue;
    if (!aplicaNoDia(h.dias, today)) continue;

    const due = h.reminderTimes.filter(isDue);
    if (due.length === 0) continue;

    const log = await prisma.dailyLog.findUnique({
      where: {
        deviceId_habitId_logDate: {
          deviceId: h.deviceId,
          habitId: h.id,
          logDate: todayDate,
        },
      },
    });
    const doneToday = log?.concluido ?? false;

    for (const t of due) {
      if (!(await claim(h.deviceId, h.id, t))) continue;
      if (doneToday) continue; // já feito hoje, não incomodar
      await push(h.deviceId, "Lembrete de hábito", `Está na hora: ${h.nome}.`);
    }
  }

  return { sent };
}
