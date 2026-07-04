import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPushConfigured, webpush } from "@/lib/webpush";

// Envio de teste para as subscrições do device (uso em desenvolvimento).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const deviceId = body?.deviceId;
  if (typeof deviceId !== "string") {
    return NextResponse.json({ error: "deviceId em falta." }, { status: 400 });
  }
  if (!isPushConfigured) {
    return NextResponse.json(
      { error: "VAPID não configurado no servidor." },
      { status: 500 },
    );
  }

  const subs = await prisma.pushSubscription.findMany({ where: { deviceId } });
  if (subs.length === 0) {
    return NextResponse.json(
      { error: "Sem subscrições. Ativa as notificações primeiro." },
      { status: 400 },
    );
  }

  const payload = JSON.stringify({
    title: "Hora de beber água",
    body: "Notificação de teste — está a funcionar.",
    data: { url: "/" },
  });

  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload,
      );
      sent++;
    } catch (e: unknown) {
      const status = (e as { statusCode?: number })?.statusCode;
      // Subscrição expirada/inválida -> limpar.
      if (status === 404 || status === 410) {
        await prisma.pushSubscription
          .deleteMany({ where: { endpoint: s.endpoint } })
          .catch(() => {});
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
