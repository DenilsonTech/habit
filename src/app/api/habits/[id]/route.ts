import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Edita/desativa um hábito. Desativar (ativo=false) é um soft-delete: o hábito
// deixa de aparecer, mas os daily_logs, streaks e pontos mantêm-se (PRD 10.3).
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const deviceId = body?.deviceId;

  if (typeof deviceId !== "string") {
    return NextResponse.json({ error: "deviceId em falta." }, { status: 400 });
  }

  const habit = await prisma.habit.findFirst({ where: { id, deviceId } });
  if (!habit) {
    return NextResponse.json({ error: "Hábito não encontrado." }, { status: 404 });
  }

  const data: { ativo?: boolean; nome?: string; descricao?: string | null } = {};
  if (typeof body.ativo === "boolean") data.ativo = body.ativo;
  if (typeof body.nome === "string" && body.nome.trim() !== "")
    data.nome = body.nome.trim();
  if (typeof body.descricao === "string")
    data.descricao = body.descricao.trim() || null;

  await prisma.habit.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
