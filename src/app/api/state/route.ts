import { NextResponse } from "next/server";
import { getAppState } from "@/lib/app-state";

// Estado completo do device para hoje (Maputo).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId em falta." }, { status: 400 });
  }
  return NextResponse.json(await getAppState(deviceId));
}
