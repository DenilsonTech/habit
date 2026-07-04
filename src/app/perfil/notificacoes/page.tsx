"use client";

import { useEffect, useState } from "react";
import { Notification03Icon } from "@hugeicons/core-free-icons";
import { SettingsHeader } from "@/components/settings/settings-header";
import { SettingsGroup } from "@/components/settings/settings-group";
import { SettingRow } from "@/components/settings/setting-row";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ReminderTimesEditor } from "@/components/reminder-times";
import { getStoredDeviceId } from "@/lib/device";
import { useAppState, useSaveWaterConfig } from "@/lib/queries";
import {
  isSubscribed,
  sendTestPush,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push";

const MIN_CUPS = 1;
const MAX_CUPS = 16;

function StepBtn({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-foreground transition-colors active:scale-95 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export default function NotificacoesPage() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [permitir, setPermitir] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setDeviceId(getStoredDeviceId());
    isSubscribed()
      .then(setPermitir)
      .catch(() => {});
  }, []);

  const { data: state } = useAppState(deviceId);
  const water = state?.water ?? null;
  const saveWater = useSaveWaterConfig(deviceId ?? "");
  const cups = water ? Math.max(1, Math.round(water.goalMl / water.cupMl)) : 0;

  async function onTogglePermitir(next: boolean) {
    if (!deviceId) return;
    setBusy(true);
    setMsg(null);
    try {
      if (next) {
        await subscribeToPush(deviceId);
        setPermitir(true);
      } else {
        await unsubscribeFromPush();
        setPermitir(false);
      }
    } catch (e) {
      setPermitir(false);
      setMsg(e instanceof Error ? e.message : "Não foi possível.");
    } finally {
      setBusy(false);
    }
  }

  async function onTest() {
    if (!deviceId) return;
    setBusy(true);
    setMsg(null);
    try {
      const n = await sendTestPush(deviceId);
      setMsg(n > 0 ? "Notificação enviada." : "Nenhuma subscrição para enviar.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Falha ao enviar.");
    } finally {
      setBusy(false);
    }
  }

  function setCups(n: number) {
    if (!water) return;
    const clamped = Math.min(MAX_CUPS, Math.max(MIN_CUPS, n));
    if (clamped === cups) return;
    saveWater.mutate({ goalMl: clamped * water.cupMl });
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-5 pt-safe pb-10">
      <SettingsHeader title="Notificações" />

      <div className="mt-6 space-y-6">
        <div className="space-y-2">
          <SettingsGroup>
            <SettingRow
              icon={Notification03Icon}
              label="Permitir notificações"
              trailing={
                <Switch
                  checked={permitir}
                  disabled={busy}
                  onCheckedChange={onTogglePermitir}
                />
              }
            />
          </SettingsGroup>
          <p className="px-1 text-xs text-muted-foreground">
            Recebe lembretes de água mesmo com a app fechada.
          </p>

          <Button
            variant="secondary"
            onClick={onTest}
            disabled={busy || !permitir}
            className="h-12 w-full rounded-full"
          >
            Enviar notificação de teste
          </Button>
          {msg && (
            <p className="px-1 text-center text-xs text-muted-foreground">
              {msg}
            </p>
          )}
        </div>

        {water && (
          <div className="space-y-2">
            <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Lembretes de água
            </h2>
            <div className="space-y-5 rounded-3xl bg-card p-4">
              {/* Meta diária — cada copo tem o seu lembrete */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Meta diária</p>
                  <p className="text-xs text-muted-foreground">
                    {cups} {cups === 1 ? "copo" : "copos"} · {water.goalMl} ml
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StepBtn
                    onClick={() => setCups(cups - 1)}
                    disabled={cups <= MIN_CUPS}
                    label="Menos um copo"
                  >
                    −
                  </StepBtn>
                  <span className="w-5 text-center text-base font-semibold tabular-nums">
                    {cups}
                  </span>
                  <StepBtn
                    onClick={() => setCups(cups + 1)}
                    disabled={cups >= MAX_CUPS}
                    label="Mais um copo"
                  >
                    +
                  </StepBtn>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Ligar/desligar lembretes */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Ativar lembretes</p>
                  <p className="text-xs text-muted-foreground">
                    Um lembrete por copo, ao longo do dia.
                  </p>
                </div>
                <Switch
                  checked={water.lembretesAtivos}
                  onCheckedChange={(v) =>
                    saveWater.mutate({ lembretesAtivos: v })
                  }
                />
              </div>

              {/* Horários — um por copo */}
              {water.lembretesAtivos && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Horários ({cups})
                  </p>
                  <ReminderTimesEditor
                    lockCount
                    times={water.reminderTimes}
                    onChange={(t) => saveWater.mutate({ reminderTimes: t })}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
