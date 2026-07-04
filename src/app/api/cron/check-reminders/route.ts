import { NextResponse } from "next/server";
import { dispatchDueReminders } from "@/lib/reminders";

// Endpoint HTTP protegido (fallback: cron-job.org / GitHub Actions).
// A mesma lógica corre também via função agendada do Inngest.
export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const result = await dispatchDueReminders();
  return NextResponse.json({ ok: true, ...result });
}
