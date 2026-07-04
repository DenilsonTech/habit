"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { SettingsHeader } from "@/components/settings/settings-header";
import { SettingsGroup } from "@/components/settings/settings-group";
import { SettingRow } from "@/components/settings/setting-row";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { getStoredDeviceId } from "@/lib/device";
import { useAppState, useRemoveHabit } from "@/lib/queries";
import { habitIcon } from "@/lib/habit-icons";

export default function HabitosPage() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  useEffect(() => setDeviceId(getStoredDeviceId()), []);
  const { data: state } = useAppState(deviceId);
  const removeHabit = useRemoveHabit(deviceId ?? "");
  const habits = state?.habits ?? [];

  const [toDelete, setToDelete] = useState<{ id: string; nome: string } | null>(
    null,
  );

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-5 pt-safe pb-10">
      <SettingsHeader title="Os meus hábitos" />

      <div className="mt-6">
        {habits.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Ainda não tens hábitos.
          </p>
        ) : (
          <SettingsGroup>
            {habits.map((h) => (
              <SettingRow
                key={h.id}
                icon={habitIcon(h.icon)}
                label={h.nome}
                trailing={
                  h.slug === "agua" ? (
                    <span className="text-xs text-muted-foreground">Base</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setToDelete({ id: h.id, nome: h.nome })}
                      aria-label={`Remover ${h.nome}`}
                      className="text-destructive/80 transition-colors hover:text-destructive"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={18} strokeWidth={1.8} />
                    </button>
                  )
                }
              />
            ))}
          </SettingsGroup>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => {
          if (!o) setToDelete(null);
        }}
        title="Remover hábito?"
        description={
          toDelete
            ? `"${toDelete.nome}" deixa de aparecer, mas o histórico e os pontos mantêm-se.`
            : undefined
        }
        confirmLabel="Remover"
        danger
        onConfirm={() => {
          if (toDelete) removeHabit.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
