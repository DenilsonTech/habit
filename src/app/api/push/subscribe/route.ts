import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Regista (upsert) a subscription de push do device.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const deviceId = body?.deviceId;
  const subscription = body?.subscription;

  if (
    typeof deviceId !== "string" ||
    !subscription?.endpoint ||
    !subscription?.keys?.p256dh ||
    !subscription?.keys?.auth
  ) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) {
    return NextResponse.json({ error: "Dispositivo desconhecido." }, { status: 404 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      deviceId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    update: {
      deviceId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });

  return NextResponse.json({ ok: true });
}

// Remove a subscription (ao desativar notificações).
export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  const endpoint = body?.endpoint;
  if (typeof endpoint === "string") {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }
  return NextResponse.json({ ok: true });
}
