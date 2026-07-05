"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SettingsHeader } from "@/components/settings/settings-header";
import { getStoredDeviceId } from "@/lib/device";
import { useAppState } from "@/lib/queries";
import { BADGES } from "@/lib/badges";
import { cn } from "@/lib/utils";

export default function ConquistasPage() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  useEffect(() => setDeviceId(getStoredDeviceId()), []);

  const { data: state } = useAppState(deviceId);
  const unlocked = new Set(state?.conquistas ?? []);
  const count = BADGES.filter((b) => unlocked.has(b.chave)).length;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-5 pt-safe pb-10">
      <SettingsHeader title="Conquistas" />
      <p className="mt-2 px-1 text-sm text-muted-foreground">
        {count} de {BADGES.length} desbloqueadas
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {BADGES.map((b) => {
          const on = unlocked.has(b.chave);
          return (
            <div
              key={b.chave}
              className={cn(
                "flex flex-col items-center gap-2 rounded-3xl border p-5 text-center transition-colors",
                on
                  ? "border-primary/30 bg-primary/10"
                  : "border-dashed border-border bg-card/40",
              )}
            >
              <div
                className={cn(
                  "flex size-14 items-center justify-center rounded-full",
                  on
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground/40",
                )}
              >
                <HugeiconsIcon icon={b.icon} size={26} strokeWidth={1.8} />
              </div>
              <div className="space-y-0.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    !on && "text-muted-foreground",
                  )}
                >
                  {b.nome}
                </p>
                <p className="text-[0.7rem] leading-tight text-muted-foreground">
                  {b.descricao}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
